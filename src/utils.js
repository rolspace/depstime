import { exec } from 'child_process'
import humanize from 'humanize-duration'
import moment from 'moment'
import semver from 'semver'

export function transform (value, options) {
  if (options && options.c) {
    return humanize(value, { round: true, units: ['y', 'mo', 'w', 'd'] })
  } else if (options && options.f) {
    return humanize(value, { round: true })
  }

  return value
}

export function parseDependency (dependencyName, dependencyVersion) {
  return {
    package: dependencyName,
    local: {
      version: dependencyVersion
    }
  }
}

export async function processDependency (dependency, options) {
  const viewData = await new Promise((resolve, reject) => {
    exec(`npm view ${dependency.package} --json`, (error, stdout) => {
      if (error) reject(error)

      resolve(JSON.parse(stdout))
    })
  })

  const { local: { version } } = dependency

  const localVersion = semver.minSatisfying(viewData.versions, version)
  const wantedVersion = semver.maxSatisfying(viewData.versions, version)
  const latestVersion = viewData.version

  const localTime = viewData.time[localVersion]
  const wantedTime = viewData.time[wantedVersion]
  const latestTime = viewData.time[latestVersion]

  const wantedTimeDiff = localTime === wantedTime ? 0 : moment(wantedTime).valueOf() - moment(localTime).valueOf()
  const latestTimeDiff = localTime === latestTime ? 0 : moment(latestTime).valueOf() - moment(localTime).valueOf()

  const wanted = {
    version: wantedVersion,
    time_diff: transform(wantedTimeDiff, options)
  }

  const latest = {
    version: latestVersion,
    time_diff: transform(latestTimeDiff, options)
  }

  return { ...dependency, wanted, latest }
}
