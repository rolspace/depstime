import jsonfile from 'jsonfile'
import path from 'path'
import * as utils from './utils'

export default async function depstime (folder, options) {
  let packageJsonFolder = folder || process.cwd()

  const packageJson = await jsonfile.readFile(path.join(packageJsonFolder, 'package.json'))

  if (!packageJson.hasOwnProperty('dependencies') && !packageJson.hasOwnProperty('devDependencies')) {
    throw new Error('There are no dependencies in the package.json file.')
  }

  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  }

  const parsedDependencies = Object
    .keys(dependencies)
    .map(key => utils.parseDependency(key, dependencies[key]))

  const processedDependencies = parsedDependencies
    .map(dependency => utils.processDependency(dependency, options))

  return {
    dependencies: await Promise.all(processedDependencies)
  }
}
