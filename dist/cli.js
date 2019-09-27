"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = cli;

var _util = _interopRequireDefault(require("util"));

var _yargs = _interopRequireDefault(require("yargs"));

var _index = require("./index");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function cli() {
  const options = _yargs.default.usage('$0 [folder]').option('yarn', {
    describe: 'use yarn instead of npm',
    type: 'boolean'
  }).option('compact', {
    alias: 'c',
    describe: 'Output time difference as a human readable value up to the \'days\' unit with rounding',
    type: 'boolean'
  }).option('full', {
    alias: 'f',
    describe: 'Output time difference as a human readable value up to the \'seconds\' unit with rounding',
    type: 'boolean'
  }).help('help', 'Show help message').argv;

  try {
    const folder = options._[0];
    const result = await (0, _index.depstime)(folder, options);
    console.log(_util.default.inspect(result, {
      colors: true,
      depth: null
    }));
  } catch (error) {
    console.log(error);
  }
}

module.exports = exports.default;