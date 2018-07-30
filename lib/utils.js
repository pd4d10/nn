const os = require('os')
const fs = require('fs-extra')
const crypto = require('crypto')
const path = require('path')
const fetch = require('node-fetch').default
const chalk = require('chalk').default

function warn(message) {
  console.warn(chalk.yellow(message))
}

const platform = {
  Darwin: 'darwin',
  Linux: 'linux',
  Windows_NT: 'win',
}[os.type()]

const systemArch = {
  x64: 'x64',
  ia32: 'x86',
  x32: 'x86',
}[process.arch]

const linkPath = getRootDir('current')

function ensureArchCorrect(arch = systemArch) {
  // If not in whitelist then use system
  if (!['x64', 'x86'].includes(arch)) {
    warn(`${arch} is not a correct arch, use ${systemArch} instead`)
    return systemArch
  }
  return arch
}

function getRootDir(...args) {
  return path.resolve(os.homedir(), '.nvmx', ...args)
}

// v10.7.0-x64      -> v10.7.0 x64
// v10.2.1-rc.1-x64 -> v10.2.1-rc.1 x64
function extractVersionAndArch(versionAndArch) {
  const arr = versionAndArch.split('-')
  const version = arr.slice(0, -1).join('-')
  const arch = arr.slice(-1)[0]
  return { version, arch }
}

// /home/username/.nvmx/node/v10.7.0-x64
// -> version: v10.7.0, arch: x64, isChakraCore: false
function getMetaByNodeDir(nodePath) {
  const { dir, name: versionAndArch } = path.parse(nodePath)
  const { name: subDir } = path.parse(dir)
  const { version, arch } = extractVersionAndArch(versionAndArch)
  return { isChakraCore: subDir === 'chakracore', version, arch }
}

function getSubDir(isChakraCore) {
  return isChakraCore ? 'chakracore' : 'node'
}

// Get node dirname, for `use` and `remove` command
// -> /home/username/.nvmx/node/v10.7.0-x64
function getNodeDirByMeta(version, isChakraCore, arch) {
  if (!version.startsWith('v')) {
    version = 'v' + version
  }
  arch = ensureArchCorrect(arch)
  return getRootDir(getSubDir(isChakraCore), `${version}-${arch}`)
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
  const configPath = getRootDir('config.json')
  if (fs.existsSync(configPath)) {
    return fs.readJsonSync(configPath)
  } else {
    return {}
  }
}

function setConfig(config) {
  const configPath = getRootDir('config.json')
  if (fs.existsSync(configPath)) {
    const oldConfig = fs.readJsonSync(configPath)
    config = { ...oldConfig, ...config }
  }
  fs.writeJsonSync(configPath, config)
}

function getCurrent() {
  if (fs.existsSync(linkPath)) {
    return fs.readlinkSync(linkPath)
  }
}

function getCurrentMeta() {
  const current = getCurrent()
  if (current) {
    return getMetaByNodeDir(current)
  }
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
    warn(`Invalid mirror: ${mirror}, fallback to default`)
    mirror = 'default'
  }

  if (!mirrorMapper[mirror][type]) {
    warn(`No ${type} mirror at ${mirror}, fallback to default`)
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
    throw new Error('Can not find SHA256' + sha256Url + fileName)
  }
}

function getLocalVersions() {
  const nodePath = getRootDir('node')
  const chakraPath = getRootDir('chakracore')

  let nodeVersions = []
  let chakraCoreVersions = []
  if (fs.existsSync(nodePath)) {
    nodeVersions = fs.readdirSync(nodePath).map(extractVersionAndArch)
  }
  if (fs.existsSync(chakraPath)) {
    chakraCoreVersions = fs.readdirSync(chakraPath).map(extractVersionAndArch)
  }

  return { nodeVersions, chakraCoreVersions }
}

module.exports = {
  platform,
  ensureArchCorrect,
  getRootDir,
  getNodeDirByMeta,
  computeSha256,
  getLocalVersions,
  getConfig,
  setConfig,
  mirrorMapper,
  getMirror,
  getSha256FromRemote,
  getMetaByNodeDir,
  getVersionList,
  extractVersionAndArch,
  parseVersion,
  systemArch,
  getCurrent,
  getCurrentMeta,
}
