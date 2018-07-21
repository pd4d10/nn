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

function getConfig() {
  const configPath = getDir('config.json')
  if (fs.existsSync(configPath)) {
    return require(configPath)
  } else {
    return {}
  }
}

function setConfig(config) {
  const configPath = getDir('config.json')
  if (fs.existsSync(configPath)) {
    fs.writeFileSync(
      configPath,
      JSON.stringify({ ...require(configPath), ...config }),
    )
  } else {
    fs.writeFileSync(configPath, JSON.stringify(config))
  }
}

const mirrorMapper = {
  default: {
    nodejs: 'https://nodejs.org/dist',
    iojs: 'https://iojs.org/dist',
    rc: 'https://nodejs.org/download/rc',
    nightly: 'https://nodejs.org/download/nightly',
    chakracore: 'https://nodejs.org/download/chakracore-release',
    'chakracore-nightly': 'https://nodejs.org/download/chakracore-nightly',
  },
  taobao: {
    nodejs: 'https://npm.taobao.org/mirrors/node',
    iojs: 'http://npm.taobao.org/mirrors/iojs',
    rc: 'https://npm.taobao.org/mirrors/node-rc',
  },
  tsinghua: {
    nodejs: 'https://mirrors.tuna.tsinghua.edu.cn/nodejs-release',
  },
}

function getMirror() {
  const id = getConfig().mirror
  if (mirrorMapper[id] && mirrorMapper[id].nodejs) {
    return mirrorMapper[id].nodejs
  } else {
    return mirrorMapper.default.nodejs
  }
}

exports.platform = platform
exports.arch = arch
exports.getDir = getDir
exports.getDirByVersion = getDirByVersion
exports.computeSha256 = computeSha256
exports.getConfig = getConfig
exports.setConfig = setConfig
exports.mirrorMapper = mirrorMapper
exports.getMirror = getMirror
