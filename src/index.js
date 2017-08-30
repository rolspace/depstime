import fs from 'fs'
import path from 'path'
import jsonfile from 'jsonfile'
import { Console } from 'console'

export default function depstime(directory) {
	return new Promise((resolve, reject) => {
		const logger = new Console(process.stdout, process.stderr)

		if (fs.existsSync(directory)) {
			const packageJsonPath = path.join(directory, 'package.json')

			jsonfile.readFile(packageJsonPath, (error, obj) => {
				if (error) {
					logger.error(`Path ${directory} does not have a package.json file.`)
					reject(false)
				}
				else {
					if (!obj.hasOwnProperty('dependencies') && !obj.hasOwnProperty('devDependencies')) {
						logger.info('There are no dependencies in the package.json file.')
						reject(false)
					}

					resolve(true)
				}
			})
		}

		logger.error(`Path ${directory} does not exist.`)
		reject(false)
	})
}