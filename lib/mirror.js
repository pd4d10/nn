const chalk = require('chalk').default
const { setConfig } = require('./utils')
const { mirrorMapper } = require('./constants')

// TODO: Custom mirror
async function setMirror(mirror) {
  const list = Object.entries(mirrorMapper)
  const mirrors = list.map(([id]) => chalk.green(id)).join(', ')
  if (!mirror) {
    console.log('Run `nvmx mirror <mirror>` to set a mirror')
    console.log(`Available mirrors: ${mirrors}`)
    return
  }

  if (!list.some(([id]) => id === mirror)) {
    console.log(`Mirror should be one of ${mirrors}`)
    return
  }

  setConfig({ mirror })
  console.log(`Mirror set to ${mirror}`)
}

module.exports = {
  setMirror,
}
