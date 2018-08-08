const os = require('os')
const fs = require('fs-extra')
const path = require('path')
const fetch = require('node-fetch').default
const chalk = require('chalk').default
const { mirrorMapper } = require('./constants')

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
  return path.resolve(os.homedir(), '.nn', ...args)
}

// v10.7.0-x64      -> v10.7.0 x64
// v10.2.1-rc.1-x64 -> v10.2.1-rc.1 x64
function extractVersionAndArch(versionAndArch) {
  const arr = versionAndArch.split('-')
  const version = arr.slice(0, -1).join('-')
  const arch = arr.slice(-1)[0]
  return { version, arch }
}

// /home/username/.nn/node/v10.7.0-x64
// -> version: v10.7.0, arch: x64, isChakraCore: false
function getMetaByNodeDir(nodePath) {
  const { dir, base: versionAndArch } = path.parse(nodePath)
  const { name: subDir } = path.parse(dir)
  const { version, arch } = extractVersionAndArch(versionAndArch)
  return { isChakraCore: subDir === 'chakracore', version, arch }
}

function getSubDir(isChakraCore) {
  return isChakraCore ? 'chakracore' : 'node'
}

// Get node dirname, for `use` and `remove` command
// -> /home/username/.nn/node/v10.7.0-x64
function getNodeDirByMeta(version, isChakraCore, arch) {
  if (!version.startsWith('v')) {
    version = 'v' + version
  }
  return getRootDir(getSubDir(isChakraCore), `${version}-${arch}`)
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
  fs.writeJsonSync(configPath, config, { spaces: 2 })
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

function getMirrorUrlByType(type, isChakraCore) {
  if (isChakraCore) {
    type = {
      node: 'chakracore',
      rc: 'chakracore-rc',
      nightly: 'chakracore-nightly',
    }[type]
  }

  let { mirror = 'default' } = getConfig()

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
  linkPath,
  getRootDir,
  getNodeDirByMeta,
  getLocalVersions,
  getConfig,
  setConfig,
  getSubDir,
  mirrorMapper,
  getMirrorUrlByType,
  getMetaByNodeDir,
  getVersionList,
  extractVersionAndArch,
  parseVersion,
  systemArch,
  getCurrent,
  warn,
  getCurrentMeta,
}
