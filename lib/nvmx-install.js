const os = require('os')
const fs = require('fs')
const path = require('path')
const targz = require('targz')
const fetch = require('node-fetch').default
const program = require('commander')
const mkdirp = require('mkdirp')
// const inquirer = require('inquirer')
const { getMirror, getConfig, mirrorMapper } = require('./utils')

const {
  platform,
  arch: defaultArch,
  getDirByVersion,
  computeSha256,
  getDir,
} = require('./utils')

const mirror = getMirror()

program
  .option('--arch <arch>', 'Specify arch')
  .option('--mirror <mirror>', 'Specify mirror')
  .option('--chakracore', 'Install Node.js ChakraCore')
  .parse(process.argv)

install(version)

async function getList(mirrorId) {
  const res = await fetch(getMirror(mirrorId) + '/index.json')
  const json = await res.json()
  return json
}

async function install() {
  let [version] = program.args
  const arch = program.arch || defaultArch
  const isChakra = program.chakracore

  if (!version) {
    console.log('Please input a version')
    return
  }

  version = version.toLowerCase()

  // Get correct version
  if (isChakra) {
    if (version === 'nightly') {
      // nightly -> latest nightly version
      console.log('Looking for latest nightly version...')
      const list = await getList('chakracore_nightly')
      version = list[0].version
    }
  } else {
    if (version === 'lts') {
      // lts -> latest LTS version
      console.log('Looking for latest LTS version...')
      const list = await getList('nodejs')
      version = list.find(item => item.lts).version
      console.log('Latest LTS version is', version)
    } else if (version === 'nightly') {
      // nightly -> latest nightly version
      const list = await getList(getMirror('nightly'))
      version = list[0].version
      console.log('Latest nightly version is', version)
    } else {
      // Remove the leading `v`
      if (version.startsWith('v')) {
        version = version.slice(1)
      }

      // 8 -> latest 8.x.x
      // 8.9 -> latest 8.9.x
      // 3.2.0 -> io.js
      const [major, minor, patch] = version.split('.').map(n => parseInt(n, 10))
      if (isNaN(major)) {
        console.log('Invalid version')
        return
      }
      if (isNaN(minor) || isNaN(patch)) {
        const type = 0 < major <= 3 ? 'iojs' : 'nodejs'
        const list = await getList(type)
        version = list.find(item => {
          const [major, minor, patch] = version
            .slice(1)
            .split('.')
            .map(n => parseInt(n, 10))
          return
        })
      }

      // Recover the leading `v`
      version = 'v' + version
    }
  }

  const fileName = `node-${version}-${platform}-${arch}.tar.gz`
  const outputFileName = path.resolve('/tmp', fileName)

  // Check if already installed
  if (fs.existsSync(getDirByVersion(version))) {
    console.log(`${version} is already installed.`)
    // TODO: Auto use it
    return
  }

  // Get hash from mirror
  console.log('Computing checksum with sha256sum...')
  const hash = await getSha256FromMirror()

  if (fs.existsSync(outputFileName)) {
    compareAndExtract(outputFileName, hash)
    return
  }

  // Fetch
  const url = `${mirror}/v${version}/${fileName}`
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

  compareAndExtract(outputFileName, hash)
  // Auto use it after install
}

async function compareAndExtract(outputFileName, hash) {
  const computedHash = await computeSha256(outputFileName)
  if (computedHash === hash) {
    console.log('Checksums matched!')
    await extract(outputFileName)
  } else {
    console.log('Checksums not matched, exiting...')
  }
}

async function extract(src) {
  const destFolder = path.resolve(os.homedir(), '.nvmx/dist')
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

async function getSha256FromMirror() {
  const res = await fetch(`${mirror}/v${version}/SHASUMS256.txt`)
  const text = await res.text()
  let hash
  text.split('\n').some(line => {
    if (line.includes(fileName)) {
      hash = line.split(/\s+/)[0]
    }
  })
  return hash
}
