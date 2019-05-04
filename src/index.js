import jsonfile from 'jsonfile';
import path from 'path';
import * as utils from './utils';

export default async function depstime(directory, options) {
  if (!directory) {
    directory = process.cwd()
  }
  
  const packageObj = await jsonfile.readFile(path.join(directory, 'package.json'))

  if (!packageObj.hasOwnProperty('dependencies') && !packageObj.hasOwnProperty('devDependencies')) {
    throw new Error('There are no dependencies in the package.json file.')
  }

  const dependencies = { ...packageObj.dependencies, ...packageObj.devDependencies }
  const parsedDependencies = utils.parseDependencies(dependencies)
  
  const promises = parsedDependencies.map(dependency => utils.processDependencies(dependency, options))

  return { dependencies: await Promise.all(promises) }
}