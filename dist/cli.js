'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = cli;

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function cli() {
	var argv = (0, _minimist2.default)(process.argv.slice(2));
	(0, _index2.default)(argv._[0], { value: 4 });
}
module.exports = exports['default'];