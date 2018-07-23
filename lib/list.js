const fs = require('fs')
const { getDir } = require('./utils')

function list() {
  return fs.readdirSync(getDir('dist'))
}

module.exports = list
