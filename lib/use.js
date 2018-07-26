const fs = require('fs')
const { getRootDir, getDirByVersion } = require('./utils')

function use(version, arch, isChakra) {
  // TODO: Find match version
  // 8 -> 8.9.4 (latest)
  const linkPath = getRootDir('current')
  const nodePath = getDirByVersion(version)

  // Check if version exists
  if (!fs.existsSync(nodePath)) {
    console.log(`${version} is not yet installed`)
    console.log(
      `You need to run "nvmx install ${version}" to install it before using it.`,
    )
  } else {
    try {
      fs.unlinkSync(linkPath)
    } catch (err) {}

    fs.symlinkSync(nodePath, linkPath, 'dir')
    console.log(`Now using node v${version} (npm v5.6.0)`)
  }
}

module.exports = use
