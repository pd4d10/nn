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
  getRootDir,
} = require('./utils')

async function install(inputVersion) {
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
  } = await getMirrorAndVersion(inputVersion)
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

module.exports = install
