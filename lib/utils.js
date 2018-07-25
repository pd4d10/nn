const os = require('os')
const fs = require('fs')
const crypto = require('crypto')
const path = require('path')
const fetch = require('node-fetch').default

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
    'v8-canary': 'https://nodejs.org/download/v8-canary',
    chakracore: 'https://nodejs.org/download/chakracore-release',
    'chakracore-rc': 'https://nodejs.org/download/chakracore-rc',
    'chakracore-nightly': 'https://nodejs.org/download/chakracore-nightly',
  },
  taobao: {
    nodejs: 'https://npm.taobao.org/mirrors/node',
    iojs: 'https://npm.taobao.org/mirrors/iojs',
    rc: 'https://npm.taobao.org/mirrors/node-rc',
    nightly: 'https://npm.taobao.org/mirrors/node-nightly',
    // https://github.com/cnpm/cnpmjs.org/issues/1364
    // chakracore: 'https://npm.taobao.org/mirrors/node-chakracore',
  },
  tsinghua: {
    nodejs: 'https://mirrors.tuna.tsinghua.edu.cn/nodejs-release',
  },
}

function getMirror(type, isChakra) {
  if (isChakra) {
    type = {
      nodejs: 'chakracore',
      rc: 'chakracore-rc',
      nightly: 'chakracore-nightly',
    }[type]
  }

  const { mirror = 'default' } = getConfig()

  if (!mirrorMapper[mirror]) {
    console.warn(`Invalid mirror: ${mirror}, fallback to default`)
    mirror = 'default'
  }

  if (!mirrorMapper[mirror][type]) {
    console.warn(`No ${type} mirror at ${mirror}, fallback to default`)
    mirror = 'default'
  }

  return mirrorMapper[mirror][type]
}

async function getVersionList(mirror) {
  const res = await fetch(mirror + '/index.json')
  return await res.json()
}

// v10.7.0 -> [10, 7, 0]
function parseVersion(version) {
  if (version.startsWith('v')) {
    version = version.slice(1)
  }
  return version.split('.').map(n => parseInt(n, 10))
}

async function getMirrorAndVersion(version, isChakra = false) {
  version = version.toLowerCase()
  let mirrorType = 'nodejs'
  let mirror

  if (version === 'lts') {
    mirror = getMirror(mirrorType, isChakra)
    const list = await getVersionList(mirror)
    version = list.find(item => item.lts).version
  } else {
    if (version === 'latest') {
      version = 'nodejs'
    }

    // Check if version match keywords
    const keywords = ['nodejs', 'iojs', 'rc', 'nightly', 'v8-canary']
    let matchKeyword = false

    for (let word of keywords) {
      if (version === word) {
        matchKeyword = true
        mirrorType = word
        mirror = getMirror(mirrorType, isChakra)
        const list = await getVersionList(mirror)
        version = list[0].version
        break
      }

      if (version.includes(word)) {
        matchKeyword = true
        mirrorType = word
        mirror = getMirror(mirrorType, isChakra)
        break
      }
    }

    // If no match, treat it as x.y.z
    if (!matchKeyword) {
      const [major, minor, patch] = parseVersion(version)
      if (0 < major && major <= 3) {
        mirrorType = 'iojs'
      }
      mirror = getMirror(mirrorType, isChakra)
      const list = await getVersionList(mirror)

      if (isNaN(minor)) {
        // 8 -> latest 8.x.x
        version = list.find(item => {
          const [x] = parseVersion(item.version)
          return major === x
        }).version
      } else if (isNaN(patch)) {
        // 8.9 -> latest 8.9.x
        version = list.find(item => {
          const [x, y] = parseVersion(item.version)
          return major === x && minor === y
        }).version
      }
    }
  }

  // Recover the leading `v`
  if (!version.startsWith('v')) {
    version = 'v' + version
  }

  return { version, mirror }
}

async function getSha256FromRemote(mirror, version, platform, arch) {
  // Get hash from mirror
  console.log('Computing checksum with sha256sum...')
  const res = await fetch(`${mirror}/${version}/SHASUMS256.txt`)
  const text = await res.text()
  const match = text
    .split('\n')
    .find(line => line.includes(`${version}-${platform}-${arch}.tar.gz`))
  if (match) {
    return line.split(/\s+/)[0]
  } else {
    throw new Error('Can not find SHA256')
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
exports.getMirrorUrl = getMirror
exports.getMirrorAndVersion = getMirrorAndVersion
exports.getSha256FromRemote = getSha256FromRemote
