const mongoose = require('mongoose')
const Schema = mongoose.Schema;


mongoose.connect('mongodb://localhost:27017/imdb_crowler', { useNewUrlParser: true }, (err) => {
    if(err) console.log(err)
    console.log('connected')
});

const userSchema = new Schema({
    id: String,
    name: String,
  
});
var User = mongoose.model('user', userSchema);

const movieSchema = new Schema({
    id: String,
    title: String,
    rank: Number,
    year: Number,
    stars:[{
        type: Schema.Types.ObjectId,
        ref: 'userSchema'

    }],
    director:{
        type: Schema.Types.ObjectId,
        ref: 'userSchema'

    }
});
var Movie = mongoose.model('movie', movieSchema);

module.exports = {Movie, User}

