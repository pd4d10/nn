const fs = require('fs')
const rimraf = require('rimraf')
const { getDirByVersion } = require('./utils')

function remove(version, isChakra) {
  const nodePath = getDirByVersion(version, isChakra)

  if (!fs.existsSync(nodePath)) {
    console.log('Not installed')
    return
  }

  console.log('Uninstalling...')
  rimraf.sync(nodePath)
  console.log('Success')

  // If it is in use, switch to latest version
}

module.exports = remove
