const os = require('os')
const fs = require('fs-extra')
const path = require('path')
const targz = require('targz')
const fetch = require('node-fetch').default
const mkdirp = require('mkdirp')
const {
  getMirrorAndVersion,
  getConfig,
  mirrorMapper,
  getSha256FromRemote,
} = require('./utils')

const {
  platform,
  arch: defaultArch,
  getDirByVersion,
  computeSha256,
  getDir,
} = require('./utils')

async function install(inputVersion, arch = defaultArch, isChakraCore) {
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
  } = await getMirrorAndVersion(inputVersion, isChakraCore)
  // console.log(version, mirror, downloadUrl, fileName)
  const dirName = isChakraCore ? 'chakra' : 'node'
  const root = path.resolve(os.homedir(), '.nvmx')
  // const tempFile = path.resolve('/tmp', dirName, fileName)
  const tempFile = path.resolve('/tmp', fileName)
  const destDir = path.resolve(root, dirName, `${version}-${arch}`)

  // Get SHA256
  const hash = await getSha256FromRemote(sha256Url, fileName)

  // Check if already installed
  if (fs.existsSync(destDir)) {
    console.log(`${version} is already installed.`)
    // TODO: Test executable
    // TODO: Auto use it
    return
  }

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
  const res = await fetch(url)

  // File not found
  if (res.status >= 400) {
    console.log(`Not found, please input a valid version`)
    return
  }

  await new Promise((resolve, reject) => {
    res.body.pipe(fs.createWriteStream(outputFileName).on('finish', resolve))
    res.body.on('error', reject)
  })
}

async function extract(src, destFolder) {
  if (!fs.existsSync(destFolder)) {
    mkdirp(destFolder)
  }

  // Extract files
  await new Promise((resolve, reject) => {
    targz.decompress({ src, dest: destFolder }, err => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

// class Installer {
//   constructor(version, arch = os.arch(), isChakra) {
//     this.inputVersion = version
//     this.arch = arch
//     this.isChakra = isChakra
//   }

//   get destFileName() {
//     return `${this.version}-${this.platform}-${arch}.tar.gz`
//   }

//   get tempFilePath() {
//     return path.resolve('/tmp')
//   }

//   get destFolder() {
//     return path.resolve(
//       os.homedir(),
//       '.nvmx',
//       this.isChakra ? 'chakra' : 'node',
//     )
//   }

//   async extract() {
//     return new Promise((resolve, reject) => {
//       targz.decompress({ src, dest: this.destFolder }, err => {
//         if (err) {
//           reject(err)
//         } else {
//           resolve()
//         }
//       })
//     })
//   }
// }

module.exports = install
