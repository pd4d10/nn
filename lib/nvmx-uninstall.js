const fs = require('fs')
const program = require('commander')
const rimraf = require('rimraf')
const { getDirByVersion } = require('./utils')

program.option('--lts [name]').parse(process.argv)

const [version] = program.args

uninstall()

function uninstall() {
  const nodePath = getDirByVersion(version)

  if (!fs.existsSync(nodePath)) {
    console.log('Not installed')
    return
  }

  console.log('Uninstalling...')
  rimraf.sync(nodePath)
  console.log('Success')

  // If it is in use, switch to latest version
}
