"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = depstime;

var _jsonfile = _interopRequireDefault(require("jsonfile"));

var _path = _interopRequireDefault(require("path"));

var utils = _interopRequireWildcard(require("./utils"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function depstime(directory, options) {
  if (!directory) {
    directory = process.cwd();
  }

  const packageObj = await _jsonfile.default.readFile(_path.default.join(directory, 'package.json'));

  if (!packageObj.hasOwnProperty('dependencies') && !packageObj.hasOwnProperty('devDependencies')) {
    throw new Error('There are no dependencies in the package.json file.');
  }

  const dependencies = { ...packageObj.dependencies,
    ...packageObj.devDependencies
  };
  const parsedDependencies = utils.parseDependencies(dependencies);
  const promises = parsedDependencies.map(dependency => utils.processDependencies(dependency, options));
  return {
    dependencies: await Promise.all(promises)
  };
}

module.exports = exports.default;