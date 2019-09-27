import { exec } from 'child_process'
import humanize from 'humanize-duration'
import moment from 'moment'
import semver from 'semver'

function measureTime (Timediff, dependencyData, useFullTime, useCompactTime) {
  const { local: { version } } = Timediff

  const localVersion = semver.minSatisfying(dependencyData.versions, version)
  const wantedVersion = semver.maxSatisfying(dependencyData.versions, version)
  const latestVersion = dependencyData.version

  const localVersionTime = dependencyData.time[localVersion]
  const wantedVersionTime = dependencyData.time[wantedVersion]
  const latestVersionTime = dependencyData.time[latestVersion]

  const wantedMinusLocal = localVersionTime === wantedVersionTime
    ? 0
    : moment(wantedVersionTime).valueOf() - moment(localVersionTime).valueOf()

  const latestMinusLocal = localVersionTime === latestVersionTime
    ? 0
    : moment(latestVersionTime).valueOf() - moment(localVersionTime).valueOf()

  const wanted = {
    version: wantedVersion,
    time_diff: convertTime(wantedMinusLocal, useFullTime, useCompactTime),
  }

  const latest = {
    version: latestVersion,
    time_diff: convertTime(latestMinusLocal, useFullTime, useCompactTime),
  }

  return { ...Timediff, wanted, latest }
}

function convertTime (timeDiff, useFullTime, useCompactTime) {
  if (useCompactTime) {
    return humanize(timeDiff, { round: true, units: ['y', 'mo', 'w', 'd'] })
  } else if (useFullTime) {
    return humanize(timeDiff, { round: true })
  }

  return timeDiff
}

export function create (dependencyName, dependencyVersion) {
  return {
    package: dependencyName,
    local: {
      version: dependencyVersion,
    },
  }
}

export async function process (Timediff, useNpm, useFullTime, useCompactTime) {
  const npmCommand = 'npm view'
  const yarnCommand = 'yarn info'

  const command = useNpm ? npmCommand : yarnCommand

  const commandResult = await new Promise((resolve, reject) => {
    exec(`${command} ${Timediff.package} --json`, (error, stdout) => {
      if (error) reject(error)

      resolve(JSON.parse(stdout))
    })
  })

  const dependencyData = useNpm ? commandResult : commandResult.data

  const updatedTimeDiff = measureTime(Timediff, dependencyData, useFullTime, useCompactTime)

  return updatedTimeDiff
}
