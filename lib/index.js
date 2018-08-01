const program = require('commander')
const { version } = require('../package.json')
const { add } = require('./add')
const { remove } = require('./remove')
const { list } = require('./list')
const { use } = require('./use')
const { upgrade } = require('./upgrade')
const { run } = require('./run')
const { setMirror } = require('./mirror')

program.version(version).description('Node Version Manager')

const CC_MESSAGE = ['-c --chakracore', 'Specify node-chakracore']
const ARCH_MESSAGE = ['-a --arch <arch>', 'Specify arch like x86, x64']

program
  .command('add <version>')
  .description('Add a <version> and use it')
  .option(...CC_MESSAGE)
  .option(...ARCH_MESSAGE)
  .option('-f --force', 'Remove old added same version then add')
  .action((version, options) => {
    add(version, options.chakracore, options.arch, options.force)
  })

program
  .command('remove <version>')
  .description('Remove a <version>')
  .option(...CC_MESSAGE)
  .option(...ARCH_MESSAGE)
  .action((version, options) => {
    remove(version, options.chakracore, options.arch)
  })

program
  .command('use <version>')
  .description('Use a <version>')
  .option(...CC_MESSAGE)
  .option(...ARCH_MESSAGE)
  .action((version, options) => {
    use(version, options.chakracore, options.arch)
  })

program
  .command('list [version]')
  .description('List versions')
  .option('-r --remote', 'List remote versions')
  .option(...CC_MESSAGE)
  .action((version, options) => {
    list(version, options.remote, options.chakracore)
  })

program
  .command('run <version>')
  .description('Run script with specific version')
  .option(...CC_MESSAGE)
  .option(...ARCH_MESSAGE)
  .action((version, options) => {
    run(version, options.chakracore, options.arch)
  })

program
  .command('mirror [mirror]')
  .description('Set download mirrors')
  .action(setMirror)

program
  .command('upgrade')
  .description('Upgrade nvmx to latest')
  .action(upgrade)

program.parse(process.argv)
