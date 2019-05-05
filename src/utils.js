import child from 'child_process'
import humanize from 'humanize-duration'
import moment from 'moment'
import semver from 'semver'
import { promisify } from 'util'

const exec = util.promisify(child.exec)

export function parseDependencies(dependencies) {
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

export async function processDependencies(dependency, options) {
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

export function transform(value, options) {
  if (options && options.c) {
    return humanize(value, { round: true, units: ['y', 'mo', 'w', 'd'] })
  }
  else if (options && options.f) {
    return humanize(value, { round: true })
  }
  
  return value
}