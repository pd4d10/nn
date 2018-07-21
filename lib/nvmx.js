const program = require('commander')
const { version } = require('../package.json')

program
  .version(version)
  .description('Node Version Manager')
  .command('install <version>', 'Install a <version>, then use it')
  .command('uninstall <version>', 'Uninstall a version')
  .command('use <version>', 'Use')
  .command('mirror <mirror>', 'Set mirror')

  .parse(process.argv)
