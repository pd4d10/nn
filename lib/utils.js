const os = require('os')
const fs = require('fs')
const crypto = require('crypto')
const path = require('path')

function getPlatform() {
  switch (os.type()) {
    case 'Darwin':
      return 'darwin'
    case 'Linux':
      return 'linux'
    case 'Windows_NT':
      return 'win'
  }
}
const platform = getPlatform()
const arch = os.arch()

function getDir(...args) {
  return path.resolve(os.homedir(), '.nvmx', ...args)
}

function getDirByVersion(version) {
  return getDir('dist', `node-v${version}-${platform}-${arch}`)
}

function findVersion(version) {
  if (version === 'lts') {
  }

  // const [major, minor, patch] = version.split('.')
  // if (!patch) {
  // }
  return version
}

function computeSha256(file) {
  return new Promise((resolve, reject) => {
    const sha256sum = crypto.createHash('sha256')
    const fr = fs.createReadStream(file)
    fr.on('error', reject)
    fr.on('data', data => {
      sha256sum.update(data)
    })
    fr.on('end', () => {
      resolve(sha256sum.digest('hex'))
    })
  })
}

exports.platform = platform
exports.arch = arch
exports.getDir = getDir
exports.getDirByVersion = getDirByVersion
exports.computeSha256 = computeSha256
