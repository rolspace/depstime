import fs from 'fs'
import path from 'path'
import jsonfile from 'jsonfile'
import { Console } from 'console'

export default function depstime(directory) {
	return new Promise((resolve, reject) => {
		const logger = new Console(process.stdout, process.stderr)

		if (fs.existsSync(directory)) {
			const packageJsonPath = path.join(directory, 'package.json')

			jsonfile.readFile(packageJsonPath, (error, packageObj) => {
				if (error) {
					logger.error(`Path ${directory} does not have a package.json file.`)
					reject(false)
				}
				else {
					if (!packageObj.hasOwnProperty('dependencies') && !packageObj.hasOwnProperty('devDependencies')) {
						logger.info('There are no dependencies in the package.json file.')
						reject(false)
					}

					let dependencies = parseDependencies(packageObj)

					resolve(dependencies)
				}
			})
		}

		logger.error(`Path ${directory} does not exist.`)
		reject(false)
	})
}

function parseDependencies(packageObj) {
	const parser = (obj) => {
		let result = {}
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				result[key] = { version: obj[key] }
			}
		}
		return result
	}

	let parsed = Object.assign({}, parser(packageObj.dependencies), parser(packageObj.devDependencies))
	let ordered = {}

	Object.keys(parsed).sort().forEach(key => {
		ordered[key] = parsed[key]
	})

	return ordered
}