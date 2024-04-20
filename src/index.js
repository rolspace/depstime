import jsonfile from 'jsonfile'
import path from 'path'
import * as timediff from './timediff'

export async function depstime(folder, options) {
  const packageJsonPath = path.join(folder || process.cwd(), 'package.json')
  const packageConfig = await jsonfile.readFile(packageJsonPath)

  if (!packageConfig.dependencies && !packageConfig.devDependencies) {
    throw new Error('There are no dependencies in the package.json file.')
  }

  const dependencies = {
    ...packageConfig.dependencies,
    ...packageConfig.devDependencies,
  }

  const results = Object.keys(dependencies)
    .map((name) => timediff.create(name, dependencies[name]))
    .map((Timediff) => {
      const useNpm = options && !options.yarn
      const useFullTime = options && options.f && !options.c
      const useCompactTime = options && options.c && !options.f

      return timediff.process(Timediff, useNpm, useFullTime, useCompactTime)
    })

  return {
    dependencies: await Promise.all(results),
  }
}
