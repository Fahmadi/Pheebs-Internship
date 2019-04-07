const http = require('http')
var fs = require('fs')
var url = require('url')
var path = require('path')
var mime = require('mime-types')

const hostname = '127.0.0.1'
const port = 8080

async function exists(filePath) {
  try {
    await fs.openAsync(filePath, 'r')
    return true
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false
    } else {
      throw e
    }
  }
}

const handleRequest = async (req, res) => {
  const file_url = req.url

  var filename = file_url.substring(file_url.lastIndexOf('/') + 1)
  var file_path = path.join(__dirname, file_url)
  console.log(file_path)
  const exist = await exists(file_path)
  if (!fileExists) {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('sorry we could not find the file you requested')
    return
  }
  let stat = await fs.statAsync(file_path)
  if (stat.isDirectory() === true) {
    const files = await fs.readdirAsync(file_path)
    var s = ''
    res.writeHead(200, { 'Content-Type': 'text/html' })
    s += files
      .map(f => `<li><a href="${path.join(file_url, f)}" >${f}</a></li>`)
      .join('')
    s = '<ui>' + s + '</ui>'
    res.write(s)
    res.end()
  }
  if (stat.isFile() === true) {
    const data = await fs.readFileAsync(file_path)
    res.writeHead(200, { 'Content-Type': mime.contentType(filename) })
    res.write(data)
    res.end()
  }
}

const server = http.createServer(async (req, res) => {
  try {
    handleRequest(req, res)
  } catch (e) {
    console.log('unexpected error', e)
  }
})
server.listen(8080)
console.log('Listenning on port 8080')
