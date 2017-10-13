# depstime

Depstime is a utility for analyzing the dependencies in a project and obtaining the time differences between the locally installed version of a package and the wanted/latest versions available.

## Installation

As a command line tool:

```
npm install -g depstime
```

As a normal dependency:

```
npm install depstime --save
```

## Usage

```
> depstime [directory]
```

The directory argument must refer to a location that contains a  package.json file. If the directory argument is empty, depstime will be executed in the context of the current directory.

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

The *time_diff* property specifies the time difference in milliseconds between the various versions of a package, as long as it is a package from the npm registry.

Taking the time of the locally installed version (*local property*) as the initial time, the time difference is calculated between the max supported version (*wanted property*) and the latest version (*latest property*).