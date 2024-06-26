function getVersionsTimeDifferences(
  depstime,
  dependencyData,
  useFullTime,
  useCompactTime,
  functionDependencies,
) {
  const {
    local: { version: currentVersion },
  } = depstime

  const { time: versionTimeData, version, versions } = dependencyData

  const { getTime, getMinVersion, getMaxVersion } = functionDependencies

  const localVersion = getMinVersion(versions, currentVersion)
  const wantedVersion = getMaxVersion(versions, currentVersion)
  const latestVersion = version

  const { [localVersion]: localVersionPublishTime } = versionTimeData
  const { [wantedVersion]: wantedVersionPublishTime } = versionTimeData
  const { [latestVersion]: latestVersionPublishTime } = versionTimeData

  const timeDifferenceWantedToLocalVersionPublishTime =
    getTime(wantedVersionPublishTime) - getTime(localVersionPublishTime)

  const timeDifferenceLatestToLocalVersionPublishTime =
    getTime(latestVersionPublishTime) - getTime(localVersionPublishTime)

  const wanted = {
    version: wantedVersion,
    timeDifference: humanize(
      timeDifferenceWantedToLocalVersionPublishTime,
      useFullTime,
      useCompactTime,
      functionDependencies,
    ),
  }

  const latest = {
    version: latestVersion,
    timeDifference: humanize(
      timeDifferenceLatestToLocalVersionPublishTime,
      useFullTime,
      useCompactTime,
      functionDependencies,
    ),
  }

  return { ...depstime, wanted, latest }
}

function humanize(time, useFullTime, useCompactTime, { humanizeTime }) {
  if (useCompactTime) {
    return humanizeTime(time, {
      round: true,
      units: ['y', 'mo', 'w', 'd'],
    })
  } else if (useFullTime) {
    return humanizeTime(time, { round: true })
  }

  return time
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
  depstime,
  useFullTime,
  useCompactTime,
  functionDependencies,
) {
  const { execute } = functionDependencies
  const getDependencyCommand = 'npm view'

  const dependencyData = await new Promise((resolve, reject) => {
    const { name } = depstime
    execute(`${getDependencyCommand} ${name} --json`, (error, stdout) => {
      if (error) {
        reject(error)
      }

      resolve(JSON.parse(stdout))
    })
  })

  const depstimeWithDifferences = getVersionsTimeDifferences(
    depstime,
    dependencyData,
    useFullTime,
    useCompactTime,
    functionDependencies,
  )

  return depstimeWithDifferences
}
