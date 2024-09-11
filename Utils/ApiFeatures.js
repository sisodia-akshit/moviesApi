class ApiFeatures{
    constructor(query,queryStr){  
        this.query = query;
        this.queryStr =queryStr;
    }

    filter(){
        const excludeFields = ['sort','page','limit','fields'];
        const QueryObj ={...this.queryStr}
        excludeFields.forEach((currElem)=>{
            delete QueryObj[currElem]; 
        })

        let queryString = JSON.stringify(QueryObj);
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g,(match)=>`$${match}`);
        const queryObj = JSON.parse(queryString);

        this.query =  this.query.find(queryObj);

        return this;
    }

    sort(){
        if(this.queryStr.sort){
            const sortBy = this.queryStr.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }else{
            // query = query.sort('-createdAt');
            this.query = this.query.sort();
        }
        return this;
    }

    limitFields(){
        if(this.queryStr.fields){
            const fields = this.queryStr.fields.split(',').join(' ');
            this.query = this.query.select(fields)
        }else{
            this.query = this.query.select('-__v')
        }
        return this;
    }

    paginate(){
        const limit = this.queryStr.limit*1 || 10;
        const page = this.queryStr.page*1 || 1;
        //for skiping pages when move to another page
        const skip =((page - 1) * limit);
        this.query = this.query.skip(skip).limit(limit);

        //Throw an error when we have no page to show
        // if(this.queryStr.page){
        //     const moviesCount = await Movie.countDocuments();
        //     if(skip>=moviesCount){
        //         throw new Error("This Page is not Found");
        //     }
        // }

        return this;
    }
}
module.exports = ApiFeatures;