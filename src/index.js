import { exec } from 'child_process'
import humanize from 'humanize-duration'
import path from 'path'
import { maxSatisfying, minSatisfying } from 'semver'
import { getTime } from './time.js'

export async function run(directoryPath, options, functionDependencies) {
  const { readPackageFile, createDepstime, processDepstimes } =
    functionDependencies

  const packageJsonPath = path.join(directoryPath || process.cwd(), 'package.json')
  const packageJsonObject = await readPackageFile(packageJsonPath)

  if (!packageJsonObject.dependencies && !packageJsonObject.devDependencies) {
    throw new Error('There are no dependencies in the package.json file.')
  }

  const dependencies = {
    ...packageJsonObject.dependencies,
    ...packageJsonObject.devDependencies,
  }

  const processDependencies = {
    execute: exec,
    getTime,
    getMinVersion: minSatisfying,
    getMaxVersion: maxSatisfying,
    humanizeTime: humanize,
  }

  const results = Object.keys(dependencies)
    .map((name) => createDepstime(name, dependencies[name]))
    .map((depstime) => {
      const useNpm = !options?.yarn
      const useFullTime = options?.f && !options?.c
      const useCompactTime = options?.c && !options?.f

      return processDepstimes(
        depstime,
        useNpm,
        useFullTime,
        useCompactTime,
        processDependencies,
      )
    })

  return {
    dependencies: await Promise.all(results),
  }
}
