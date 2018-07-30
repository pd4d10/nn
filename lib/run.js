const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')
const { platform, ensureArchCorrect, getNodeDirByMeta } = require('./utils')

function getExeByDir(dir) {
  return path.resolve(dir, platform === 'win' ? '' : 'bin', 'node')
}

function run(version, isChakraCore, arch) {
  arch = ensureArchCorrect(arch)
  const args = process.argv.slice(4) // node . run <version> app.js
  if (args.length === 0) {
    throw new Error('Please specify a JavaScript file to run')
  }

  const nodePath = getNodeDirByMeta(version, isChakraCore, arch)
  if (!fs.existsSync(nodePath)) {
    console.log(`${version} ${arch} is not added`)
    return
  }

  // https://stackoverflow.com/a/47338488
  spawnSync(getExeByDir(nodePath), args, {
    cwd: process.cwd(),
    detached: true,
    stdio: 'inherit',
  })
}

module.exports = { run }
