const program = require('commander')

program.option('--lts [name]').parse(process.argv)

const [version] = program.args
