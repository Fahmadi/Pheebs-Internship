const os = require('os')
const path = require('path')
const fs = require('fs')

const DATA_DIR = path.join('/var/lib', 'pishi')
const STATIC_DIR = path.join(DATA_DIR, 'static')

const makeDirectory = path => {
  try {
    fs.mkdirSync(path)
  } catch (e) {}
}

makeDirectory(DATA_DIR)
makeDirectory(STATIC_DIR)

module.exports = {
  DATA_DIR,
  STATIC_DIR,
}
