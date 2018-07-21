const os = require('os')
const fs = require('fs')
const path = require('path')
const targz = require('targz')
const fetch = require('node-fetch').default
const program = require('commander')
const mkdirp = require('mkdirp')
const inquirer = require('inquirer')

const {
  platform,
  arch: defaultArch,
  getDirByVersion,
  computeSha256,
  getDir,
} = require('./utils')

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

install(version)

async function getList() {
  const jsonFile = getDir('dist/index.json')
  if (fs.existsSync(jsonFile)) {
    return require(jsonFile, 'utf8')
  } else {
    const res = await fetch(`${mirror}/index.json`)
    const json = await res.json()
    fs.writeFileSync(jsonFile, JSON.stringify(json))
    return json
  }
}

async function install(version) {
  if (!version) {
    const list = await getList()
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'version',
        message: 'Choose version:',
        choices: list.map(item => item.version),
      },
    ])
    version = answers.version.slice(1)
  }

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
