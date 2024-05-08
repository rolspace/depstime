import jsonfile from 'jsonfile'
import path from 'path'
import * as depstime from './depstime'

export async function run(folder, options) {
  const packageJsonPath = path.join(folder || process.cwd(), 'package.json')
  const packageJsonObject = await jsonfile.readFile(packageJsonPath)

  if (!packageJsonObject.dependencies && !packageJsonObject.devDependencies) {
    throw new Error('There are no dependencies in the package.json file.')
  }

  const dependencies = {
    ...packageJsonObject.dependencies,
    ...packageJsonObject.devDependencies,
  }

  const results = Object.keys(dependencies)
    .map((name) => depstime.create(name, dependencies[name]))
    .map((dependencyTime) => {
      const useNpm = options && !options.yarn
      const useFullTime = options && options.f && !options.c
      const useCompactTime = options && options.c && !options.f

      return depstime.process(
        dependencyTime,
        useNpm,
        useFullTime,
        useCompactTime,
      )
    })

  return {
    dependencies: await Promise.all(results),
  }
}
