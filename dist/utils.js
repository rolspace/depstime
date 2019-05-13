"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transform = transform;
exports.parseDependency = parseDependency;
exports.processDependency = processDependency;

var _child_process = require("child_process");

var _humanizeDuration = _interopRequireDefault(require("humanize-duration"));

var _moment = _interopRequireDefault(require("moment"));

var _semver = _interopRequireDefault(require("semver"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

function parseDependency(dependencyName, dependencyVersion) {
  return {
    package: dependencyName,
    local: {
      version: dependencyVersion
    }
  };
}

async function processDependency(dependency, options) {
  const viewData = await new Promise((resolve, reject) => {
    (0, _child_process.exec)(`npm view ${dependency.package} --json`, (error, stdout) => {
      if (error) reject(error);
      resolve(JSON.parse(stdout));
    });
  });
  const {
    local: {
      version
    }
  } = dependency;

  const localVersion = _semver.default.minSatisfying(viewData.versions, version);

  const wantedVersion = _semver.default.maxSatisfying(viewData.versions, version);

  const latestVersion = viewData.version;
  const localTime = viewData.time[localVersion];
  const wantedTime = viewData.time[wantedVersion];
  const latestTime = viewData.time[latestVersion];
  const wantedTimeDiff = localTime === wantedTime ? 0 : (0, _moment.default)(wantedTime).valueOf() - (0, _moment.default)(localTime).valueOf();
  const latestTimeDiff = localTime === latestTime ? 0 : (0, _moment.default)(latestTime).valueOf() - (0, _moment.default)(localTime).valueOf();
  const wanted = {
    version: wantedVersion,
    time_diff: transform(wantedTimeDiff, options)
  };
  const latest = {
    version: latestVersion,
    time_diff: transform(latestTimeDiff, options)
  };
  return { ...dependency,
    wanted,
    latest
  };
}