const mongoose = require(mongoose)
const Schema = mongoose.Schema;

const userSchema = new Schema({
   _id: Schema.Types.ObjectId,
   name : String,
   role :  Number,
   movies : [{ 
    type: Schema.Types.ObjectId,  
    // title : String,
    // rank : Number,
    // year : Number,
    ref: 'movie'
   }]
});

const User = mongoose.model('user', userSchema)
module.exports = User;