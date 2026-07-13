'use strict';

const { PLATFORMS, runnableTargetsFor, jobFor } = require('./targets');

const include = [];

for (const platform of PLATFORMS) {
  for (const target of runnableTargetsFor(platform)) {
    include.push(jobFor(platform, target));
  }
}

console.log(JSON.stringify(include));
