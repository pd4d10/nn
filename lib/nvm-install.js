const os = require('os')
const fs = require('fs')
const crypto = require('crypto')
const fetch = require('node-fetch')
const program = require('commander')

const mirror = process.env.NVM_NODEJS_ORG_MIRROR || 'https://nodejs.org/dist'

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

function getPackageUrl(version, arch) {
  return `${mirror}/v${version}/node-v${version}-${platform}-${arch}.tar.xz`
}

program
  .option('-s, --source <source>', 'from source')
  .option(
    '--lts [abc]',
    'When installing, only select from LTS (long-term support) versions',
  )
  .parse(process.argv)

const [version, arch = 'x64'] = program.args
const fileName = `node-v${version}-${platform}-${arch}.tar.gz`

install()

async function install() {
  const url = `${mirror}/v${version}/${fileName}`

  console.log('Downloading', url)
  const res = await fetch(url)

  await new Promise((resolve, reject) => {
    res.body.pipe(fs.createWriteStream(fileName).on('finish', resolve))
    res.body.on('error', reject)
  })

  console.log('Finish')
  console.log('Checking SHA256')
  const hash = await getSha256()

  const calculatedHash = await new Promise((resolve, reject) => {
    const sha256sum = crypto.createHash('sha256')
    const fr = fs.createReadStream(fileName)
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
    console.log('Pass')
  }
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
