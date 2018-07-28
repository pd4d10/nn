const fs = require('fs')
const chalk = require('chalk').default
const { getRootDir, getTypeAndVersion } = require('./utils')

function highlight(isHighlight, content) {
  return isHighlight ? chalk.green(content) : content
}

function format(nodeVersions, chakraVersions, [type, versionArch]) {
  return `${chalk.bold('node')}:
${nodeVersions
    .map(v => highlight(type === 'node' && v === versionArch, v))
    .join('\n')}

${chalk.bold('node-chakracore')}:
${chakraVersions
    .map(v => highlight(type === 'chakra' && v === versionArch, v))
    .join('\n')}`
}

function list() {
  const nodePath = getRootDir('node')
  const chakraPath = getRootDir('chakra')
  let nodeVersions = []
  let chakraVersions = []
  if (fs.existsSync(nodePath)) {
    nodeVersions = fs.readdirSync(nodePath)
  }
  if (fs.existsSync(chakraPath)) {
    chakraVersions = fs.readdirSync(chakraPath)
  }
  let current = fs.readlinkSync(getRootDir('current'))
  current = getTypeAndVersion(current)
  // console.log(current)
  console.log(format(nodeVersions, chakraVersions, current))
}

module.exports = list
