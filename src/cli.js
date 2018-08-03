import util from 'util'
import yargs from 'yargs'
import minimist from 'minimist'
import depstime from './index'

export default function cli() {
	const options = yargs
    .usage('$0 [directory]')
    .option('human-compact', {
      alias: 'c',
      describe: 'Output time difference as a human readable value up to the \'days\' unit with rounding',
      type: 'boolean'
    })
    .option('human-full', {
      alias: 'f',
      describe: 'Output time difference as a human readable value up to the \'seconds\' unit with rounding',
      type: 'boolean'
    })
    .help('help', 'Show help message')
    .argv
  
  depstime(options._[0], options)
    .then(value => console.log(util.inspect(value, { colors: true, depth: null })))
    .catch(error => console.log(error))
}