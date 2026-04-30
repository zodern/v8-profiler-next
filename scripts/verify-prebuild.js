'use strict';

// Asserts that lib/binding.js loads the prebuilt binary from prebuilds/,
// not from a leftover build/Release artifact. Removes build/ first to
// force node-gyp-build to resolve via the prebuilds/ tree.

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
fs.rmSync(path.join(root, 'build'), { recursive: true, force: true });

const binding = require(path.join(root, 'lib/binding'));
const keys = Object.keys(binding);

if (keys.length === 0) {
  console.error('binding loaded but exports nothing');
  process.exit(1);
}

console.log('prebuild loaded; keys:', keys.join(','));
