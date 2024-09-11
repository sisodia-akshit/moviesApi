const mongoose = require('mongoose');
const fs = require('fs');

//creating schema 
const movieSchema = mongoose.Schema({
    Title:{
        type:String,
        required:[true,"Title is required field!"],
        unique:true,
        trim:true
    },
    Year:{
        type:Number,
        required:[true, "Year is required field!"],
        trim:true
    },
    Rated:{
        type:String,
        required:[true,"Rated is required field!"],
        trim:true
    },
    Released:{
        type:String
    },
    Runtime:{
        type:Number,
        required:[true,"duration is required field!"],
        trim:true
    },
    Genre:{
        type:[String],
        required:[true, "Genre is required field!"],
        // enum:{
        //     values:["Action","Adventure","Sci-Fi","Thriller","Crime","Drama","Comedy","Romance","Biography"],
        //     message:"This Genre does not exist!"
        // }
    },
    Director:{
        type:[String],
        required:[true, "Director is a required field!"]
    },
    Writer:{
        type:[String],
        required:[true, "Writer is a required field!"]

    },
    Actors:{
        type:[String],
        required:[true , "Actors is a required field!"]
    },
    Plot:{
        type:String,
        required:[true,"Plot is required field!"],
        trim:true
    },
    Language:{
        type:[String],
        required:[true,"Language is required field!"],
        trim:true
    },
    Country:{
        type:[String],
        required:[true,"Country is required field!"],
        trim:true
    },
    Awards:{
        type:[String],
        required:[true,"Awards is required field!"],
        trim:true
    },
    Poster:{
        type:String,
        required:[true ,"Poster is a required Field !"]
    },
    Metascore:{
        type:String
    },
    imdbRating:{
        type:Number,
        required:[true,"imdbRating is required field!"],
        max:[10,"Ratings must be 10 or below."],
        min:[1,"Ratings must be 1 or above."],
        trim:true
    },
    imdbVotes:{
        type:String,
        required:[true,"imdbVotes is required field!"],
        trim:true
    },
    imdbID:{
        type:String,
        required:[true,"imdbID is required field!"],
        trim:true
    },
    Type:{
        type:String
    },
    Response:{
        type:String
    },
    Images:{
        type:[String],
        required:[true,"Images is required field!"],
        trim:true
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        select:false
    },
    totalSeasons:{
        type:String
    },
    CommingSoon:{
        type:Boolean
    },
    price:{
        type:Number
    },
    createdBy:{
        type:String
    }
  },{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
  })


  movieSchema.virtual('durationInHour').get(function(){
    if(this.Runtime>60){
        return `${Math.floor(this.Runtime/60)} hr ${this.Runtime%60} min`;
    }
  })

//   Executed before document is saved in DB //*it will run whern the .create() or .save method is called *// 
  movieSchema.pre('save',function(next){                                                                                //TODO Document middleware
    this.createdBy = "Akshit Sisodiya";
    next();
  });

  movieSchema.pre(/^find/,function(next){        //any query that starts with find
    this.find({CommingSoon:null})  
    this.startTime =Date.now();                                                                                      //TODO Query Middleware
    next();
  });


  //Executed after document is saved
  movieSchema.post('save',function(doc,next){                                                                           //TODO Document middleware
    const content=`A new movie document with name ${doc.Title} is added by ${doc.createdBy} \n `;
    fs.writeFileSync('./Log/log.txt',content,{flag:'a'},(err)=>{
        console.log(err.message);
    })
    next();
  })

  movieSchema.post(/^find/,function(doc,next){        //any query that starts with find
    this.find({CommingSoon:null})  
    this.endTime =Date.now();                                                                                      //TODO Query Middleware

    const content = `Query took ${this.startTime -this.endTime} milliseconds to fetch document document. /n`;
    fs.writeFileSync('./Log/log.txt',content,{flag:'a'},(err)=>{
        console.log(err.message);
    })
    next();
  });

  //TODO Aggregate Middleware
  movieSchema.pre('aggregate',function(next){
    console.log(this.pipeline().unshift({$match:{CommingSoon:null}}));
    next();
  })

  //create model to use movieSchema
  const Movie = mongoose.model('Movie',movieSchema);

  module.exports = Movie;