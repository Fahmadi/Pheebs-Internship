
const http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path')
var mime = require('mime-types')

const hostname = '127.0.0.1';
const port = 8080;


const server = http.createServer((req, res) => {

  const file_url = req.url

  var filename = file_url.substring(file_url.lastIndexOf('/')+1);
  var file_path = path.join(__dirname, file_url) 
  console.log(file_path)
  if (fs.existsSync(file_path)) {
      fs.stat(file_path, function(err, stat){
      if (err) console.log('Error',err)
      else{
      
        if (stat.isFile() == true){
        
            fs.readFile(file_path, function(err, data) {
              if (err) console.log('Error',err);
              else{
                    res.writeHead(200, {'Content-Type': mime.contentType(filename)});
                    res.write(data);
                    res.end();
              }

            });
        }
        if (stat.isDirectory() == true){
          fs.readdir(file_path, function(err,files){
                if (err) console.log('Error',err);
                else {
                    var s=''
                    res.writeHead(200, {"Content-Type": "text/html"});
                    s += files.map(f => `<li><a href="${path.join(file_url, f)}" >${f}</a></li>`).join('');
                    s = '<ui>' + s + '</ui>';
                    res.write(s);
                    res.end();
        
            
                }
            
          });
        }
        }
          
  });


}
  else{
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.end("sorry we could not find the file you requested");
  }
  
});


server.listen(8080);
console.log('Listenning on port 8080');
