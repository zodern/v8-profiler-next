'use strict';

// Builds prebuilds for each target Node version. Run once per host
// platform. Override targets with PREBUILD_NODE_VERSIONS=20.19.3,22.22.2.

const cp = require('child_process');
const path = require('path');
const os = require('os');

// Node 24 omitted: current C++ doesn't compile against V8 13.6 yet.
const DEFAULT_VERSIONS = [
  '14.21.3',
  '20.19.3',
  '22.22.2',
];

// macOS arm64 support landed in Node 16.
function archsFor(version) {
  const major = parseInt(version.split('.')[0], 10);
  if (os.platform() === 'darwin') {
    return major >= 16 ? ['arm64', 'x64'] : ['x64'];
  }
  return [process.arch];
}

const versions = (process.env.PREBUILD_NODE_VERSIONS || DEFAULT_VERSIONS.join(','))
  .split(',')
  .map(v => v.trim())
  .filter(Boolean);

const cwd = path.join(__dirname, '..');
const failed = [];

for (const v of versions) {
  for (const arch of archsFor(v)) {
    console.log(`\n>>> prebuilding for Node ${v} / ${arch}`);
    try {
      cp.execFileSync('node', [
        'scripts/prebuild.js',
        `--target=${v}`,
        `--arch=${arch}`,
      ], { cwd, stdio: 'inherit', env: process.env });
      console.log(`<<< Node ${v} / ${arch} done`);
    } catch (err) {
      console.error(`!!! Node ${v} / ${arch} FAILED: ${err.message}`);
      failed.push(`${v} (${arch})`);
    }
  }
}

console.log('\nFinished. Contents of prebuilds/:');
cp.execSync('ls -la prebuilds/*/ 2>/dev/null || true', { cwd, stdio: 'inherit' });

if (failed.length) {
  console.log(`\nFAILED targets: ${failed.join(', ')}`);
  process.exit(1);
}
