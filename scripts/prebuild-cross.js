'use strict';

const cp = require('child_process');
const path = require('path');

const { platformFor, crossTargetsFor } = require('./targets');

const platform = platformFor(process.platform, process.arch);

if (!platform) {
  console.log(`No prebuild platform for ${process.platform}-${process.arch}; nothing to cross-compile`);
  process.exit(0);
}

const major = parseInt(process.versions.node.split('.')[0], 10);
const targets = crossTargetsFor(platform, major);

if (targets.length === 0) {
  console.log(`Nothing to cross-compile on ${platform.dir} / node ${major}`);
  process.exit(0);
}

for (const target of targets) {
  console.log(`Cross-compiling ${platform.dir} prebuild for Node ${target.version} (abi${target.abi})`);
  cp.execFileSync(process.execPath, [
    path.join(__dirname, 'prebuild.js'),
    `--target=${target.version}`,
    `--arch=${platform.arch}`,
  ], { cwd: path.join(__dirname, '..'), stdio: 'inherit', env: process.env });
}
