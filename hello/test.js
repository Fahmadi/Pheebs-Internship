let promiseToCleanTheRoom = new Promise(function(resolve,reject){
    let isClean = true;

    if (isClean){
        resolve('Clean');
    }else{
        reject('not Clean');
    }
});

promiseToCleanTheRoom.then(function(fromResolve){
    console.log('the room is'+ fromResolve);
}).catch(function(fromReject){
    console.log('the room is' + fromReject);
});


fs.readFile(file_path, function(err, data) {
    if (err) console.log('Error',err);
    else{
          res.writeHead(200, {'Content-Type': mime.contentType(filename)});
          res.write(data);
          res.end();
    }

  });




let promiseToCleanTheRoom = new Promise(function(resolve,reject){
    let isClean = true;

    if (isClean){
        resolve('Error');
    }else{
        reject('not Clean');
    }
});

promiseToCleanTheRoom.then(function(fromResolve){
    console.log('the room is'+ fromResolve);
}).catch(function(fromReject){
    console.log('the room is' + fromReject);
});



fs.readFile(file_path, function(err, data) {
    if (err) console.log('Error',err);
    else{
          res.writeHead(200, {'Content-Type': mime.contentType(filename)});
          res.write(data);
          res.end();
    }

  });


var readFile = Promise.promisify(require("fs").readFile);

readFile(file_path, "utf8").then(function(contents) {

    res.writeHead(200, {'Content-Type': mime.contentType(filename)});
    res.write(data);
    res.end();
}).catch(function(e) {
    console.log("Error reading file", e);
});
