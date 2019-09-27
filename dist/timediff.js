"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;
exports.process = process;

var _child_process = require("child_process");

var _humanizeDuration = _interopRequireDefault(require("humanize-duration"));

var _moment = _interopRequireDefault(require("moment"));

var _semver = _interopRequireDefault(require("semver"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function measureTime(Timediff, dependencyData, useFullTime, useCompactTime) {
  const {
    local: {
      version
    }
  } = Timediff;

  const localVersion = _semver.default.minSatisfying(dependencyData.versions, version);

  const wantedVersion = _semver.default.maxSatisfying(dependencyData.versions, version);

  const latestVersion = dependencyData.version;
  const localVersionTime = dependencyData.time[localVersion];
  const wantedVersionTime = dependencyData.time[wantedVersion];
  const latestVersionTime = dependencyData.time[latestVersion];
  const wantedMinusLocal = localVersionTime === wantedVersionTime ? 0 : (0, _moment.default)(wantedVersionTime).valueOf() - (0, _moment.default)(localVersionTime).valueOf();
  const latestMinusLocal = localVersionTime === latestVersionTime ? 0 : (0, _moment.default)(latestVersionTime).valueOf() - (0, _moment.default)(localVersionTime).valueOf();
  const wanted = {
    version: wantedVersion,
    time_diff: convertTime(wantedMinusLocal, useFullTime, useCompactTime)
  };
  const latest = {
    version: latestVersion,
    time_diff: convertTime(latestMinusLocal, useFullTime, useCompactTime)
  };
  return { ...Timediff,
    wanted,
    latest
  };
}

function convertTime(timeDiff, useFullTime, useCompactTime) {
  if (useCompactTime) {
    return (0, _humanizeDuration.default)(timeDiff, {
      round: true,
      units: ['y', 'mo', 'w', 'd']
    });
  } else if (useFullTime) {
    return (0, _humanizeDuration.default)(timeDiff, {
      round: true
    });
  }

  return timeDiff;
}

function create(dependencyName, dependencyVersion) {
  return {
    package: dependencyName,
    local: {
      version: dependencyVersion
    }
  };
}

async function process(Timediff, useNpm, useFullTime, useCompactTime) {
  const npmCommand = 'npm view';
  const yarnCommand = 'yarn info';
  const command = useNpm ? npmCommand : yarnCommand;
  const commandResult = await new Promise((resolve, reject) => {
    (0, _child_process.exec)(`${command} ${Timediff.package} --json`, (error, stdout) => {
      if (error) reject(error);
      resolve(JSON.parse(stdout));
    });
  });
  const dependencyData = useNpm ? commandResult : commandResult.data;
  const updatedTimeDiff = measureTime(Timediff, dependencyData, useFullTime, useCompactTime);
  return updatedTimeDiff;
}