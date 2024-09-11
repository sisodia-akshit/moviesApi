const { query } = require('express');
const Movie = require('../Models/movieModel.js');
const ApiFeatures = require('../Utils/ApiFeatures.js');
const asyncErrorHandler = require('../Utils/asyncErrorHandler.js');
const CustomError = require('../Utils/CustomError.js');

exports.getHighestRated=(req,res,next)=>{
  req.query.limit = '5';
  req.query.sort = '-imdbRating';
  next();
}

exports.getAllMovies =asyncErrorHandler(async(req,res,next)=>{
        const features =new ApiFeatures(Movie.find(),req.query)
                                                .filter()
                                                .sort()
                                                .limitFields()
                                                .paginate();
        let movies = await features.query;

        res.status(200).json({
            status:"success",
            length:movies.length,
            data:{
                movies
            }
        })
});

exports.getMovie =asyncErrorHandler(async(req,res,next)=>{
        const movie = await Movie.findById(req.params.id);
        // console.log(req.params.id)

        if(!movie){
            const err = new CustomError("movie with that ID is not Found",404);
            return next(err);
        }
    
        res.status(200).json({
            status:"success",
            data:{
                movie
            }
        })
   
});

exports.createMovie =asyncErrorHandler(async(req,res,next) => {
        const movie = await Movie.create(req.body);

        res.status(201).json({
            status:"success",
            data:{
                movie
            }
        })
   
})

exports.patchMovie = asyncErrorHandler(async(req,res,next)=>{
        const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});

        if(!updatedMovie){
            const err = new CustomError("movie with that ID is not Found",404);
            return next(err);
        }

        res.status(200).json({
            status:"success",
            data:{
                updatedMovie
            }
        })
  
})

exports.deleteMovie =async(req,res,next)=>{
    try{
        const deletedMovie = await Movie.findByIdAndDelete(req.params.id)
    
    if(!deletedMovie){
        const err = new CustomError("movie with that ID is not Found",404);
        return next(err);
    }

    res.status(204).json({
        status:'success',
        data:null
    }) 
    }catch(err){
        res.status(404).json({
            status:'fail',
            message:err.message
        });
    }
    
};

exports.getMovieStats = asyncErrorHandler(async(req,res,next)=>{
        const stats = await Movie.aggregate([
            {$match: {imdbRating:{$gte:4.5}}},
            {$group:{
                _id:'$Year',
                avgRating:{$avg:'$imdbRating'},
                avgRuntime:{$avg:'$Runtime'},
                minRuntime:{$min:'$Runtime'},
                maxRuntime:{$max:'$Runtime'}
            }},
            {$sort:{_id:1}},
            // {$match: {avgRating:7.025}},
        ]);

        res.status(200).json({
            status:'success',
            length:stats.length,
            data:{
                stats
            }
        }) 
});
 
exports.getMovieByGenre=asyncErrorHandler(async(req,res,next)=>{
        const genre = req.params.genre;
        console.log(genre)
        const movies = await Movie.aggregate([
           {$unwind:'$Genre'} ,
           {$group:{
            _id:'$Genre',
            movieCount:{$sum:1},
            movies:{$push:'$Title'}
           }},
           {$addFields:{genre:'$_id'}},
           {$project:{_id:0}},
           {$sort:{movieCount:-1}},
        //    {$limit:5}
           {$match:{genre:genre}}
        ])
        res.status(200).json({
            status:'success',
            length:movies.length,
            data:{
                movies
            }
        })
});