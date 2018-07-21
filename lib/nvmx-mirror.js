const program = require('commander')
const inquirer = require('inquirer')
const { setConfig, mirrorMapper } = require('./utils')

program.parse(process.argv)
setMirror(program.args[0])

async function setMirror(mirror) {
  const list = Object.entries(mirrorMapper)
  if (!mirror) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'id',
        message: 'Choose mirror:',
        choices: list.map(([id]) => id),
      },
    ])
    mirror = answers.id
  }

  if (!list.some(([id]) => id === mirror)) {
    console.log('Mirror should be one of ' + list.map(([id]) => id))
  }

  setConfig({ mirror })
}
