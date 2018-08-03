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

    https://github.com/pd4d10/nvmx/issues/new`)
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

    nvmx add v10.7.0    # Add exact version
    nvmx add 10.7.0     # No leading \`v\` is OK
    nvmx add 10.7       # Add latest 10.7.x
    nvmx add 10         # Add latest 10.x.x
    nvmx add 3.3.1      # Add io.js 3.1.1

    nvmx add node       # Add latest Node.js
    nvmx add iojs       # Add latest io.js
    nvmx add lts        # Add latest LTS
    nvmx add rc         # Add latest RC
    nvmx add nightly    # Add latest nightly
    nvmx add v8-canary  # Add latest v8-canary

    nvmx add --arch=x86 10.7.0     # Add x86 version

    nvmx add --chakracore 10.6.0   # Add node-chakracore
    nvmx add --chakracore rc       # Add latest rc of node-chakracore
    nvmx add --chakracore nightly  # Add latest nightly of node-chakracore

    nvmx add --force 10.7.0        # Remove old added same version then add`)
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

    nvmx remove v10.7.0  # Remove exact version
    nvmx remove 10.7.0   # No leading \`v\` is OK
    nvmx remove --arch=x86 10.7.0    # Remove added x86 version
    nvmx remove --chakracore 10.6.0  # Remove node-chakracore`)
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

    nvmx use v10.7.0  # Use exact version
    nvmx use 10.7.0   # No leading \`v\` is OK
    nvmx use --arch=x86 10.7.0    # Use x86 version
    nvmx use --chakracore 10.6.0  # Use node-chakracore`)
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

    nvmx list  # List local versions, including node and node-chakracore

    nvmx list --remote
    nvmx list --remote rc            # List remote rc versions
    nvmx list --remote nightly       # List remote nightly versions
    nvmx list --remote v8-canary     # List remote v8-canary version

    nvmx list --remote --chakracore          # List remote versions of node-chakracore
    nvmx list --remote --chakracore rc       # List remote rc versions of node-chakracore
    nvmx list --remote --chakracore nightly  # List remote nightly versions of node-chakracore`)
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

    nvmx run 10.7.0 app.js              # Run app.js with specified version
    nvmx run --arch=x86 10.7.0 app.js   # Run app.js with specified version and arch
    nvmx run --chakracore 10.6.0 app.js # Run app.js with node-chakracore`)
  })

program
  .command('mirror [mirror]')
  .description('Set download mirrors')
  .action(setMirror)
  .on('--help', () => {
    console.log(`
  Examples:

    nvmx mirror taobao  # Set mirror to taobao`)
  })

program
  .command('upgrade')
  .description('Upgrade nvmx to latest')
  .action(upgrade)

program.parse(process.argv)
