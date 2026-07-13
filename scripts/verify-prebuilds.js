'use strict';

const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const { PLATFORMS, targetsFor, prebuildName } = require('./targets');

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

const errors = [];

const expectedDirs = PLATFORMS.map(p => p.dir);
const actualDirs = fs.readdirSync(prebuildsDir).filter(n => !n.startsWith('.'));

for (const dir of expectedDirs) {
  if (!actualDirs.includes(dir)) {
    errors.push(`Missing platform: ${dir}`);
  }
}
for (const dir of actualDirs) {
  if (!expectedDirs.includes(dir)) {
    errors.push(`Unexpected platform: ${dir}`);
  }
}

let expectedCount = 0;

for (const platform of PLATFORMS) {
  if (!actualDirs.includes(platform.dir)) {
    continue;
  }

  const expected = targetsFor(platform).map(t => prebuildName(t.abi));
  const actual = fs.readdirSync(path.join(prebuildsDir, platform.dir))
    .filter(n => !n.startsWith('.'));
  expectedCount += expected.length;

  for (const name of expected) {
    const file = path.join(prebuildsDir, platform.dir, name);

    if (!fs.existsSync(file)) {
      errors.push(`Missing binary: ${platform.dir}/${name}`);
      continue;
    }

    if (fs.statSync(file).size < 1024 * 20) {
      errors.push(`Binary too small: ${platform.dir}/${name}`);
    }
  }

  for (const name of actual) {
    if (!expected.includes(name)) {
      errors.push(`Unexpected binary: ${platform.dir}/${name}`);
    }
  }
}

if (errors.length) {
  for (const error of errors) {console.error(`  ${error}`);}
  throw new Error(`${errors.length} problem(s) with prebuilds/`);
}

console.log(`Found all ${expectedCount} expected prebuilds across ${expectedDirs.length} platforms`);

require('./verify-prebuild');

console.log('All checks passed');
