import util from 'util';
import yargs from 'yargs';
import depstime from './index';

export default async function cli() {
	const options = yargs
    .usage('$0 [directory]')
    .option('compact', {
      alias: 'c',
      describe: 'Output time difference as a human readable value up to the \'days\' unit with rounding',
      type: 'boolean'
    })
    .option('full', {
      alias: 'f',
      describe: 'Output time difference as a human readable value up to the \'seconds\' unit with rounding',
      type: 'boolean'
    })
    .help('help', 'Show help message')
    .argv

  try {
    const result = await depstime(options._[0], options)
    console.log(util.inspect(result, { colors: true, depth: null }))
  }
  catch (error) {
    console.log(error)
  }
}