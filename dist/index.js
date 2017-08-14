'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = depstime;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _console = require('console');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function depstime(directory, options) {
	var logWriter = new _console.Console(process.stdout, process.stderr);

	if (_fs2.default.existsSync(directory)) {
		var packakeJsonPath = _path2.default.join(directory, 'package.json');
		_fs2.default.open(packakeJsonPath, 'r', function (error, fd) {
			if (error) {
				logWriter.error('Path ' + directory + ' does not have a package.json file');
			} else {
				console.log(fd);
			}
		});
	} else {
		logWriter.error('Path does not exist');
	}
}
module.exports = exports['default'];