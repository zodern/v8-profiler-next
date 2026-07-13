'use strict';

const path = require('path');
const pkg = require(path.join(__dirname, '..', 'package.json'));

const NODE_TARGETS = [
  { major: 14, version: '14.21.3', abi: 83 },
  { major: 20, version: '20.20.2', abi: 115 },
  { major: 22, version: '22.23.1', abi: 127 },
  { major: 24, version: '24.18.0', abi: 137 },
  { major: 26, version: '26.5.0', abi: 147 },
];

const PLATFORMS = [
  {
    dir: 'linux-x64',
    os: 'ubuntu-latest',
    platform: 'linux',
    arch: 'x64',
  },
  {
    dir: 'linux-arm64',
    os: 'ubuntu-24.04-arm',
    platform: 'linux',
    arch: 'arm64',
    // Node 14 doesn't run on the arm64 Linux runner
    skip: [14],
  },
  {
    dir: 'darwin-arm64',
    os: 'macos-latest',
    platform: 'darwin',
    arch: 'arm64',
    // Node 14 doesn't have a darwin arm version, but it can be cross compiled
    cannotRun: [14],
    crossCompileFrom: 22,
  },
  {
    dir: 'darwin-x64',
    os: 'macos-15-intel',
    platform: 'darwin',
    arch: 'x64',
  },
  {
    dir: 'win32-x64',
    os: 'windows-latest',
    platform: 'win32',
    arch: 'x64',
    // windows-latest ships Visual Studio 2026, which only node-gyp 12.4 and
    // newer can find. npm bundles an older node-gyp for every Node we build.
    nodeGyp: 'node-gyp@12',
    overrides: {
      // node-gyp 12 needs Node 20.17+, and the newest node-gyp Node 14 can run
      // (v9) only knows about Visual Studio 2022. So Node 14 builds on the
      // image that still has it. Its bundled node-gyp (v5) is older still and
      // doesn't recognize VS 2022 either, hence the override there as well.
      14: { os: 'windows-2022', nodeGyp: 'node-gyp@9' },
    },
  },
];

// Node 14 uses node-gyp v5 and requires python 3.10 or older
function pythonFor(major) {
  return major === 14 ? '3.10' : '3.11';
}

// Every target that has a prebuild file on this platform.
function targetsFor(platform) {
  const skip = platform.skip || [];
  return NODE_TARGETS.filter(t => !skip.includes(t.major));
}

// Targets with a Node version that can actually run on this platform's runner
function runnableTargetsFor(platform) {
  const cannotRun = platform.cannotRun || [];
  return targetsFor(platform).filter(t => !cannotRun.includes(t.major));
}

// Targets that must be cross-compiled from the job running `major`.
function crossTargetsFor(platform, major) {
  if (platform.crossCompileFrom !== major) {return [];}
  const cannotRun = platform.cannotRun || [];
  return targetsFor(platform).filter(t => cannotRun.includes(t.major));
}

// The CI job that builds and tests `target` on `platform`. Some targets need a
// different runner image or node-gyp than the platform's default.
function jobFor(platform, target) {
  const overrides = (platform.overrides || {})[target.major] || {};

  return {
    name: `${platform.dir} / node ${target.major}`,
    os: overrides.os || platform.os,
    node: target.major,
    python: pythonFor(target.major),
    // Empty when the node-gyp npm bundles works. CI skips the install then.
    nodeGyp: overrides.nodeGyp || platform.nodeGyp || '',
  };
}

// prebuildify names files after the package, with '/' replaced by '+'.
function prebuildName(abi) {
  return `${pkg.name.replace('/', '+')}.abi${abi}.node`;
}

function platformFor(platform, arch) {
  return PLATFORMS.find(p => p.platform === platform && p.arch === arch);
}

module.exports = {
  NODE_TARGETS,
  PLATFORMS,
  pythonFor,
  targetsFor,
  runnableTargetsFor,
  crossTargetsFor,
  jobFor,
  prebuildName,
  platformFor,
};
