# depstime

[![ci](https://github.com/rolspace/depstime/actions/workflows/ci.yml/badge.svg)](https://github.com/rolspace/depstime/actions/workflows/ci.yml) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=rolspace_depstime&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=rolspace_depstime) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=rolspace_depstime&metric=coverage)](https://sonarcloud.io/summary/new_code?id=rolspace_depstime)

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
       wanted: { version: '15.6.2', timeDifference: 8899513061 },
       latest: { version: '16.0.0', timeDifference: 8956517049 } },
    { package: 'whatwg-fetch',
       local: { version: '^2.0.3' },
       wanted: { version: '2.0.3', timeDifference: 0 },
       latest: { version: '2.0.3', timeDifference: 0 } },
    { package: 'chai',
       local: { version: '^4.1.1' },
       wanted: { version: '4.1.2', timeDifference: 2297313699 },
       latest: { version: '4.1.2', timeDifference: 2297313699 } },
    { package: 'mocha',
       local: { version: '^3.5.2' },
       wanted: { version: '3.5.3', timeDifference: 86382478 },
       latest: { version: '4.0.1', timeDifference: 2177353840 } }
  }]
}
```

The _timeDifference_ property specifies the time difference in milliseconds between the various versions of a package.

The time difference is calculated by taking the publish time of the locally installed version in package.json (_local_ property) and then, by determining the time differences for the wanted version (_wanted_) and the latest version (_latest_) based on the versioning setup in package.json.

## Options

`--compact, -c`: Converts the output of the time differences into a human readable string. The string shows time difference values up to the 'days' unit with rounding.

`--full, -f`: Converts the output of the time differences into a human readable string. The string shows the full time difference values up to the 'seconds' unit with rounding.

> [!IMPORTANT]
> Both `--compact` and `--full` options cannot be used together, if both are set, the `--compact` option takes precedence.
