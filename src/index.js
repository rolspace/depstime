import fs from 'fs'
import path from 'path'
import jsonfile from 'jsonfile'
import semver from 'semver'
import moment from 'moment'
import { spawn } from 'child_process'

export default function depstime(directory) {
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
						const dependency = processDependencies(dependencies[i])
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
					name: key,
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

function processDependencies(dependency) {
	return new Promise((resolve, reject) => {
		let temp = ''

		const view = spawn('npm', [ 'view', dependency.name, '--json' ])

		view.stdout.on('data', (data) => {
			temp += data.toString()
		})

		view.on('exit', (code) => {
			const dependencyView = JSON.parse(temp)

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
				time_diff: wantedTimeDiff
			}

			dependency.latest = {
				version: latestVersion,
				time_diff: latestTimeDiff
			}

			resolve(dependency)
		})
	})
}