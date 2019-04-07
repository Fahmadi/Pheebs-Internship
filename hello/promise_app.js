const http = require('http')
// var fs = require('fs')
var url = require('url')
var path = require('path')
var mime = require('mime-types')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))

const hostname = '127.0.0.1'
const port = 8080

const exists1 = filePath => {
  return new Promise((resolve, reject) => {
    fs.open(filePath, 'r', (err, fd) => {
      if (err) {
        if (err.code === 'ENOENT') {
          resolve(false)
          return
        }
        reject(err)
        return
      }
      resolve(true)
    })
  })
}

const exists = filePath => {
  return fs
    .openAsync(filePath, 'r')
    .then(fd => true)
    .catch(e => {
      if (e.code === 'ENOENT') {
        return false
      } else {
        return Promise.reject(e)
      }
    })
}

const server = http.createServer((req, res) => {
  const file_url = req.url
  var filename = file_url.substring(file_url.lastIndexOf('/') + 1)
  var file_path = path.join(__dirname, file_url)
  console.log(file_path)

  exists(file_path)
    .then(fileExists => {
      if (!fileExists) {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('sorry we could not find the file you requested')
        return
      }
      return fs.statAsync(file_path).then(stat => {
        if (stat.isDirectory() === true) {
          return fs.readdirAsync(file_path).then(files => {
            var s = ''
            res.writeHead(200, { 'Content-Type': 'text/html' })
            s += files
              .map(
                f => `<li><a href="${path.join(file_url, f)}" >${f}</a></li>`
              )
              .join('')
            s = '<ui>' + s + '</ui>'
            res.write(s)
            res.end()
          })
        }
        if (stat.isFile() === true) {
          return fs.readFileAsync(file_path).then(data => {
            res.writeHead(200, { 'Content-Type': mime.contentType(filename) })
            res.write(data)
            res.end()
          })
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' })
          res.end('not implemented')
          return
        }
      })
    })
    .catch(e => {
      console.log('unexpected error: ', e)
    })
})

server.listen(8080)
console.log('Listenning on port 8080')
