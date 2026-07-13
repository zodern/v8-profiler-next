'use strict';

// Builds every prebuild this host can produce. Run once per host platform; CI
// spreads the same work across runners. Targets come from scripts/targets.js.
// Override the Node versions with PREBUILD_NODE_VERSIONS=20.20.2,22.23.1.

const cp = require('child_process');
const path = require('path');

const { PLATFORMS, targetsFor } = require('./targets');

// macOS builds both darwin arches (clang cross-compiles between them); other
// hosts only build for their own arch.
const platforms = PLATFORMS.filter(p => {
  if (p.platform !== process.platform) {return false;}
  return p.platform === 'darwin' || p.arch === process.arch;
});

if (platforms.length === 0) {
  console.error(`No prebuild platform for ${process.platform}-${process.arch}`);
  process.exit(1);
}

const override = (process.env.PREBUILD_NODE_VERSIONS || '')
  .split(',')
  .map(v => v.trim())
  .filter(Boolean);

const cwd = path.join(__dirname, '..');
const failed = [];

for (const platform of platforms) {
  const versions = override.length
    ? override
    : targetsFor(platform).map(t => t.version);

  for (const version of versions) {
    console.log(`\n>>> prebuilding ${platform.dir} for Node ${version}`);
    try {
      cp.execFileSync(process.execPath, [
        path.join(__dirname, 'prebuild.js'),
        `--target=${version}`,
        `--arch=${platform.arch}`,
      ], { cwd, stdio: 'inherit', env: process.env });
      console.log(`<<< ${platform.dir} / Node ${version} done`);
    } catch (err) {
      console.error(`!!! ${platform.dir} / Node ${version} FAILED: ${err.message}`);
      failed.push(`${platform.dir} / ${version}`);
    }
  }
}

console.log('\nFinished. Contents of prebuilds/:');
cp.execSync('ls -la prebuilds/*/ 2>/dev/null || true', { cwd, stdio: 'inherit' });

if (failed.length) {
  console.log(`\nFAILED targets: ${failed.join(', ')}`);
  process.exit(1);
}
