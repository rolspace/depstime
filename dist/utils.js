"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseDependencies = parseDependencies;
exports.processDependencies = processDependencies;
exports.transform = transform;

var _child_process = require("child_process");

var _humanizeDuration = _interopRequireDefault(require("humanize-duration"));

var _moment = _interopRequireDefault(require("moment"));

var _semver = _interopRequireDefault(require("semver"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseDependencies(dependencies) {
  const parsedDependencies = Object.keys(dependencies).map(key => {
    return {
      package: key,
      local: {
        version: dependencies[key]
      }
    };
  });
  return parsedDependencies;
}

async function processDependencies(dependency, options) {
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
  const localDate = viewData.time[localVersion];
  const wantedDate = viewData.time[wantedVersion];
  const latestDate = viewData.time[latestVersion];
  const wantedTimeDiff = localDate === wantedDate ? 0 : (0, _moment.default)(wantedDate).valueOf() - (0, _moment.default)(localDate).valueOf();
  const latestTimeDiff = localDate === latestDate ? 0 : (0, _moment.default)(latestDate).valueOf() - (0, _moment.default)(localDate).valueOf();
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