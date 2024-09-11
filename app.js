//import Package
const express = require('express');
const morgan = require('morgan')
const movieRouter = require('./Routes/moviesRoutes.js')
const authRouter = require('./Routes/authRoutes.js')
const userRouter = require('./Routes/userRoutes.js')
const homeRouter = require('./Routes/homeRoutes.js')
const cors =require('cors');



const CustomError = require('./Utils/CustomError.js');
const globleErrorHandler = require('./Controller/errorController.js')
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const sanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

let app = express();
app.use(cors());

app.use(helmet());

let limiter = rateLimit({
    max:1000,
    windowMs:60*60*1000,
    message:"We have received too many requests with this IP.Please try after sometime"
})

app.use('/api',limiter);

app.use(express.json({limit:'10kb'}));

app.use(sanitize());
app.use(xss());
app.use(hpp({whitelist:
    ['Runtime',
    'imdbRating',
    'Year',
    'Genre',
    'Director',
    'Actors',
    'Type',
    'Rated',
    'Released'
]}));

app.use(express.static("./public"))

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

app.use((req,res,next)=>{
    req.requestedAt = new Date().toISOString();
    next();
})

//using routes
app.use('/api/v1/movies',movieRouter);
app.use('/api/v1/auth',authRouter);
app.use('/api/v1/user',userRouter);




// default url should be at last
app.all('*',(req,res,next)=>{
    // res.status(404).json({
    //     status:'fail',
    //     message:`This url ${req.originalUrl} dose't exist on the server.`
    // })

    //*let make it with a diff approach
    // const err = new Error(`This url ${req.originalUrl} dose't exist on the server.`);
    // err.status = 'fail'
    // err.statusCode=404;

    //*let make it with a diff approach
    
    const err = new CustomError(`This url ${req.originalUrl} dose't exist on the server.`,404);

    next(err);
})


app.use(globleErrorHandler)

module.exports = app;