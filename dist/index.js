"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = depstime;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _jsonfile = _interopRequireDefault(require("jsonfile"));

var _semver = _interopRequireDefault(require("semver"));

var _moment = _interopRequireDefault(require("moment"));

var _humanizeDuration = _interopRequireDefault(require("humanize-duration"));

var _child_process = require("child_process");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function depstime(directory, options) {
  return new Promise((resolve, reject) => {
    if (!directory) {
      directory = process.cwd();
    }

    if (_fs.default.existsSync(directory)) {
      const packageJsonPath = _path.default.join(directory, 'package.json');

      _jsonfile.default.readFile(packageJsonPath, (error, packageObj) => {
        if (error) {
          reject(`Path ${directory} does not have a package.json file.`);
        } else {
          if (!packageObj.hasOwnProperty('dependencies') && !packageObj.hasOwnProperty('devDependencies')) {
            reject('There are no dependencies in the package.json file.');
          }

          let dependencies = parseDependencies(packageObj);
          let promises = [];

          for (let i = 0; i < dependencies.length; i++) {
            const dependency = processDependencies(dependencies[i], options);
            promises.push(dependency);
          }

          Promise.all(promises).then(values => {
            resolve({
              'dependencies': values
            });
          });
        }
      });
    } else {
      reject(`Path ${directory} does not exist.`);
    }
  });
}

function parseDependencies(packageObj) {
  const parser = obj => {
    let result = [];

    for (const key in obj) {
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

  const parsed = parser(packageObj.dependencies).concat(parser(packageObj.devDependencies));
  return parsed;
}

function processDependencies(dependency, options) {
  return new Promise((resolve, reject) => {
    let temp = '';
    const view = (0, _child_process.spawn)('npm', ['view', dependency.package, '--json']);
    view.stdout.on('data', data => {
      temp += data.toString();
    });
    view.on('close', code => {
      const dependencyView = JSON.parse(temp);
      const packageVersion = dependency.local.version;

      const localVersion = _semver.default.minSatisfying(dependencyView.versions, packageVersion);

      const wantedVersion = _semver.default.maxSatisfying(dependencyView.versions, packageVersion);

      const latestVersion = dependencyView.version;
      const localDate = dependencyView.time[localVersion];
      const wantedDate = dependencyView.time[wantedVersion];
      const latestDate = dependencyView.time[latestVersion];
      const wantedTimeDiff = localDate === wantedDate ? 0 : (0, _moment.default)(wantedDate).valueOf() - (0, _moment.default)(localDate).valueOf();
      const latestTimeDiff = localDate === latestDate ? 0 : (0, _moment.default)(latestDate).valueOf() - (0, _moment.default)(localDate).valueOf();
      dependency.wanted = {
        version: wantedVersion,
        time_diff: transform(wantedTimeDiff, options)
      };
      dependency.latest = {
        version: latestVersion,
        time_diff: transform(latestTimeDiff, options)
      };
      resolve(dependency);
    });
  });
}

function transform(value, options) {
  if (options && options.c) {
    return (0, _humanizeDuration.default)(value, {
      round: true,
      units: ['y', 'mo', 'w', 'd']
    });
  } else if (options && options.f) {
    return (0, _humanizeDuration.default)(value, {
      round: true
    });
  }

  return value;
}

module.exports = exports["default"];