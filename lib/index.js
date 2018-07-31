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

program
  .command('add <version>')
  .description('Add a <version> and use it')
  .option('--chakracore')
  .option('--arch <arch>')
  .option('--force')
  .action((version, options) => {
    add(version, options.chakracore, options.arch, options.force)
  })

program
  .command('remove <version>')
  .description('Remove a <version>')
  .option('--chakracore')
  .option('--arch <arch>')
  .action((version, options) => {
    remove(version, options.chakracore, options.arch)
  })

program
  .command('list [version]')
  .description('List all versions')
  .option('-r --remote')
  .option('-c --chakracore')
  .action((version, options) => {
    list(version, options.remote, options.chakracore)
  })

program
  .command('use <version>')
  .description('Use a <version>')
  .option('--chakracore')
  .option('--arch <arch>')
  .action((version, options) => {
    use(version, options.chakracore, options.arch)
  })

program.command('upgrade').action(upgrade)

program
  .command('run <version>')
  .option('-c --chakracore')
  .option('--arch <arch>')
  .action((version, options) => {
    run(version, options.chakracore, options.arch)
  })

program.command('mirror [mirror]').action(setMirror)

program.parse(process.argv)
