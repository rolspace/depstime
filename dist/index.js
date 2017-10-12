'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = depstime;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _jsonfile = require('jsonfile');

var _jsonfile2 = _interopRequireDefault(_jsonfile);

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _child_process = require('child_process');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function depstime(directory) {
	return new Promise(function (resolve, reject) {
		if (!directory) {
			directory = process.cwd();
		}

		if (_fs2.default.existsSync(directory)) {
			var packageJsonPath = _path2.default.join(directory, 'package.json');

			_jsonfile2.default.readFile(packageJsonPath, function (error, packageObj) {
				if (error) {
					reject('Path ' + directory + ' does not have a package.json file.');
				} else {
					if (!packageObj.hasOwnProperty('dependencies') && !packageObj.hasOwnProperty('devDependencies')) {
						reject('There are no dependencies in the package.json file.');
					}

					var dependencies = parseDependencies(packageObj);
					var promises = [];

					for (var i = 0; i < dependencies.length; i++) {
						var dependency = processDependencies(dependencies[i]);
						promises.push(dependency);
					}

					Promise.all(promises).then(function (values) {
						resolve({ 'dependencies': values });
					});
				}
			});
		} else {
			reject('Path ' + directory + ' does not exist.');
		}
	});
}

function parseDependencies(packageObj) {
	var parser = function parser(obj) {
		var result = [];
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				result.push({
					package: key,
					local: {
						version: obj[key]
					}
				});
			}
		}
		return result;
	};

	var parsed = parser(packageObj.dependencies).concat(parser(packageObj.devDependencies));
	return parsed;
}

function processDependencies(dependency) {
	return new Promise(function (resolve, reject) {
		var temp = '';

		var view = (0, _child_process.spawn)('npm', ['view', dependency.package, '--json']);

		view.stdout.on('data', function (data) {
			temp += data.toString();
		});

		view.on('exit', function (code) {
			var dependencyView = JSON.parse(temp);

			var packageVersion = dependency.local.version;
			var localVersion = _semver2.default.minSatisfying(dependencyView.versions, packageVersion);
			var wantedVersion = _semver2.default.maxSatisfying(dependencyView.versions, packageVersion);
			var latestVersion = dependencyView.version;

			var localDate = dependencyView.time[localVersion];
			var wantedDate = dependencyView.time[wantedVersion];
			var latestDate = dependencyView.time[latestVersion];

			var wantedTimeDiff = localDate === wantedDate ? 0 : (0, _moment2.default)(wantedDate).valueOf() - (0, _moment2.default)(localDate).valueOf();
			var latestTimeDiff = localDate === latestDate ? 0 : (0, _moment2.default)(latestDate).valueOf() - (0, _moment2.default)(localDate).valueOf();

			dependency.wanted = {
				version: wantedVersion,
				time_diff: wantedTimeDiff
			};

			dependency.latest = {
				version: latestVersion,
				time_diff: latestTimeDiff
			};

			resolve(dependency);
		});
	});
}
module.exports = exports['default'];