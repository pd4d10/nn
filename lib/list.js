const fs = require('fs')
const chalk = require('chalk').default
const { systemArch, getLocalVersions, getCurrentMeta } = require('./utils')

function highlight(isHighlight, { version, arch }) {
  const content = systemArch === arch ? version : `${version} (${arch})`
  return isHighlight ? chalk.green(content) : content
}

function list() {
  const { nodeVersions, chakraCoreVersions } = getLocalVersions()
  if (nodeVersions.length === 0 && chakraCoreVersions.length === 0) {
    console.log('No versions added. Try `nvmx add <version>` to add a version')
    return
  }

  const current = getCurrentMeta()
  console.log(current)
  const output = `${chalk.bold('node')}:
${nodeVersions
    .map(item =>
      highlight(
        current && !current.isChakraCore && item.version === current.version,
        item,
      ),
    )
    .join('\n')}

${chalk.bold('node-chakracore')}:
${chakraCoreVersions
    .map(item =>
      highlight(
        current && current.isChakraCore && item.version === current.version,
        item,
      ),
    )
    .join('\n')}`

  console.log(output)
}

module.exports = { list }
