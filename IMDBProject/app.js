const mongoose = require('mongoose');
const User = require('models/user')
const rp = require('request-promise');
const cheerio = require('cheerio');
var Promise = require("bluebird");

const options = {
    uri: `https://www.imdb.com/chart/top`,
    transform: function (body) {
      return cheerio.load(body);
    }
  };


mongoose.connect('mongodb://localhost:27017/IMDBProject')
    var imdb_user = new User({
        _id: 
    })