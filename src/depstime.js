import { exec } from 'child_process'
import humanize from 'humanize-duration'
import moment from 'moment'
import semver from 'semver'

function measureTime(deptime, dependencyData, useFullTime, useCompactTime) {
  const {
    local: { version: packageJsonVersion },
  } = deptime

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
    timeDiff: convertTime(wantedMinusLocalTime, useFullTime, useCompactTime),
  }

  const latest = {
    version: latestVersion,
    timeDiff: convertTime(latestMinusLocalTime, useFullTime, useCompactTime),
  }

  return { ...deptime, wanted, latest }
}

function convertTime(deptime, useFullTime, useCompactTime) {
  if (useCompactTime) {
    return humanize(deptime, { round: true, units: ['y', 'mo', 'w', 'd'] })
  } else if (useFullTime) {
    return humanize(deptime, { round: true })
  }

  return deptime
}

export function create(dependencyName, dependencyVersion) {
  return {
    package: dependencyName,
    local: {
      version: dependencyVersion,
    },
  }
}

export async function process(deptime, useNpm, useFullTime, useCompactTime) {
  const npmCommand = 'npm view'
  const yarnCommand = 'yarn info'

  const command = useNpm ? npmCommand : yarnCommand

  const commandResult = await new Promise((resolve, reject) => {
    const { package: pkg } = deptime
    exec(`${command} ${pkg} --json`, (error, stdout) => {
      if (error) {
        reject(error)
      }

      resolve(JSON.parse(stdout))
    })
  })

  const { data: commandResultData } = commandResult
  const dependencyData = useNpm ? commandResult : commandResultData

  const updatedDeptime = measureTime(
    deptime,
    dependencyData,
    useFullTime,
    useCompactTime,
  )

  return updatedDeptime
}
