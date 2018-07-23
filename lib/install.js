const os = require('os')
const fs = require('fs')
const path = require('path')
const targz = require('targz')
const fetch = require('node-fetch').default
const mkdirp = require('mkdirp')
const { getMirror, getConfig, mirrorMapper } = require('./utils')

const {
  platform,
  arch: defaultArch,
  getDirByVersion,
  computeSha256,
  getDir,
} = require('./utils')

async function getList(mirrorId) {
  const res = await fetch(getMirror(mirrorId) + '/index.json')
  const json = await res.json()
  return json
}

async function install(version, arch = defaultArch, isChakraCore) {
  if (!version) {
    console.log('Please input a version')
    return
  }

  version = version.toLowerCase()

  let mirrorId
  let localFolder

  // Get correct version
  if (isChakraCore) {
    localFolder = 'chakra'

    if (version === 'nightly') {
      console.log('Looking for latest nightly version...')

      mirrorId = 'chakracore_nightly'
      ;[{ version }] = await getList(mirrorId)
    } else {
      mirrorId = 'chakracore'
      const list = await getList(mirrorId)
      if (!list.includes(item => item.version === version)) {
        console.log('No such version')
        return
      }
      console.log('Version correct:', version)
    }
  } else {
    localFolder = 'node'

    if (version === 'lts') {
      console.log('Looking for latest LTS version...')

      mirrorId = 'nodejs'
      const list = await getList(mirrorId)
      version = list.find(item => item.lts).version

      console.log('Latest LTS version is', version)
    } else if (version === 'nightly') {
      console.log('Looking for latest nightly version...')

      mirrorId = 'nightly'
      ;[{ version }] = await getList(mirrorId)

      console.log('Latest nightly version is', version)
    } else if (version === 'rc') {
      console.log('Looking for latest RC version...')

      mirrorId = 'rc'
      ;[{ version }] = await getList(mirrorId)

      console.log('Latest RC version is', version)
    } else {
      // Remove the leading `v`
      if (version.startsWith('v')) {
        version = version.slice(1)
      }

      // 8 -> latest 8.x.x
      // 8.9 -> latest 8.9.x
      // 3.2.0 -> io.js
      const [major, minor, patch] = version.split('.').map(n => parseInt(n, 10))
      console.log(major, minor, patch)
      mirrorId = 0 < major && major <= 3 ? 'iojs' : 'nodejs'

      if (isNaN(major)) {
        console.log('Invalid version')
        return
      }
      if (isNaN(minor) || isNaN(patch)) {
        const list = await getList(mirrorId)
        version = list.find(item => {
          const [x, y, z] = version
            .slice(1)
            .split('.')
            .map(n => parseInt(n, 10))
          return major === x
        })
      }

      // Recover the leading `v`
      version = 'v' + version
    }
  }

  const destFolder = path.resolve(os.homedir(), '.nvmx', localFolder)
  const fileName = `node-${version}-${platform}-${arch}.tar.gz`
  const outputFileName = path.resolve('/tmp', fileName)

  // Check if already installed
  if (fs.existsSync(getDirByVersion(version, localFolder))) {
    console.log(`${version} is already installed.`)
    // TODO: Auto use it
    return
  }

  // Get hash from mirror
  console.log('Computing checksum with sha256sum...')
  console.log(mirrorId)
  const mirror = getMirror(mirrorId)
  const res = await fetch(`${mirror}/v${version}/SHASUMS256.txt`)
  const text = await res.text()
  let hash
  text.split('\n').some(line => {
    if (line.includes(fileName)) {
      hash = line.split(/\s+/)[0]
    }
  })

  const url = `${mirror}/${version}/${fileName}`

  if (fs.existsSync(outputFileName)) {
    const computedHash = await computeSha256(outputFileName)
    if (computedHash === hash) {
      console.log('Checksums matched!')
      await extract(outputFileName, destFolder)
    } else {
      fetchFromRemote(url, outputFileName)
    }
  } else {
    fetchFromRemote(url, outputFileName)
  }
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

  console.log('Finish')

  const computedHash = await computeSha256(outputFileName)
  if (computedHash === hash) {
    console.log('Checksums matched!')
    await extract(outputFileName, destFolder)
  } else {
    console.log('Checksums not matched, exiting...')
  }
  // Auto use it after install
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

module.exports = install
