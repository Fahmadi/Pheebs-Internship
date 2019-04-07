var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Book = require('./book');
var port = 8080;


mongoose.connect('mongodb://localhost/example', { useNewUrlParser: true });

app.get('/',function(req,res){
    res.send('happy to be here')
});

app.get('/books', function(req,res){
    console.log('getting all books');
    Book.find({})
    .exec(function(err,results){
        if(err){
            res.send('error has occured');
        }else{
            console.log(result)
            res.json(result)
        }
    })
})

app.get('/books/:id',function(req,res){
    console.log('getting one book');
    Book.findOne({
        _id:req.params.id
    })
    .exec(function(err,result)
    {if(err){
        res.send('error occured');
    }else{
        console.log(result)
        res.json(result)
    }
    })
})
app.listen(port,function(){
    console.log('app listening on port'+ port);
})