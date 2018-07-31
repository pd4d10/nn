const fs = require('fs')
const os = require('os')
const chalk = require('chalk').default
const {
  systemArch,
  getLocalVersions,
  getCurrentMeta,
  getMirrorUrlByType,
  getVersionList,
} = require('./utils')

function highlight(isHighlight, { version, arch }) {
  const content = systemArch === arch ? version : `${version} (${arch})`
  return isHighlight ? chalk.green(content) : content
}

function listLocal() {
  const { nodeVersions, chakraCoreVersions } = getLocalVersions()
  if (nodeVersions.length === 0 && chakraCoreVersions.length === 0) {
    console.log('No versions added. Try `nvmx add <version>` to add a version')
    return
  }

  const current = getCurrentMeta()
  // console.log(current)
  const output = `${chalk.bold('node')}:
${nodeVersions
    .map(item =>
      highlight(
        current &&
          !current.isChakraCore &&
          item.version === current.version &&
          item.arch === current.arch,
        item,
      ),
    )
    .join(os.EOL)}

${chalk.bold('node-chakracore')}:
${chakraCoreVersions
    .map(item =>
      highlight(
        current &&
          current.isChakraCore &&
          item.version === current.version &&
          item.arch === current.arch,
        item,
      ),
    )
    .join(os.EOL)}`

  console.log(output)
}

async function listRemote(version, isChakraCore) {
  let mirror
  if (version === 'nightly') {
    mirror = getMirrorUrlByType('nightly', isChakraCore)
  } else if (version === 'rc') {
    mirror = getMirrorUrlByType('rc', isChakraCore)
  } else {
    mirror = getMirrorUrlByType('node')
  }
  console.log('Fetching versions...')
  const list = await getVersionList(mirror)
  // TODO: Highlight added versions
  console.log(list.map(item => item.version).join(os.EOL))
}

async function list(version, isRemote, isChakraCore) {
  if (isRemote) {
    await listRemote(version, isChakraCore)
  } else {
    listLocal()
  }
}

module.exports = { list }
