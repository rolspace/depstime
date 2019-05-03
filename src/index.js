import util from 'util'
import fs from 'fs'
import path from 'path'
import jsonfile from 'jsonfile'
import semver from 'semver'
import moment from 'moment'
import humanize from 'humanize-duration'
import child from 'child_process'

const exec = util.promisify(child.exec)

export default function depstime(directory, options) {
  return new Promise((resolve, reject) => {
    if (!directory) {
      directory = process.cwd()
    }
    
    if (fs.existsSync(directory)) {
      const packageJsonPath = path.join(directory, 'package.json')
      
      jsonfile.readFile(packageJsonPath, (error, packageObj) => {
        if (error) {
          reject(`Path ${directory} does not have a package.json file.`)
        }
        else {
          if (!packageObj.hasOwnProperty('dependencies') && !packageObj.hasOwnProperty('devDependencies')) {
            reject('There are no dependencies in the package.json file.')
          }
          
          let dependencies = parseDependencies(packageObj)
          let promises = []
          
          for (let i = 0; i < dependencies.length; i++) {
            const dependency = processDependencies(dependencies[i], options)
            promises.push(dependency)
          }
          
          Promise.all(promises)
          .then(values => {
            resolve({ 'dependencies': values })
          })
        }
      })
    }
    else {
      reject(`Path ${directory} does not exist.`)
    }
  })
}

function parseDependencies(packageObj) {
  const parser = (obj) => {
    let result = []
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result.push({
          package: key,
          local: {
            version: obj[key]
          }
        })
      }
    }
    return result
  }
  
  const parsed = parser(packageObj.dependencies).concat(parser(packageObj.devDependencies))
  return parsed
}

async function processDependencies(dependency, options) {
  try {
    const { stdout, stderr } = await exec(`npm view ${dependency.package} --json`)
    const dependencyView = JSON.parse(stdout)
    
    const packageVersion = dependency.local.version
    const localVersion = semver.minSatisfying(dependencyView.versions, packageVersion)
    const wantedVersion = semver.maxSatisfying(dependencyView.versions, packageVersion)
    const latestVersion = dependencyView.version
    
    const localDate = dependencyView.time[localVersion]
    const wantedDate = dependencyView.time[wantedVersion]
    const latestDate = dependencyView.time[latestVersion]
    
    const wantedTimeDiff = localDate === wantedDate ? 0 : moment(wantedDate).valueOf() - moment(localDate).valueOf()
    const latestTimeDiff = localDate === latestDate ? 0 :  moment(latestDate).valueOf() - moment(localDate).valueOf()

    dependency.wanted = {
      version: wantedVersion,
      time_diff: transform(wantedTimeDiff, options)
    }
    
    dependency.latest = {
      version: latestVersion,
      time_diff: transform(latestTimeDiff, options)
    }

    return dependency
  }
  catch (error) {
    console.log(error)
  }
}

function transform(value, options) {
  if (options && options.c) {
    return humanize(value, { round: true, units: ['y', 'mo', 'w', 'd'] })
  }
  else if (options && options.f) {
    return humanize(value, { round: true })
  }
  
  return value
}