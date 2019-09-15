import jsonfile from 'jsonfile'
import path from 'path'
import * as dependency from './dependency'

export default async function depstime (folder, options) {
  const packageJsonFolder = folder || process.cwd()

  const packageConfig = await jsonfile.readFile(path.join(packageJsonFolder, 'package.json'))

  if (!packageConfig.dependencies && !packageConfig.devDependencies) {
    throw new Error('There are no dependencies in the package.json file.')
  }

  const dependencies = {
    ...packageConfig.dependencies,
    ...packageConfig.devDependencies,
  }

  const parsedDependencies = Object
    .keys(dependencies)
    .map(key => dependency.parse(key, dependencies[key]))

  const processedDependencies = parsedDependencies
    .map(dependencyValue => dependency.process(dependencyValue, options && options.yarn, options))

  return {
    dependencies: await Promise.all(processedDependencies),
  }
}
