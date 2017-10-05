
import minimist from 'minimist'
import depstime from './index'

export default function cli() {
	const argv = minimist(process.argv.slice(2));
	depstime(argv._[0]).then(value => console.log(value));
}