'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = cli;

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function cli() {
	var options = _yargs2.default.usage('$0 [directory]').option('human', {
		alias: 'h',
		describe: 'Output time difference as a human readable value',
		type: 'boolean'
	}).help('help', 'Show help message').argv;

	(0, _index2.default)(options._[0], options).then(function (value) {
		return console.log(_util2.default.inspect(value, { colors: true, depth: null }));
	}).catch(function (error) {
		return console.log(error);
	});
}
module.exports = exports['default'];