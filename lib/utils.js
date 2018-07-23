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

function getDirByVersion(version, type) {
  return getDir(type, `node-${version}-${platform}-${arch}`)
}

function findVersion(version, arch, isChakra) {
  if (isChakra) {
    return
  }

  if (version === 'lts') {
  }

  if (version === 'nightly') {
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
    chakracore_nightly: 'https://nodejs.org/download/chakracore-nightly',
  },
  taobao: {
    nodejs: 'https://npm.taobao.org/mirrors/node',
    iojs: 'http://npm.taobao.org/mirrors/iojs',
    rc: 'https://npm.taobao.org/mirrors/node-rc',
    nightly: 'https://npm.taobao.org/mirrors/node-nightly',
    // https://github.com/cnpm/cnpmjs.org/issues/1364
    // chakracore: 'https://npm.taobao.org/mirrors/node-chakracore',
  },
  tsinghua: {
    nodejs: 'https://mirrors.tuna.tsinghua.edu.cn/nodejs-release',
  },
}

function getMirror(type) {
  const id = getConfig().mirror
  if (mirrorMapper[id] && mirrorMapper[id][type]) {
    return mirrorMapper[id][type]
  } else {
    return mirrorMapper.default[type]
  }
}

function getMirrorUrl(version, mirror = 'default', isChakra = false) {
  if (!Object.keys(mirrorMapper).includes(mirror)) {
    console.warn(`Invalid mirror: ${mirror}, fallback to default`)
    mirror = 'default'
  }

  let key = 'nodejs'

  if (isChakra) {
    if (version.includes('nightly')) {
      key = 'chakracore_nightly'
    } else {
      key = 'chakracore'
    }
  } else {
    if (version.includes('rc')) {
      key = 'rc'
    } else if (version.includes('nightly')) {
      key = 'nightly'
    } else {
      const [major, minor, patch] = version.split('.').map(n => parseInt(n, 10))
      if (0 < major && major <= 3) {
        key = 'iojs'
      }
    }
  }

  return mirrorMapper[mirror][key] || mirrorMapper.default[key]
}

// 8 -> latest 8.x.x
// 8.9 -> latest 8.9.x
// 3.2.0 -> io.js
async function getCorrectVersion(version) {
  const [major, minor, patch] = version.split('.').map(n => parseInt(n, 10))
  mirrorId = 0 < major && major <= 3 ? 'iojs' : 'nodejs'

  if (isNaN(major)) {
    console.log('Invalid version')
    return
  }
  if (isNaN(minor) || isNaN(patch)) {
    const res = await fetch(getMirrorUrl(version) + '/index.json')
    const list = await res.json()
    version = list.find(item => {
      const [x, y, z] = version
        .slice(1)
        .split('.')
        .map(n => parseInt(n, 10))
      return major === x
    })
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
exports.getMirrorUrl = getMirrorUrl
