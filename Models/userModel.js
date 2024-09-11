const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
// const { parse } = require('dotenv');
const crypto = require('crypto');

//name email pass confirmPass photu
const userSchema = new mongoose.Schema({
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    name:{
        type:String,
        required:[true,'Please enter your name.']
    },
    email:{
        type:String,
        required:[true,"please enter an email id"],
        unique:true,
        lowercase:true,
        validate:[
            validator.isEmail,
            'Please enter a valid email.'
        ]
    },
    photo:{
        type:String
    },
    password:{
        type:String,
        required:[true,'Please enter a passwod.'],
        minlength:8,
        select:false
    },
    confirmPassword:{
        type:String,
        required:[true,'Please confirm your password.'],
        validate:{
            validator:function(val){
                return val == this.password;
            },
            message:"Password and Confirm Password does not match! "
        }
    },
    active:{
        type:Boolean,
        default:true,
        select:false
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetTokenExpire:Date
});

userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        return next();
    }

    //* Encrypt the password before saving it--
    this.password = await bcrypt.hash(this.password,10);

    this.confirmPassword = undefined;
    next();
})

userSchema.pre(/^find/,function(next){
    //this keyword will point the current query objct
    this.find({active:{$ne:false}});
    next()
})

userSchema.methods.comparePasswordInDb=async function(passwod,passwodDB){
    return await bcrypt.compare(passwod,passwodDB);
}

userSchema.methods.isPasswordChanged=async function(JWTTimeStamp){
    if(this.passwordChangedAt){
        const passChangedTimeStamp=parseInt(this.passwordChangedAt.getTime()/1000)
        console.log(JWTTimeStamp-passChangedTimeStamp);

        return JWTTimeStamp<passChangedTimeStamp;
    }

    return false;
}

userSchema.methods.createResetPassToken=async function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = await crypto.createHash('sha256').update(resetToken).digest('hex');

    this.passwordResetTokenExpire=(Date.now() + (10 *60 *1000));

    // console.log(resetToken);
    // console.log(this.passwordResetToken);

    return resetToken;

}

const user =mongoose.model('User',userSchema);

module.exports = user;
