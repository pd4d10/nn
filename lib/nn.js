const program = require('commander')
const { version } = require('../package.json')
const { add } = require('./add')
const { remove } = require('./remove')
const { list } = require('./list')
const { use } = require('./use')
const { upgrade } = require('./upgrade')
const { run } = require('./run')
const { setMirror } = require('./mirror')

program
  .version(version)
  .description(`Node.js Version Manager`)
  .on('--help', () => {
    console.log(`
  Submit an issue:

    https://github.com/pd4d10/nn/issues/new`)
  })

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
  .on('--help', () => {
    console.log(`
  Examples:

    nn add v10.7.0    # Add exact version
    nn add 10.7.0     # No leading \`v\` is OK
    nn add 10.7       # Add latest 10.7.x
    nn add 10         # Add latest 10.x.x
    nn add 3.3.1      # Add io.js 3.1.1

    nn add node       # Add latest Node.js
    nn add iojs       # Add latest io.js
    nn add lts        # Add latest LTS
    nn add rc         # Add latest RC
    nn add nightly    # Add latest nightly
    nn add v8-canary  # Add latest v8-canary

    nn add --arch=x86 10.7.0     # Add x86 version

    nn add --chakracore 10.6.0   # Add node-chakracore
    nn add --chakracore rc       # Add latest rc of node-chakracore
    nn add --chakracore nightly  # Add latest nightly of node-chakracore

    nn add --force 10.7.0        # Remove old added same version then add`)
  })

program
  .command('remove <version>')
  .description('Remove a <version>')
  .option(...CC_MESSAGE)
  .option(...ARCH_MESSAGE)
  .action((version, options) => {
    remove(version, options.chakracore, options.arch)
  })
  .on('--help', () => {
    console.log(`
  Examples:

    nn remove v10.7.0  # Remove exact version
    nn remove 10.7.0   # No leading \`v\` is OK
    nn remove --arch=x86 10.7.0    # Remove added x86 version
    nn remove --chakracore 10.6.0  # Remove node-chakracore`)
  })

program
  .command('use <version>')
  .description('Use a <version>')
  .option(...CC_MESSAGE)
  .option(...ARCH_MESSAGE)
  .action((version, options) => {
    use(version, options.chakracore, options.arch)
  })
  .on('--help', () => {
    console.log(`
  Examples:

    nn use v10.7.0  # Use exact version
    nn use 10.7.0   # No leading \`v\` is OK
    nn use --arch=x86 10.7.0    # Use x86 version
    nn use --chakracore 10.6.0  # Use node-chakracore`)
  })

program
  .command('list [version]')
  .description('List versions')
  .option('-r --remote', 'List remote versions')
  .option(...CC_MESSAGE)
  .action((version, options) => {
    list(version, options.remote, options.chakracore)
  })
  .on('--help', () => {
    console.log(`
  Examples:

    nn list  # List local versions, including node and node-chakracore

    nn list --remote
    nn list --remote rc            # List remote rc versions
    nn list --remote nightly       # List remote nightly versions
    nn list --remote v8-canary     # List remote v8-canary version

    nn list --remote --chakracore          # List remote versions of node-chakracore
    nn list --remote --chakracore rc       # List remote rc versions of node-chakracore
    nn list --remote --chakracore nightly  # List remote nightly versions of node-chakracore`)
  })

program
  .command('run <version>')
  .description('Run script with specific version')
  .option(...CC_MESSAGE)
  .option(...ARCH_MESSAGE)
  .action((version, options) => {
    run(version, options.chakracore, options.arch)
  })
  .on('--help', () => {
    console.log(`
  Examples:

    nn run 10.7.0 app.js              # Run app.js with specified version
    nn run --arch=x86 10.7.0 app.js   # Run app.js with specified version and arch
    nn run --chakracore 10.6.0 app.js # Run app.js with node-chakracore`)
  })

program
  .command('mirror [mirror]')
  .description('Set download mirrors')
  .action(setMirror)
  .on('--help', () => {
    console.log(`
  Examples:

    nn mirror taobao  # Set mirror to taobao`)
  })

program
  .command('upgrade')
  .description('Upgrade nn to latest')
  .action(upgrade)

program.parse(process.argv)

// https://github.com/tj/commander.js/issues/7#issuecomment-32448653
if (program.args.length === 0) {
  program.help()
}
