'use strict';

const { PLATFORMS, runnableTargetsFor, pythonFor } = require('./targets');

const include = [];

for (const platform of PLATFORMS) {
  for (const target of runnableTargetsFor(platform)) {
    include.push({
      name: `${platform.dir} / node ${target.major}`,
      os: platform.os,
      node: target.major,
      python: pythonFor(target.major),
    });
  }
}

console.log(JSON.stringify(include));
