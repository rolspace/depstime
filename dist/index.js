"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.depstime = depstime;

var _jsonfile = _interopRequireDefault(require("jsonfile"));

var _path = _interopRequireDefault(require("path"));

var timediff = _interopRequireWildcard(require("./timediff"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function depstime(folder, options) {
  const packageJsonPath = _path.default.join(folder || process.cwd(), 'package.json');

  const packageConfig = await _jsonfile.default.readFile(packageJsonPath);

  if (!packageConfig.dependencies && !packageConfig.devDependencies) {
    throw new Error('There are no dependencies in the package.json file.');
  }

  const dependencies = { ...packageConfig.dependencies,
    ...packageConfig.devDependencies
  };
  const results = Object.keys(dependencies).map(name => timediff.create(name, dependencies[name])).map(Timediff => {
    const useNpm = options && !options.yarn;
    const useFullTime = options && options.f && !options.c;
    const useCompactTime = options && options.c && !options.f;
    return timediff.process(Timediff, useNpm, useFullTime, useCompactTime);
  });
  return {
    dependencies: await Promise.all(results)
  };
}