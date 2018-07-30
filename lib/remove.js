const fs = require('fs')
const rimraf = require('rimraf')
const path = require('path')
const {
  getNodeDirByMeta,
  getCurrent,
  getLocalVersions,
  ensureArchCorrect,
} = require('./utils')
const { use } = require('./use')

function remove(version, isChakraCore, arch) {
  arch = ensureArchCorrect(arch)
  const nodePath = getNodeDirByMeta(version, isChakraCore, arch)

  if (!fs.existsSync(nodePath)) {
    console.log(`${version} ${arch} is not added`)
    return
  }


  // If it is in use, switch to another version
  // files removal before unlink will throw errors at Windows
  // So unlink it first
  // Use path.resolve to remove possible trailing slash
  if (path.resolve(getCurrent()) === path.resolve(nodePath)) {
    // TODO: Try to use another version
    // console.log('You are using it now. Try to use another version...')
    // const { nodeVersions, chakraCoreVersions } = getLocalVersions()
    // if (nodeVersions.length) {
    //   use(nodeVersions[0].version, false, nodeVersions[0].arch)
    // } else if (chakraCoreVersions.length) {
    //   use(chakraCoreVersions[0].version, true, chakraCoreVersions[0].arch)
    // } else {
    //   console.log('No other versions found')
    // }
    console.log('You are using it now. Try to use another version, then it could be removed')
    return
  }

  console.log(`Removing ${version} ${arch}...`)
  rimraf.sync(nodePath)
  console.log('Removal succeed')
}

module.exports = { remove }
