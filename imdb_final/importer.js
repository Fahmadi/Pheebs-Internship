const output = require('./output.json');
const normal = require('./normal')
const {Movie, User} = require('./db')
const { normalize, schema } = require('normalizr')
var Promise = require("bluebird");
const readline = require('readline');

const getNormalizedData = () => {
    const user = new schema.Entity('users');
    const movie = new schema.Entity('movies', {
    stars :[user],
    director: user
    })
    return normalize(output, [movie])
}
async function insertUserToDb (obj) {
    var user = new User ({
        imdbId : obj.id ,
        name : obj.name
    })
    await user.save(function(err) {
        if (err) {console.log(err)
            return
        }})
}

async function findObjectIdByImdbId(str) {
    const result = await User.findOne({ imdbId: str})
    return result._id

}


// findObjectIdByImdbId("nm0000338").then(function(result) {
//    console.log(result) //will log results.
// })



async function findArrayofObjectIdByImdbId(arrs) {
    const arrayResult = await Promise.map(arrs, findObjectIdByImdbId, { concurrency: 10 });
    return arrayResult
}



async function insertMovieToDb (obj) {

    var movie = new Movie ({
        imdbId: obj.id,
        title: obj.name,
        rank: obj.rank,
        rating: obj.rating,
        year: obj.year,
        director: await findObjectIdByImdbId(obj.director),
        stars: await findArrayofObjectIdByImdbId(obj.stars)

    })
  
    await movie.save(function(err) {
        if (err) {console.log(err)
            return
        }})
}

const insertJsonFileToDb = async () => {
        /* insert User to databse */
        userArray =Object.values(normal['entities']['users']) 
        await Promise.map(userArray, insertUserToDb , { concurrency: 10 });
     
        /* insert movies to db */
        movieArray =Object.values(normal['entities']['movies'])
        await Promise.map(movieArray, insertMovieToDb , { concurrency: 10 });

}

// insertJsonFileToDb().catch(console.log)

//1
async function countOfMovie(){
    const res = await Movie.countDocuments()
    return res;
}

// countOfMovie().then(
//     function(result){console.log(result)
// })

//2
async function getTitle(res){
    return res.title
}
async function TenNewMovies(){
   const a = await Movie.find({}).sort('-year')
   const res = a.slice(0,10)
   const temp =await Promise.map(res, getTitle)
   return temp
}

// TenNewMovies().then(function(result){console.log(result)
// })



//3
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


// async function returnMoviesBetweenXandY(){

    //  rl.question('enter the first number : ', async (X) => {
    //     rl.question('enter the second number : ', async (Y) => {
    //         const a = await Movie.find({}).sort('-year').where('year').gt(X).lt(Y).sort('rank')
    //         const temp =await Promise.map(a, getTitle)
    //         console.log(temp)
    //         rl.close();
    //     });
    // });


// returnMoviesBetweenXandY().then(function(result){console.log(result)})

const getInput = (textQuestion) => {
    return new Promise((resolve, reject) => {
        rl.question(textQuestion, (answer) => {
            resolve(answer);    
        })
    })
}


async function returnMoviesBetweenXandY(){
    const X = await getInput('enter the first number : ');
    const Y = await getInput('enter the second number : ');
    const a = await Movie.find({}).sort('-year').where('year').gt(X).lt(Y).sort('rank')
    const temp =await Promise.map(a, getTitle)
    console.log(temp)
    
}

// returnMoviesBetweenXandY().then(function(result){console.log(result)})

async function searchMoviesBaseonStarsAndDirector(){
    console.log('$$$')
    const imdbId = await getInput('enter users imdbId : ');
    console.log(imdbId)
    const res = await findObjectIdByImdbId(imdbId)
    console.log(res)
    const a = await Movie.find( { $or:[ {'stars':res}, {'director':res} ]}).sort('year')
    return a
}

// searchMoviesBaseonStarsAndDirector().then(function(result){
//     console.log('*********',result)
// })


 async function  aggregateOnMovie(){
     const res = await Movie.aggregate(
        [
            {
                $match: {year: {$mod : [ 2, 0 ] }}
            }
        ])
     const temp =await Promise.map(res, getTitle)
     return temp
 }
//  aggregateOnMovie().then(function(result){
     
//      console.log(result)

//  })


async function  evenMovies(){
    const res = await Movie.aggregate(
       [
           {
               $match: {year: {$mod : [ 2, 0 ] }}
           }
           ,
           {   
               $group: {
                   _id : '$title', 
                   year : {$sum : "$year"}
               }
           }
       ])
    return res
}
// evenMovies().then(function(result){
    
//     console.log(result)

// })

async function moviesGroupByAvgRating(){
    const res = await Movie.aggregate([
        
        { $group: { 
            _id: '$year',
            avgRate : { $avg : "$rating"}
        } }
    ])
    return res
}
// moviesGroupByAvgRating().then(function(result){
//     console.log(result)
// })


async function starsActMostMovies(){
    const res = await Movie.aggregate([
        {
            $unwind: '$stars'
        }
        ,
        {
            $lookup:
            {
                from: "users",
                localField: "stars",
                foreignField : "_id",
                as: "stars_doc"
            }
        }
        ,
        {
            $group: {
                _id : '$stars' ,
                count : { $sum : 1},
                name : { $last : '$stars_doc.name'}
            }
        }
        ,
        {$sort: {count: -1}}
        ,
        { $limit: 10 }
    ])
    return res
}
starsActMostMovies().then(function(result){
    console.log(result)})