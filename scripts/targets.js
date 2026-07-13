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
  prebuildName,
  platformFor,
};
