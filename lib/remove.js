const fs = require('fs')
const rimraf = require('rimraf')
const { getNodeDirByMeta, getCurrent, getLocalVersions } = require('./utils')
const { use } = require('./use')

function remove(version, isChakraCore, arch) {
  const nodePath = getNodeDirByMeta(version, isChakraCore, arch)

  if (!fs.existsSync(nodePath)) {
    console.log(`${version} ${arch} is not added`)
    return
  }

  console.log(`Removing ${version} ${arch}...`)
  rimraf.sync(nodePath)
  console.log('Succeed')

  // If it is in use, switch to latest version
  if (getCurrent() === nodePath) {
    const { nodeVersions, chakraCoreVersions } = getLocalVersions()
    if (nodeVersions.length) {
      use(nodeVersions[0].version, false, nodeVersions[0].arch)
    } else if (chakraCoreVersions.length) {
      use(chakraCoreVersions[0].version, true, chakraCoreVersions[0].arch)
    }
  }
}

module.exports = { remove }
