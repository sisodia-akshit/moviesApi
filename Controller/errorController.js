const CustomError = require("../Utils/CustomError");

const devErrors =(res,error)=>{
    res.status(error.statusCode).json({
        status:error.statusCode,
        message:error.message,
        stackTrace: error.stack,
        error:error
    })
};

const castErrorHandler=(err)=>{
    const msg = `Invalid value for ${err.path} : ${err.value}!`;
    return new CustomError(msg,400);
}

const duplicateKeyErrorHandler=(err)=>{
    // const name = err.keyValue.Title;
    if(err.keyValue.email){
        const msg = `There is already an Account with this email " ${err.keyValue.email} ". Please try login.`;
        return new CustomError(msg,400);
    }else{
        const msg = `There is already a movie with name: ${err.keyValue.Title} . Please use another name.`;
        return new CustomError(msg,400);
    }
}

const ValidationErrorHandler=(err)=>{
    const errors = Object.values(err.errors).map(currObj=>currObj.message);
    const errMsg = errors.join('. ');
    const msg = `Invalid input data ! ${errMsg}`;
    return new CustomError(msg,400);
}

const TokenExpireErrorHandler=(err)=>{
    return new CustomError("JWT Expired.Please login again.",401);
}
const JsonWebTokenErrorHandler =(err)=>{
    return new CustomError("Invalid token .Please login again.",401);
}

const prodErrors =(res,error)=>{
    if(error.isOperational){
        res.status(error.statusCode).json({
            status:error.statusCode,
            message:error.message
        })
    }else{
        res.status(500).json({
            status:"error",
            message:"Something went wrong! Please try again later."
        })
    }
   
}



module.exports=((error,req,res,next)=>{
    error.statusCode = error.statusCode || 500          //500 = = Inr=ternal server error
    error.status = error.status || 'error';

    if(process.env.NODE_ENV ==='development '){
       devErrors(res,error);
    }
    else if(process.env.NODE_ENV ==='production '){

        if(error.name ==="CastError") error = castErrorHandler(error); 
        if(error.code===11000) error = duplicateKeyErrorHandler(error);
        if(error.name ==="ValidationError") error = ValidationErrorHandler(error);
        if(error.name ==="TokenExpiredError") error = TokenExpireErrorHandler(error);
        if(error.name ==="JsonWebTokenError") error = JsonWebTokenErrorHandler(error)


       prodErrors(res,error);
    }
    
})