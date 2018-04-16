"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = cli;

var _util = _interopRequireDefault(require("util"));

var _yargs = _interopRequireDefault(require("yargs"));

var _minimist = _interopRequireDefault(require("minimist"));

var _index = _interopRequireDefault(require("./index"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function cli() {
  const options = _yargs.default.usage('$0 [directory]').option('human-compact', {
    alias: 'c',
    describe: 'Output time difference as a human readable value up to the \'days\' unit with rounding',
    type: 'boolean'
  }).option('human-full', {
    alias: 'f',
    describe: 'Output time difference as a human readable value up to the \'seconds\' unit with rounding',
    type: 'boolean'
  }).help('help', 'Show help message').argv;

  (0, _index.default)(options._[0], options).then(value => console.log(_util.default.inspect(value, {
    colors: true,
    depth: null
  }))).catch(error => console.log(error));
}

module.exports = exports["default"];