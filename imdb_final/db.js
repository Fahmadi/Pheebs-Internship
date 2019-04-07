const mongoose = require('mongoose')
const Schema = mongoose.Schema;


mongoose.connect('mongodb://localhost:27017/IMDB', { useNewUrlParser: true })

const userSchema = new Schema({
    imdbId: String,
    name: String,
  
});
var User = mongoose.model('user', userSchema);

const movieSchema = new Schema({
    imdbId: String,
    title: String,
    rank: Number,
    year: Number,
    rating: Number,
    stars:[{
        type: Schema.Types.ObjectId,
        ref: 'user'

    }],
    director:{
        type: Schema.Types.ObjectId,
        ref: 'user'

    }
});
var Movie = mongoose.model('movie', movieSchema);

module.exports = {Movie, User}

