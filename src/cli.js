import util from 'util'
import yargs from 'yargs'
import depstime from './index'

export default async function cli() {
	const options = yargs
    .usage('$0 [folder]')
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
    const folder = options._[0]
    const result = await depstime(folder, options)
    
    console.log(util.inspect(result, { colors: true, depth: null }))
  }
  catch (error) {
    console.log(error)
  }
}