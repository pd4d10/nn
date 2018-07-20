const os = require('os')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const targz = require('targz')
const fetch = require('node-fetch').default
const program = require('commander')
const mkdirp = require('mkdirp')
const { platform, arch: defaultArch, getDirByVersion } = require('./utils')

const mirror = process.env.NVM_NODEJS_ORG_MIRROR || 'https://nodejs.org/dist'

program
  .option('-s, --source <source>', 'from source')
  .option(
    '--lts [abc]',
    'When installing, only select from LTS (long-term support) versions',
  )
  .parse(process.argv)

const [version, arch = defaultArch] = program.args
// if (arch && platform !== 'win') {
//   console.log('arch option is useful only for windows, ignoring')
// }
const fileName = `node-v${version}-${platform}-${arch}.tar.gz`
const outputFileName = path.resolve('/tmp', fileName)

install()

// TODO: Use stream
async function install() {
  const [major, minor, patch] = version.split('.')
  if (!minor || !patch) {
    throw new Error('Wrong version')
  }

  // Check if already installed
  if (fs.existsSync(getDirByVersion(version))) {
    console.log(`v${version} is already installed.`)
    // TODO: Auto use it
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

  // Check hash
  console.log('Computing checksum with sha256sum...')
  const hash = await getSha256()

  const calculatedHash = await new Promise((resolve, reject) => {
    const sha256sum = crypto.createHash('sha256')
    const fr = fs.createReadStream(outputFileName)
    fr.on('error', reject)
    fr.on('data', data => {
      sha256sum.update(data)
    })
    fr.on('end', () => {
      resolve(sha256sum.digest('hex'))
    })
  })

  console.log(hash)
  if (calculatedHash === hash) {
    console.log('Checksums matched!')
  }

  const destFolder = path.resolve(
    os.homedir(),
    '.nvmx/dist',
    `node-v${version}-${platform}-${arch}`,
  )
  if (!fs.existsSync(destFolder)) {
    mkdirp(destFolder)
  }

  // Extract files
  await new Promise((resolve, reject) => {
    targz.decompress(
      {
        src: outputFileName,
        dest: destFolder,
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

  // Auto use it after install
}

async function getSha256() {
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
