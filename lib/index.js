const program = require('commander')
const { version } = require('../package.json')
const install = require('./install')
const remove = require('./remove')
const list = require('./list')
const user = require('./use')

program.version(version).description('Node Version Manager')

program
  .command('install <version>')
  .alias('i')
  .description('Install a <version> and use it')
  .option('--arch <arch>', 'Specify arch')
  .option('--chakracore', 'Install Node.js ChakraCore')
  .action((version, options) => {
    install(version, options.arch, options.chakracore)
  })

program
  .command('remove <version>')
  .alias('r')
  .description('Remove a <version>')
  .option('--arch <arch>', 'Specify arch')
  .option('--chakracore', 'Install Node.js ChakraCore')
  .action((version, options) => {
    remove(version, options.arch, options.chakracore)
  })

program
  .command('list <version>')
  .alias('l')
  .description('List all versions')
  .action(() => {
    list()
  })

program
  .command('use <version>')
  .alias('u')
  .description('Use (activate) a <version>')
  .action(version => {
    use(version)
  })

program.parse(process.argv)
