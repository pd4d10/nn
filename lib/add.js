const fs = require('fs-extra')
const path = require('path')
const fetch = require('node-fetch').default
const crypto = require('crypto')
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
  systemArch,
  getSubDir,
  warn,
  getRootDir,
} = require('./utils')
const { use } = require('./use')
const { remove } = require('./remove')

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

async function add(inputVersion, isChakraCore, arch, force = false) {
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
    downloadUrl,
    fileName,
    sha256Url,
    tempFile,
    destDir,
  } = await getMirrorAndVersion(inputVersion, isChakraCore, arch)

  if (force) {
    warn(`--force selected, will Remove ${version} ${arch} and then add it`)
    const isRemoved = remove(version, isChakraCore, arch)
    if (!isRemoved) {
      return
    }
  } else if (fs.existsSync(destDir)) {
    // Check if already added
    console.log(`${version} ${arch} is already added, will use it...`)
    use(version, isChakraCore, arch)
    return
  }

  // Check if already downloaded
  if (fs.existsSync(tempFile)) {
    const isMatch = await compareHash(fileName, tempFile, sha256Url)
    if (isMatch) {
      await extract(tempFile, destDir)
      use(version, isChakraCore, arch)
      return
    }
  }

  await fetchFromRemote(downloadUrl, tempFile)
  const isMatch = await compareHash(fileName, tempFile, sha256Url)
  if (isMatch) {
    await extract(tempFile, destDir)
    use(version, isChakraCore, arch)
  } else {
    console.log('SHA256 Not match, aborted, please check your mirror')
  }
}

async function compareHash(fileName, filePath, sha256Url) {
  console.log('Computing checksum with sha256sum...')

  const [hash, computedHash] = await Promise.all([
    (async () => {
      const res = await fetch(sha256Url)
      const text = await res.text()
      const matchLine = text.split('\n').find(line => line.includes(fileName))
      if (matchLine) {
        return matchLine.split(/\s+/)[0]
      } else {
        throw new Error('Can not find SHA256' + sha256Url + fileName)
      }
    })(),
    new Promise((resolve, reject) => {
      const sha256sum = crypto.createHash('sha256')
      fs.createReadStream(filePath)
        .on('error', reject)
        .on('data', data => {
          sha256sum.update(data)
        })
        .on('end', () => {
          resolve(sha256sum.digest('hex'))
        })
    }),
  ])

  const isMatch = hash === computedHash
  if (isMatch) {
    console.log('sha256sum matched!')
  }
  return isMatch
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
  console.log('Extracting...')
  await fs.ensureDir(destFolder)
  await new Promise((resolve, reject) => {
    const finish = () => {
      console.log('Extracting succeed')
      resolve()
    }
    if (src.endsWith('.tar.gz')) {
      targz.decompress(
        {
          src,
          dest: destFolder,
          tar: {
            strip: 1,
          },
        },
        err => (err ? reject(err) : finish()),
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
        .on('close', finish)
    }
  })
}

module.exports = {
  add,
  getMirrorAndVersion,
}
