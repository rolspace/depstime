import { exec } from 'child_process'
import humanize from 'humanize-duration'
import moment from 'moment'
import semver from 'semver'

export function transform(value, options) {
  if (options && options.c) {
    return humanize(value, { round: true, units: ['y', 'mo', 'w', 'd'] })
  }
  else if (options && options.f) {
    return humanize(value, { round: true })
  }
  
  return value
}

export function parseDependency(dependencyName, dependencyVersion) {
  return {
    package: dependencyName,
    local: {
      version: dependencyVersion
    }
  }
}

export async function processDependency(dependency, options) {
  const viewData = await new Promise((resolve, reject) => {
    exec(`npm view ${dependency.package} --json`, (error, stdout) => {
      if (error) reject(error)

      resolve(JSON.parse(stdout))
    })
  })

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

  return {...dependency, wanted, latest }
}