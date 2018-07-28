const os = require('os')
const fs = require('fs-extra')
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
const defaultArch = os.arch()

function getRootDir(...args) {
  return path.resolve(os.homedir(), '.nvmx', ...args)
}

// /home/username/.nvmx/
function getTypeAndVersion(linkPath) {
  let filePath = linkPath.replace(getRootDir(), '')
  if (filePath.startsWith('/')) {
    filePath = filePath.slice(1)
  }
  return filePath.split('/')
}

function getDirByVersion(version, isChakra) {
  return getRootDir(isChakra ? 'chakra' : 'node', `${version}-${defaultArch}`)
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

async function getConfig() {
  const configPath = getRootDir('config.json')
  if (fs.existsSync(configPath)) {
    return await fs.readJson(configPath)
  } else {
    return {}
  }
}

async function setConfig(config) {
  const configPath = getRootDir('config.json')
  if (fs.existsSync(configPath)) {
    const oldConfig = await fs.readJson(configPath)
    config = {
      ...oldConfig,
      ...config,
    }
  }
  await fs.writeJson(configPath, config)
}

const mirrorMapper = {
  default: {
    node: 'https://nodejs.org/dist',
    iojs: 'https://iojs.org/dist',
    rc: 'https://nodejs.org/download/rc',
    nightly: 'https://nodejs.org/download/nightly',
    'v8-canary': 'https://nodejs.org/download/v8-canary',
    chakracore: 'https://nodejs.org/download/chakracore-release',
    'chakracore-rc': 'https://nodejs.org/download/chakracore-rc',
    'chakracore-nightly': 'https://nodejs.org/download/chakracore-nightly',
  },
  taobao: {
    node: 'https://npm.taobao.org/mirrors/node',
    iojs: 'https://npm.taobao.org/mirrors/iojs',
    rc: 'https://npm.taobao.org/mirrors/node-rc',
    nightly: 'https://npm.taobao.org/mirrors/node-nightly',
    // https://github.com/cnpm/cnpmjs.org/issues/1364
    // chakracore: 'https://npm.taobao.org/mirrors/node-chakracore',
  },
  tsinghua: {
    node: 'https://mirrors.tuna.tsinghua.edu.cn/nodejs-release',
  },
}

function getMirror(type, isChakra) {
  if (isChakra) {
    type = {
      node: 'chakracore',
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

async function getSha256FromRemote(sha256Url, fileName) {
  // Get hash from mirror
  console.log('Computing checksum with sha256sum...')
  const res = await fetch(sha256Url)
  const text = await res.text()
  const matchLine = text.split('\n').find(line => line.includes(fileName))
  if (matchLine) {
    return matchLine.split(/\s+/)[0]
  } else {
    throw new Error('Can not find SHA256')
  }
}

function getMetafromVersion(version) {
  const chakraCorePrefixes = ['chakracore-', 'cc-']
  const archSuffixes = ['x64', 'x86', 'arm64', 'arm6l', 'arm7l']

  let isChakraCore = false
  let arch = {
    ia32: 'x86',
  }[os.arch()]

  for (const prefix of chakraCorePrefixes) {
    if (version.startsWith(prefix)) {
      isChakraCore = true
      version = version.slice(prefix.length)
    }
  }

  for (const suffix of archSuffixes) {
    if (version.endsWith('-' + suffix)) {
      arch = suffix
    }
  }

  return { isChakraCore, version }
}

module.exports = {
  platform,
  defaultArch,
  getRootDir,
  getDirByVersion,
  computeSha256,
  getConfig,
  setConfig,
  mirrorMapper,
  getMirror,
  getSha256FromRemote,
  getTypeAndVersion,
  getVersionList,
  parseVersion,
}
