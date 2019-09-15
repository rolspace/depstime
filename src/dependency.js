import { exec } from 'child_process'
import humanize from 'humanize-duration'
import moment from 'moment'
import semver from 'semver'

function createTimeDiff (dependency, dependencyInfo, options) {
  const { local: { version } } = dependency

  const localVersion = semver.minSatisfying(dependencyInfo.versions, version)
  const wantedVersion = semver.maxSatisfying(dependencyInfo.versions, version)
  const latestVersion = dependencyInfo.version

  const localTime = dependencyInfo.time[localVersion]
  const wantedTime = dependencyInfo.time[wantedVersion]
  const latestTime = dependencyInfo.time[latestVersion]

  const wantedTimeDiff = localTime === wantedTime ? 0 : moment(wantedTime).valueOf() - moment(localTime).valueOf()
  const latestTimeDiff = localTime === latestTime ? 0 : moment(latestTime).valueOf() - moment(localTime).valueOf()

  const wanted = {
    version: wantedVersion,
    time_diff: convertTimeDiff(wantedTimeDiff, options),
  }

  const latest = {
    version: latestVersion,
    time_diff: convertTimeDiff(latestTimeDiff, options),
  }

  return { ...dependency, wanted, latest }
}

function convertTimeDiff (timeDiff, convertOptions) {
  if (convertOptions && convertOptions.c) {
    return humanize(timeDiff, { round: true, units: ['y', 'mo', 'w', 'd'] })
  } else if (convertOptions && convertOptions.f) {
    return humanize(timeDiff, { round: true })
  }

  return timeDiff
}

export function parse (dependencyName, dependencyVersion) {
  return {
    package: dependencyName,
    local: {
      version: dependencyVersion,
    },
  }
}

export async function process (dependency, useYarn, options) {
  const npmCommand = 'npm view'
  const yarnCommand = 'yarn info'

  const command = useYarn ? yarnCommand : npmCommand

  const commandResult = await new Promise((resolve, reject) => {
    exec(`${command} ${dependency.package} --json`, (error, stdout) => {
      if (error) reject(error)

      resolve(JSON.parse(stdout))
    })
  })

  const dependencyInfo = useYarn ? commandResult.data : commandResult

  const updatedDependency = createTimeDiff(dependency, dependencyInfo, options)

  return updatedDependency
}
