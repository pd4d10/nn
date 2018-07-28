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

async function getMirrorAndVersion(version) {
  let isChakra = false

  for (const prefix of ['chakracore-', 'cc-']) {
    if (version.startsWith(prefix)) {
      isChakra = true
      version = version.slice(prefix.length)
    }
  }

  // let { v, arch } = inputVersion.split('-')

  version = version.toLowerCase()
  let mirrorType = 'node'
  let mirror

  if (version === 'lts') {
    mirror = getMirror(mirrorType, isChakra)
    const list = await getVersionList(mirror)
    version = list.find(item => item.lts).version
  } else {
    if (version === 'latest' || version === 'nodejs') {
      version = 'node'
    }

    // Check if version match keywords
    const keywords = ['node', 'iojs', 'rc', 'nightly', 'v8-canary']
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

  const packageName = mirrorType === 'iojs' ? 'iojs' : 'node'
  const fileName = `${packageName}-${version}-${platform}-${defaultArch}.tar.gz`
  const sha256Url = `${mirror}/${version}/SHASUMS256.txt`
  const downloadUrl = `${mirror}/${version}/${fileName}`
  const dirName = isChakra ? 'chakra' : 'node'
  const root = path.resolve(os.homedir(), '.nvmx')
  // const tempFile = path.resolve('/tmp', dirName, fileName)
  const tempFile = path.resolve('/tmp', fileName)
  const destDir = path.resolve(root, dirName, `${version}-${defaultArch}`)

  return {
    version,
    mirror,
    fileName,
    downloadUrl,
    sha256Url,
    dirName,
    tempFile,
    destDir,
  }
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
  getMirrorAndVersion,
  getSha256FromRemote,
  getTypeAndVersion,
}
