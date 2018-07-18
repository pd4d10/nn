const program = require('commander')

program.option('--lts [name]').parse(process.argv)

console.log(program.lts)
