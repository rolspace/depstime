import fs from 'fs'
import path from 'path'
import { Console } from 'console'

export default function depstime(directory, options) {
	const logWriter = new Console(process.stdout, process.stderr)

	if (fs.existsSync(directory)) {
		const packakeJsonPath = path.join(directory, 'package.json')
		fs.open(packakeJsonPath, 'r', (error, fd) => {
			if (error) {
				logWriter.error(`Path ${directory} does not have a package.json file`)
			}
			else {
				console.log(fd)
			}
		})
	}
	else {
		logWriter.error(`Path ${directory} does not exist`)
	}
}