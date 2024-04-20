import { exec } from 'child_process'
import humanize from 'humanize-duration'
import moment from 'moment'
import semver from 'semver'

function measureTime(Timediff, dependencyData, useFullTime, useCompactTime) {
  const {
    local: { version: packageJsonVersion },
  } = Timediff
  const { time, version, versions } = dependencyData

  const localVersion = semver.minSatisfying(versions, packageJsonVersion)
  const wantedVersion = semver.maxSatisfying(versions, packageJsonVersion)
  const latestVersion = version

  const { [localVersion]: localVersionTime } = time
  const { [wantedVersion]: wantedVersionTime } = time
  const { [latestVersion]: latestVersionTime } = time

  const wantedMinusLocalTime =
    localVersionTime === wantedVersionTime
      ? 0
      : moment(wantedVersionTime).valueOf() - moment(localVersionTime).valueOf()

  const latestMinusLocalTime =
    localVersionTime === latestVersionTime
      ? 0
      : moment(latestVersionTime).valueOf() - moment(localVersionTime).valueOf()

  const wanted = {
    version: wantedVersion,
    time_diff: convertTime(wantedMinusLocalTime, useFullTime, useCompactTime),
  }

  const latest = {
    version: latestVersion,
    time_diff: convertTime(latestMinusLocalTime, useFullTime, useCompactTime),
  }

  return { ...Timediff, wanted, latest }
}

function convertTime(timeDiff, useFullTime, useCompactTime) {
  if (useCompactTime) {
    return humanize(timeDiff, { round: true, units: ['y', 'mo', 'w', 'd'] })
  } else if (useFullTime) {
    return humanize(timeDiff, { round: true })
  }

  return timeDiff
}

export function create(dependencyName, dependencyVersion) {
  return {
    package: dependencyName,
    local: {
      version: dependencyVersion,
    },
  }
}

export async function process(Timediff, useNpm, useFullTime, useCompactTime) {
  const npmCommand = 'npm view'
  const yarnCommand = 'yarn info'

  const command = useNpm ? npmCommand : yarnCommand

  const commandResult = await new Promise((resolve, reject) => {
    const { package: pkg } = Timediff
    exec(`${command} ${pkg} --json`, (error, stdout) => {
      if (error) {
        reject(error)
      }

      resolve(JSON.parse(stdout))
    })
  })

  const { data: commandResultData } = commandResult
  const dependencyData = useNpm ? commandResult : commandResultData

  const updatedTimeDiff = measureTime(
    Timediff,
    dependencyData,
    useFullTime,
    useCompactTime,
  )

  return updatedTimeDiff
}
