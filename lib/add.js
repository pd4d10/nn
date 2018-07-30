const os = require('os')
const fs = require('fs-extra')
const path = require('path')
const targz = require('targz')
const unzipper = require('unzipper')
const request = require('request')
const ProgressBar = require('progress')
const { Writer } = require('fstream')

const {
  platform,
  ensureArchCorrect,
  getVersionList,
  parseVersion,
  getMirror,
  getSha256FromRemote,
  computeSha256,
  systemArch,
  getSubDir,
  getRootDir,
} = require('./utils')
const { use } = require('./use')

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

  const packageName = mirrorType === 'iojs' ? 'iojs' : 'node'
  const suffix = platform === 'win' ? 'zip' : 'tar.gz'
  const fileName = `${packageName}-${version}-${platform}-${arch}.${suffix}`
  const sha256Url = `${mirror}/${version}/SHASUMS256.txt`
  const downloadUrl = `${mirror}/${version}/${fileName}`
  const dirName = getSubDir(isChakraCore)
  const tempFile = getRootDir('cache', dirName, fileName)
  const destDir = getRootDir(dirName, `${version}-${arch}`)

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

  arch = ensureArchCorrect(arch)

  // In most cases, only Windows x64 need to use both x64 and x86
  if (platform !== 'win' && arch !== systemArch) {
    warn(`${arch} is selected, but your system arch is ${systemArch}`)
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

    use(version, isChakraCore, arch)
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
    use(version, isChakraCore, arch)
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

  await fs.ensureDir(path.parse(outputFileName).dir)
  await new Promise((resolve, reject) => {
    request(url)
      .on('response', res => {
        if (res.statusCode >= 400) {
          return reject(`${version} not found, please input a valid version`)
        }
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
}

async function extract(src, destFolder) {
  await fs.ensureDir(destFolder)
  await new Promise((resolve, reject) => {
    if (src.endsWith('.tar.gz')) {
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
    } else if (src.endsWith('.zip')) {
      fs.createReadStream(src)
        .pipe(unzipper.Parse())
        .on('entry', function(entry) {
          if (entry.type === 'Directory') {
            return
          }
          // Do strip and resolve
          const strip = entry.path.replace(/.*?\//, '')
          entry.pipe(Writer(path.resolve(destFolder, strip)))
        })
        .on('error', reject)
        .on('close', resolve)
    }
  })
}

module.exports = {
  add,
  getMirrorAndVersion,
}
