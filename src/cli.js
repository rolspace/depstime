import util from 'util'
import minimist from 'minimist'
import depstime from './index'

export default function cli() {
	const argv = minimist(process.argv.slice(2))

	depstime(argv._[0], argv)
	.then(value => console.log(util.inspect(value, { colors: true, depth: null })))
	.catch(error => console.log(error))
}