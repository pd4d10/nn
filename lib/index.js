const program = require('commander')
const { version } = require('../package.json')
const install = require('./install')
const remove = require('./remove')
const list = require('./list')
const use = require('./use')

program.version(version).description('Node Version Manager')

program
  .command('install <version>')
  .alias('i')
  .description('Install a <version> and use it')
  .option('--arch <arch>', 'Specify arch')
  .option('--chakra', 'Install Node.js ChakraCore')
  .action((version, options) => {
    install(version, options.arch, options.chakra)
  })

program
  .command('remove <version>')
  .alias('r')
  .description('Remove a <version>')
  .option('--arch <arch>', 'Specify arch')
  .option('--chakra', 'Install Node.js ChakraCore')
  .action((version, options) => {
    remove(version, options.arch, options.chakra)
  })

program
  .command('list [version]')
  .alias('l')
  .description('List all versions')
  .option('--arch <arch>', 'Specify arch')
  .option('--chakra', 'Install Node.js ChakraCore')
  .action(() => {
    list()
  })

program
  .command('use <version>')
  .alias('u')
  .description('Use (activate) a <version>')
  .option('--arch <arch>', 'Specify arch')
  .option('--chakra', 'Install Node.js ChakraCore')
  .action((version, options) => {
    use(version, options.arch, options.chakra)
  })

program.parse(process.argv)
