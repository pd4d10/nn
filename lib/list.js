const fs = require('fs')
const chalk = require('chalk').default
const {
  getRootDir,
  getMetaByNodeDir,
  extractVersionAndArch,
  systemArch,
} = require('./utils')

function highlight(isHighlight, { version, arch }) {
  const content = systemArch === arch ? version : `${version} (${arch})`
  return isHighlight ? chalk.green(content) : content
}

function list() {
  const nodePath = getRootDir('node')
  const chakraPath = getRootDir('chakracore')
  const linkPath = getRootDir('current')

  let nodeVersions = []
  let chakraVersions = []
  if (fs.existsSync(nodePath)) {
    nodeVersions = fs.readdirSync(nodePath).map(extractVersionAndArch)
  }
  if (fs.existsSync(chakraPath)) {
    chakraVersions = fs.readdirSync(chakraPath).map(extractVersionAndArch)
  }

  if (nodeVersions.length === 0 && chakraVersions.length === 0) {
    console.log('No versions added. Try `nvmx add <version>` to add a version')
    return
  }

  if (!fs.existsSync(linkPath)) {
    console.log(
      'Seems no version is used. Try `nvmx list` to list all version, and `nvmx use <version>` to use one',
    )
    return
  }

  let current = fs.readlinkSync(linkPath)
  const { isChakraCore, version, arch } = getMetaByNodeDir(current)
  // console.log(current)

  const output = `${chalk.bold('node')}:
${nodeVersions
    .map(item => highlight(!isChakraCore && item.version === version, item))
    .join('\n')}

${chalk.bold('node-chakracore')}:
${chakraVersions
    .map(item => highlight(isChakraCore && item.version === version, item))
    .join('\n')}`

  console.log(output)
}

module.exports = { list }
