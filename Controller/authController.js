const User = require('./../Models/userModel');
const asyncErrorHandler = require('../Utils/asyncErrorHandler.js');
const jwt = require('jsonwebtoken');
const CustomError = require('./../Utils/CustomError.js');
// const bcrypt = require('bcryptjs');
const util = require('util');
const sendEmail = require('./../Utils/email.js')
const crypto = require('crypto')


const signToken = (id)=>{
    return jwt.sign({id},process.env.SECRET_STR,{
        expiresIn:process.env.LOGIN_EXPIRES  
    })
}

const createSendResponse = (user,statusCode,res)=>{
    const token = signToken(user._id);

    const options={
        maxAge:process.env.LOGIN_EXPIRES,
        httpOnly:true 
    }
    if(process.env.NODE_ENV==='production '){
        options.secure = true;
    }

    res.cookie('jwt',token,options)
    user.password = undefined;

    res.status(statusCode).json({
        status:'success',
        token,
        data:{
            user
        }
    })
}



exports.signup = asyncErrorHandler(async(req,res,next)=>{
    const newUser = await User.create(req.body);

    createSendResponse(newUser,201,res);
});

exports.login = asyncErrorHandler(async(req,res,next)=>{
    const email = req.body.email;
    const password = req.body.password;
    //or
    // const {email,password}=req.body;
    if(!email || !password){
        const err = new CustomError("Please provide email Id or password for login!",400);
        return next(err);
    }
    const user = await User.findOne({ email }).select('+password'); 

    //Check if the user exist or password matches
    if(!user){
        const err = new CustomError("Incorrect email..User with this email does not exist  ",400);
        return next(err);  
    }

    const isMatch = await user.comparePasswordInDb(password,user.password);

    if(!isMatch){
        const err = new CustomError("Incorrect password",400);
        return next(err);  
    }

    createSendResponse(user,200,res);
})


exports.protect = asyncErrorHandler(async(req,res,next)=>{
    //*read the token if exist
    const testToken = req.headers.authorization;
    // console.log(req.headers)
    let token ;
    if(testToken && testToken.startsWith('Bearer')){
        token = testToken.split(' ')[1]
    }
    if(!token){
        next(new CustomError("You are not logged in!",401))
    }

    //*validate the token 
    const decodedToken= await util.promisify(jwt.verify)(token,process.env.SECRET_STR);
    // console.log(decodedToken)
    //*if the user exist
    const user = await User.find({_id :decodedToken.id});
    // console.log(user[0])

    if(!user[0]){
        const err = new CustomError("Ther user within given token does not exist.",401);
        next(err);
    }

    //*if the password is changed
    const isPasswordChanged = await user[0].isPasswordChanged(decodedToken.iat)
    if(isPasswordChanged){
        const err = new CustomError("The Password has been changed.Please Login again",401);
        return next(err)
    }

    //*Allow user to access route
    req.user=user[0];
    next();
})


exports.restrict=(role)=>{
    return (req,res,next)=>{ 
        if(req.user.role !== role){
            const err = new CustomError("You do not have permission to perform this action.",403);   //!---403 = forbidden
            next(err);
        }
        next();
    }
}


exports.forgotPassword=asyncErrorHandler(async(req,res,next)=>{
    //*get user based on Posted email
    const user = await User.findOne({email:req.body.email});

    if(!user){
        const err = new CustomError("We could not find the user with the given email.",404);
        next(err);
    }
    //* Generate a random token
    const resetToken = await user.createResetPassToken()

    await user.save({validateBeforeSave:false});

    //* Send token back to the user email
    const resetUrl = `${req.protocol}//${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `We have received a password reset request. Please use the below link to reset your password\n\n${resetUrl}\n\nThis reset password link will be valid for 10 min.`

    try{ 
        await sendEmail({
            email:user.email,
            subject:'Password change req received',
            message: message
        });

        res.status(200).json({
            status:'success',
            message:"Password reset link send to the users email."
        })

    }catch(error){
        user.passwordResetToken=undefined;
        user.passwordResetTokenExpire=undefined;
        user.save({validateBeforeSave:false});

        return next(new CustomError("There was an error in sending password reset email. Please try again later...",500))
    }
   

})

exports.resetPassword=asyncErrorHandler(async(req,res,next)=>{
    //* if the user exist with the given token or token is not expired
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({passwordResetToken:token,passwordResetTokenExpire:{$gt:Date.now()}});

    console.log(user);
    if(!user){
        const err = new CustomError("Token is Invalid or has Expired!",400);
        next(err);
    }

    //* reseting users password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken= undefined;
    user.passwordResetTokenExpire= undefined;
    user.passwordChangedAt = Date.now();

    user.save();

    createSendResponse(user,200,res);
});





