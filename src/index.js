import child from 'child_process';
import humanize from 'humanize-duration';
import jsonfile from 'jsonfile';
import moment from 'moment';
import path from 'path';
import semver from 'semver';
import util from 'util';

const exec = util.promisify(child.exec)

export default async function depstime(directory, options) {
  if (!directory) {
    directory = process.cwd()
  }
  
  const packageObj = await jsonfile.readFile(path.join(directory, 'package.json'))

  if (!packageObj.hasOwnProperty('dependencies') && !packageObj.hasOwnProperty('devDependencies')) {
    throw new Error('There are no dependencies in the package.json file.')
  }

  const dependencies = { ...packageObj.dependencies, ...packageObj.devDependencies }
  const parsedDependencies = parseDependencies(dependencies)
  
  const promises = parsedDependencies.map(dependency => processDependencies(dependency, options))

  return { dependencies: await Promise.all(promises) }
}

function parseDependencies(dependencies) {
  const parsedDependencies = Object.keys(dependencies).map(key => {
    return {
      package: key,
      local: {
        version: dependencies[key]
      }
    }
  })

  return parsedDependencies
}

async function processDependencies(dependency, options) {
  try {
    const { stdout, stderr } = await exec(`npm view ${dependency.package} --json`)
    const viewData = JSON.parse(stdout)
    
    const { local: {version} } = dependency

    const localVersion = semver.minSatisfying(viewData.versions, version)
    const wantedVersion = semver.maxSatisfying(viewData.versions, version)
    const latestVersion = viewData.version
    
    const localDate = viewData.time[localVersion]
    const wantedDate = viewData.time[wantedVersion]
    const latestDate = viewData.time[latestVersion]
    
    const wantedTimeDiff = localDate === wantedDate ? 0 : moment(wantedDate).valueOf() - moment(localDate).valueOf()
    const latestTimeDiff = localDate === latestDate ? 0 :  moment(latestDate).valueOf() - moment(localDate).valueOf()

    const wanted = {
      version: wantedVersion,
      time_diff: transform(wantedTimeDiff, options)
    }

    const latest =  {
      version: latestVersion,
      time_diff: transform(latestTimeDiff, options)
    }

    const processedDependency = {...dependency, wanted, latest }
    return processedDependency
  }
  catch (error) {
    console.log(error)
  }
}

function transform(value, options) {
  if (options && options.c) {
    return humanize(value, { round: true, units: ['y', 'mo', 'w', 'd'] })
  }
  else if (options && options.f) {
    return humanize(value, { round: true })
  }
  
  return value
}