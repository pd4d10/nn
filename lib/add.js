const os = require('os')
const fs = require('fs-extra')
const path = require('path')
const targz = require('targz')
const fetch = require('node-fetch').default
const mkdirp = require('mkdirp')

var request = require('request')
var ProgressBar = require('progress')

const {
  platform,
  getConfig,
  getArch,
  mirrorMapper,
  getVersionList,
  parseVersion,
  getMirror,
  getSha256FromRemote,
  computeSha256,
  getRootDir,
} = require('./utils')

async function getMirrorAndVersion(version, isChakraCore, arch) {
  version = version.toLowerCase()
  let mirrorType = 'node'
  let mirror

  if (version === 'lts') {
    mirror = getMirror(mirrorType, isChakraCore)
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
        mirror = getMirror(mirrorType, isChakraCore)
        const list = await getVersionList(mirror)
        version = list[0].version
        break
      }

      if (version.includes(word)) {
        matchKeyword = true
        mirrorType = word
        mirror = getMirror(mirrorType, isChakraCore)
        break
      }
    }

    // If no match, treat it as x.y.z
    if (!matchKeyword) {
      const [major, minor, patch] = parseVersion(version)
      if (0 < major && major <= 3) {
        mirrorType = 'iojs'
      }
      mirror = getMirror(mirrorType, isChakraCore)
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

  arch = getArch(arch)
  const packageName = mirrorType === 'iojs' ? 'iojs' : 'node'
  const fileName = `${packageName}-${version}-${platform}-${arch}.tar.gz`
  const sha256Url = `${mirror}/${version}/SHASUMS256.txt`
  const downloadUrl = `${mirror}/${version}/${fileName}`
  const dirName = isChakraCore ? 'chakra' : 'node'
  const root = path.resolve(os.homedir(), '.nvmx')
  // const tempFile = path.resolve('/tmp', dirName, fileName)
  const tempFile = path.resolve('/tmp', fileName)
  const destDir = path.resolve(root, dirName, `${version}-${arch}`)

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

async function add(inputVersion, isChakraCore, arch) {
  if (!inputVersion) {
    console.log('Please input a version')
    return
  }

  const {
    version,
    mirror,
    downloadUrl,
    fileName,
    sha256Url,
    dirName,
    tempFile,
    destDir,
  } = await getMirrorAndVersion(inputVersion, isChakraCore, arch)
  // console.log(version, mirror, downloadUrl, fileName)

  // Check if already installed
  if (fs.existsSync(destDir)) {
    console.log(`${version} is already installed.`)
    // TODO: Test executable
    // TODO: Auto use it
    return
  }

  // Get SHA256
  const hash = await getSha256FromRemote(sha256Url, fileName)

  // Check if tar.gz is already downloaded
  if (fs.existsSync(tempFile)) {
    const isMatch = await compareHash(tempFile, hash)
    if (isMatch) {
      await extract(tempFile, destDir)
      return
    }
  }

  await fetchFromRemote(downloadUrl, tempFile)
  const isMatch = await compareHash(tempFile, hash)
  if (isMatch) {
    await extract(tempFile, destDir)
  } else {
    console.log('Not match, aborted')
  }
}

async function compareHash(filePath, hash) {
  const computedHash = await computeSha256(filePath)
  return hash === computedHash
}

async function fetchFromRemote(url, outputFileName) {
  // Fetch
  console.log('Downloading', url)

  await new Promise((resolve, reject) => {
    request(url)
      .on('response', res => {
        if (res.statusCode >= 400) {
          return reject(`${version} not found, please input a valid version`)
        }
        var len = parseInt(res.headers['content-length'], 10)

        bar = new ProgressBar('Downloading [:bar] :rate/bps :percent :etas', {
          complete: '=',
          incomplete: ' ',
          width: 20,
          total: len,
        })

        res.on('data', chunk => {
          bar.tick(chunk.length)
        })
      })
      .on('error', reject)
      .on('end', resolve)
      .pipe(fs.createWriteStream(outputFileName))
  })
}

async function extract(src, destFolder) {
  if (!fs.existsSync(destFolder)) {
    mkdirp(destFolder)
  }

  // Extract files
  await new Promise((resolve, reject) => {
    targz.decompress(
      {
        src,
        dest: destFolder,
        tar: {
          strip: 1,
        },
      },
      err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      },
    )
  })
}

module.exports = {
  add,
  getMirrorAndVersion,
}
