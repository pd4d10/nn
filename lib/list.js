const fs = require('fs')
const chalk = require('chalk').default
const {
  getRootDir,
  getTypeAndVersion,
  extractVersionAndArch,
  systemArch,
} = require('./utils')

function highlight(isHighlight, { version, arch }) {
  const content = systemArch === arch ? version : `${version} (${arch})`
  return isHighlight ? chalk.green(content) : content
}

function list() {
  const nodePath = getRootDir('node')
  const chakraPath = getRootDir('chakra')
  let nodeVersions = []
  let chakraVersions = []
  if (fs.existsSync(nodePath)) {
    nodeVersions = fs.readdirSync(nodePath).map(extractVersionAndArch)
  }
  if (fs.existsSync(chakraPath)) {
    chakraVersions = fs.readdirSync(chakraPath).map(extractVersionAndArch)
  }
  let current = fs.readlinkSync(getRootDir('current'))
  const { type, version, arch } = getTypeAndVersion(current)
  // console.log(current)

  const output = `${chalk.bold('node')}:
${nodeVersions
    .map(item => highlight(type === 'node' && item.version === version, item))
    .join('\n')}
  
${chalk.bold('node-chakracore')}:
${chakraVersions
    .map(item => highlight(type === 'chakra' && item.version === version, item))
    .join('\n')}`

  console.log(output)
}

module.exports = { list }
