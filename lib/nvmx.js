const program = require('commander')
const { version } = require('../package.json')

program
  .version(version)
  .description('Node Version Manager')
  .command('install <version> [arch]', 'Download and install a <version>')
  .command('uninstall <version>', 'Uninstall a version')
  .command('use <version>', 'Use')

  .parse(process.argv)
