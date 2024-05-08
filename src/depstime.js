import { exec } from 'child_process'
import humanize from 'humanize-duration'
import moment from 'moment'
import semver from 'semver'

function getVersionsTimeDeltas(
  dependencyTime,
  dependencyData,
  useFullTime,
  useCompactTime,
) {
  const {
    local: { version: currentVersion },
  } = dependencyTime

  const { time: dependencyTimeData, version, versions } = dependencyData

  const localVersion = semver.minSatisfying(versions, currentVersion)
  const wantedVersion = semver.maxSatisfying(versions, currentVersion)
  const latestVersion = version

  const { [localVersion]: localVersionPublishTime } = dependencyTimeData
  const { [wantedVersion]: wantedVersionPublishTime } = dependencyTimeData
  const { [latestVersion]: latestVersionPublishTime } = dependencyTimeData

  const timeDeltaWantedToLocalPublishTime =
    moment(wantedVersionPublishTime).valueOf() -
    moment(localVersionPublishTime).valueOf()

  const timeDeltaLatestToLocalPublishTime =
    moment(latestVersionPublishTime).valueOf() -
    moment(localVersionPublishTime).valueOf()

  const wanted = {
    version: wantedVersion,
    timeDeltaToLocal: humanizeTime(
      timeDeltaWantedToLocalPublishTime,
      useFullTime,
      useCompactTime,
    ),
  }

  const latest = {
    version: latestVersion,
    timeDeltaToLocal: humanizeTime(
      timeDeltaLatestToLocalPublishTime,
      useFullTime,
      useCompactTime,
    ),
  }

  return { ...dependencyTime, wanted, latest }
}

function humanizeTime(dependencyTime, useFullTime, useCompactTime) {
  if (useCompactTime) {
    return humanize(dependencyTime, {
      round: true,
      units: ['y', 'mo', 'w', 'd'],
    })
  } else if (useFullTime) {
    return humanize(dependencyTime, { round: true })
  }

  return dependencyTime
}

export function create(dependencyName, dependencyVersion) {
  return {
    name: dependencyName,
    local: {
      version: dependencyVersion,
    },
  }
}

export async function process(
  dependencyTime,
  useNpm,
  useFullTime,
  useCompactTime,
) {
  const getDependencyCommand = useNpm ? 'npm view' : 'yarn info'

  const commandResult = await new Promise((resolve, reject) => {
    const { name } = dependencyTime
    exec(`${getDependencyCommand} ${name} --json`, (error, stdout) => {
      if (error) {
        reject(error)
      }

      resolve(JSON.parse(stdout))
    })
  })

  const npmDependencyData = commandResult
  const { data: yarnDependencyData } = commandResult

  const dependencyData = useNpm ? npmDependencyData : yarnDependencyData

  const dependencyTimeWithDeltas = getVersionsTimeDeltas(
    dependencyTime,
    dependencyData,
    useFullTime,
    useCompactTime,
  )

  return dependencyTimeWithDeltas
}
