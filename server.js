const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'})

process.on('uncaughtException',(error)=>{
      console.error('COULD NOT CONNECT TO DATABASE:',error.name, error.message);
      console.error("Uncaught Exception Occur! Shutting down...")
      process.exit(1);
})



const app = require('./app');


const connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.CONN_STR,{});
        // console.log(conn);
        console.log("DB Connection Successful")
    }catch(error){
        console.error('COULD NOT CONNECT TO DATABASE:',error.name, error.message);
        console.error("Unhandled Error Occur! Shutting down...")
        server.close(()=>{
          process.exit(1);
        })
    }
  }



console.log(process.env)

//Create a server
const port =process.env.PORT || 3000;

const server = app.listen(port,()=>{
    console.log('Server has Started.')
})
connectDB();