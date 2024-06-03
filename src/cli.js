import jsonfile from 'jsonfile'
import util from 'util'
import yargs from 'yargs'
import { create, process } from './depstime.js'
import { run } from './index.js'

export default async function cli() {
  // eslint-disable-next-line prefer-destructuring
  const options = yargs()
    .usage('$0 [folder]')
    .option('yarn', {
      describe: 'use yarn instead of npm',
      type: 'boolean',
    })
    .option('compact', {
      alias: 'c',
      describe:
        'Output time difference as a human readable value up to the "days" unit with rounding',
      type: 'boolean',
    })
    .option('full', {
      alias: 'f',
      describe:
        'Output time difference as a human readable value up to the "seconds" unit with rounding',
      type: 'boolean',
    })
    .help('help', 'Show help message').argv

  try {
    // eslint-disable-next-line prefer-destructuring
    const [folder] = options._

    const { readFile } = jsonfile
    const runDependencies = {
      readPackageFile: readFile,
      createDepstime: create,
      processDepstimes: process,
    }
    const result = await run(folder, options, runDependencies)

    console.log(util.inspect(result, { colors: true, depth: null }))
  } catch (error) {
    console.log(error)
  }
}
