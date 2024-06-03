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
    getTime(wantedVersionPublishTime).valueOf() -
    getTime(localVersionPublishTime).valueOf()

  const timeDifferenceLatestToLocalVersionPublishTime =
    getTime(latestVersionPublishTime).valueOf() -
    getTime(localVersionPublishTime).valueOf()

  const wanted = {
    version: wantedVersion,
    timeDifferenceToLocalVersion: humanize(
      timeDifferenceWantedToLocalVersionPublishTime,
      useFullTime,
      useCompactTime,
      functionDependencies,
    ),
  }

  const latest = {
    version: latestVersion,
    timeDifferenceToLocalVersion: humanize(
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
  useNpm,
  useFullTime,
  useCompactTime,
  functionDependencies,
) {
  const { execute } = functionDependencies
  const getDependencyCommand = useNpm ? 'npm view' : 'yarn info'

  const commandResult = await new Promise((resolve, reject) => {
    const { name } = depstime
    execute(`${getDependencyCommand} ${name} --json`, (error, stdout) => {
      if (error) {
        reject(error)
      }

      resolve(JSON.parse(stdout))
    })
  })

  const npmDependencyData = commandResult
  const { data: yarnDependencyData } = commandResult

  const dependencyData = useNpm ? npmDependencyData : yarnDependencyData

  const depstimeWithDifferences = getVersionsTimeDifferences(
    depstime,
    dependencyData,
    useFullTime,
    useCompactTime,
    functionDependencies,
  )

  return depstimeWithDifferences
}
