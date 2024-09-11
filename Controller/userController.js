const User = require('./../Models/userModel');
const asyncErrorHandler = require('../Utils/asyncErrorHandler.js');
const jwt = require('jsonwebtoken');
const CustomError = require('./../Utils/CustomError.js');
// const bcrypt = require('bcryptjs');
const util = require('util');
const sendEmail = require('./../Utils/email.js')
const crypto = require('crypto')
const authController = require('./authController.js')

exports.profile=asyncErrorHandler(async(req,res,next)=>{

    const loggedUser = req.user
    res.status(200).json({
        status:'success',
        loggedUser,
    })
})

exports.getAllUsers=asyncErrorHandler(async(req,res,next)=>{
    const users = await User.find();

    const loggedUser = req.user
    res.status(200).json({
        status:'success',
        result:users.length,
        loggedUser,
        data:{
            users
        }
    })
})

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

    user.password =undefined;

    res.status(statusCode).json({
        status:'success',
        token,
        data:{
            user
        }
    })
}

const filterReqObj = (obj,...allowedFields)=>{
    let newObj = {};
    console.log(allowedFields);
    Object.keys(obj).forEach(prop=>{
        if(allowedFields.includes(prop)){
            newObj[prop] = obj[prop];   
        }
    })
    return newObj;
}

exports.updatePassword=asyncErrorHandler(async(req,res,next)=>{
    //*get current user data from the database
    const user =await User.findOne(req.user._id).select('+password');

    //*check if the supplied password is correct
    const isPassCorrect = await user.comparePasswordInDb(req.body.currentPassword,user.password);

    if(!isPassCorrect){
        return next(new CustomError("The Current password you provided is incorrect!",401));
    }

    //if the the password is correct ,update user password with new value
    user.password = req.body.password;
    user.confirmPassword= req.body.confirmPassword;
    await user.save();

    //login the user& send new jwt
    createSendResponse(user,200,res);

})


exports.updateMe=asyncErrorHandler(async(req,res,next)=>{
    //check if body contains password or confirmPassword
    if(req.body.password || req.body.confirmPassword){
        return next(new CustomError("You cannot update your password using this endpoint",400));
    }

    //* Update users details
    const filterObj = filterReqObj(req.body,'name','email');
    const updateUser = await User.findByIdAndUpdate(req.user._id,filterObj,{runValidators:true,new:true});

    res.status(200).json({
        status:'success',
        user:updateUser
    })

})

exports.deleteMe=asyncErrorHandler(async(req,res,next)=>{
    await User.findByIdAndUpdate(req.user._id,{active:false});

    res.status(204).json({                  //204= deleted
        status:'success',
        data:null
    })

})