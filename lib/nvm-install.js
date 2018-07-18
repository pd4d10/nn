const program = require('commander')

program
  .option('-s, --source <source>', 'from source')
  .option(
    '--lts [abc]',
    'When installing, only select from LTS (long-term support) versions',
  )
  .parse(process.argv)

console.log(program.lts)
