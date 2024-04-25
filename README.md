# depstime

[![test-build](https://github.com/rolspace/depstime/actions/workflows/ci.yml/badge.svg)](https://github.com/rolspace/depstime/actions/workflows/ci.yml)

**depstime** is a utility for analyzing dependencies and listing the time differences between the locally installed version of a package and the [wanted/latest](https://docs.npmjs.com/cli/outdated.html) versions available.

> Note: depstime supports Node version >= 18.12.0

## Installation

As a command line tool:

```
npm install -g depstime
```

As a project dependency:

```
npm install depstime --save
```

## Usage

```
> depstime [directory] [options]
```

The directory argument must refer to a location that contains a package.json file. If the directory argument is empty, depstime will be executed in the context of the current directory.

Given a package.json file with the following dependencies properties:

```
"dependencies": {
  "react": "^15.6.1",
  "whatwg-fetch": "^2.0.3"
},
"devDependencies": {
  "chai": "^4.1.1",
  "mocha": "^3.5.2"
}
```

depstime will return the following output:

```
{
  dependencies: [{
    { package: 'react',
       local: { version: '^15.6.1' },
       wanted: { version: '15.6.2', time_diff: 8899513061 },
       latest: { version: '16.0.0', time_diff: 8956517049 } },
    { package: 'whatwg-fetch',
       local: { version: '^2.0.3' },
       wanted: { version: '2.0.3', time_diff: 0 },
       latest: { version: '2.0.3', time_diff: 0 } },
    { package: 'chai',
       local: { version: '^4.1.1' },
       wanted: { version: '4.1.2', time_diff: 2297313699 },
       latest: { version: '4.1.2', time_diff: 2297313699 } },
    { package: 'mocha',
       local: { version: '^3.5.2' },
       wanted: { version: '3.5.3', time_diff: 86382478 },
       latest: { version: '4.0.1', time_diff: 2177353840 } }
  }]
}
```

The _time_diff_ property specifies the time difference in milliseconds between the various versions of a package.

The time difference is calculated by taking the publish time of the locally installed version in package.json (_local_ property) and then, by determining the time differences for the wanted version (_wanted_) and the latest version (_latest_) based on the versioning setup in package.json.

## Options

`--compact, -c`: Converts the output of the time differences into a human readable string. The string shows time difference values up to the 'days' unit with rounding.

`--full, -f`: Converts the output of the time differences into a human readable string. The string shows the full time difference values up to the 'seconds' unit with rounding.

`--yarn, -y`: Uses yarn instead of npm to retrieve dependency info.

> [!IMPORTANT]
> Only Yarn classic 1.x is supported. The command will fail if Yarn 2+ has already been setup inside a folder.
> The command can be executed if it is run outside the folder where the package.json file is located and the path is added as a parameter to the command.
