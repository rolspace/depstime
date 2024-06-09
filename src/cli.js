import jsonfile from 'jsonfile'
import util from 'util'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import * as depstime from './depstime.js'
import { run } from './index.js'

export default async function cli() {
  const commandDefinition = yargs(hideBin(process.argv))
    .command(
      '$0 [directoryPath]',
      'Calculate the time differences in your package.json dependencies with the wanted/latest versions',
      (yargs) => {
        yargs.positional('[directoryPath]', {
          describe:
            'Path of the directory where the package.json file is located',
          default: '.',
        })
      },
    )
    .option('yarn', {
      describe: 'use yarn instead of npm',
      type: 'boolean',
    })
    .option('compact', {
      alias: 'c',
      describe:
        'Output time data as a human readable value up to the "days" unit with rounding',
      type: 'boolean',
    })
    .option('full', {
      alias: 'f',
      describe:
        'Output time data as a human readable value up to the "seconds" unit with rounding',
      type: 'boolean',
    })
    .help('help', 'Show help message')
    .parse()

  try {
    const { directoryPath } = commandDefinition

    const { readFile } = jsonfile
    const runDependencies = {
      readPackageFile: readFile,
      createDepstime: depstime.create,
      processDepstime: depstime.process,
    }
    const result = await run(directoryPath, commandDefinition, runDependencies)

    console.log(util.inspect(result, { colors: true, depth: null }))
  } catch (error) {
    console.log(error)
  }
}
