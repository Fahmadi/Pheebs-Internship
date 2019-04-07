const json_file = require('./output.json');
const {Movie} = require('./db')

const json_func = async () => {
    try{
        await Movie.insertMany(json_file) 
      
    }catch(err){
        console.log(err)
    }
}
module.exports = json_func;
