const fs = require('fs-extra')
const fetch = require('node-fetch').default
const { platform, systemArch, getRootDir } = require('./utils')
const request = require('request')
const ProgressBar = require('progress')
const { version } = require('../package.json')

async function upgrade() {
  // Resolve latest version and replace ~/.nvmx/bin/nvmx
  const res = await fetch(`https://api.github.com/repos/pd4d10/nvmx/releases`)
  const json = await res.json()
  if (json.message) {
    console.log(json.message)
    return
  }
  const latestVersion = json[0].tag_name

  // Already latest, no need to upgrade
  if (latestVersion === 'v' + version) {
    console.log(`${latestVersion} is already the latest version`)
    return
  }
  console.log(`Latest version is ${latestVersion}, upgrading...`)

  const pkgPlatform = platform === 'darwin' ? 'macos' : platform
  const suffix = platform === 'win' ? '.exe' : ''

  const fileName = `nvmx-${pkgPlatform}-${systemArch}${suffix}`

  const url = `https://github.com/pd4d10/nvmx/releases/download/${latestVersion}/${fileName}`
  console.log(`Downloading ${url}`)

  // Download to cache then replace bin
  // Because sometimes download could be interrupted and break current
  fs.ensureDir(getRootDir('cache'))
  const outputFileName = getRootDir('cache', `nvmx${suffix}`)
  await new Promise((resolve, reject) => {
    request(url)
      .on('response', res => {
        const len = parseInt(res.headers['content-length'], 10)

        bar = new ProgressBar('Downloading [:bar] :rate/bps :percent :etas', {
          width: 20,
          total: len,
          renderThrottle: 500,
        })

        res.on('data', chunk => {
          bar.tick(chunk.length)
        })
      })
      .on('error', reject)
      .on('end', resolve)
      .pipe(fs.createWriteStream(outputFileName))
  })
  console.log(`Download complete`)

  // Move to bin
  const dest = getRootDir('bin', `nvmx${suffix}`)
  await fs.move(outputFileName, dest, { overwrite: true })
  fs.chmodSync(dest, '755')

  console.log('Upgrade succeed')
}

module.exports = { upgrade }
