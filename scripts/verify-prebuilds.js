'use strict';

const cp = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const prebuildsDir = path.join(root, 'prebuilds');

if (!fs.existsSync(prebuildsDir)) {
  console.error('prebuilds/ does not exist');
  process.exit(1);
}

// If the binaries were downloaded from the github workflow, they might be quarantined
if (process.platform === 'darwin') {
  try {
    cp.execFileSync('xattr', ['-dr', 'com.apple.quarantine', prebuildsDir], { stdio: 'ignore' });
  } catch (e) {
    // xattr errors when the attribute isn't present
  }
}

const dirents = fs.readdirSync(prebuildsDir).filter(n => !n.startsWith('.'));
if (dirents.length !== 5) {
  throw new Error(`Missing platforms: ${dirents.length} !== 5`);
}

let buildsCount = 0;
for(const platform of dirents) {
  const binaries = fs.readdirSync(path.join(prebuildsDir, platform));
  buildsCount += binaries.length;

  for(const binaryName of binaries) {
    let stats = fs.statSync(path.join(prebuildsDir, platform, binaryName));

    if (stats.size < 1024 * 20) {
      throw new Error(`Binary too small - ${platform}/${binaryName}`);
    }
  }
}

if (buildsCount !== 14) {
  throw new Error(`Wrong number of builds: ${buildsCount}`);
}

require('./verify-prebuild');

console.log('All checks passed');
