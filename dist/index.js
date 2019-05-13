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

async function depstime(folder, options) {
  let packageJsonFolder = folder || process.cwd();
  const packageJson = await _jsonfile.default.readFile(_path.default.join(packageJsonFolder, 'package.json'));

  if (!packageJson.hasOwnProperty('dependencies') && !packageJson.hasOwnProperty('devDependencies')) {
    throw new Error('There are no dependencies in the package.json file.');
  }

  const dependencies = { ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  const parsedDependencies = Object.keys(dependencies).map(key => utils.parseDependency(key, dependencies[key]));
  const processedDependencies = parsedDependencies.map(dependency => utils.processDependency(dependency, options));
  return {
    dependencies: await Promise.all(processedDependencies)
  };
}

module.exports = exports.default;