'use strict';

// Build a prebuild for the current Node, or pass --target=<ver> to override.
// Extra flags are forwarded to prebuildify.

const cp = require('child_process');
const path = require('path');

let target = process.version.replace(/^v/, '');
const passthrough = [];

for (const arg of process.argv.slice(2)) {
  const m = arg.match(/^--target=(.+)$/);
  if (m) {
    target = m[1];
  } else {
    passthrough.push(arg);
  }
}

const prebuildifyBin = path.join(
  path.dirname(require.resolve('prebuildify/package.json')),
  'bin.js'
);

const args = [prebuildifyBin, '--no-napi', '--strip', '--target', target, ...passthrough];

cp.execFileSync(process.execPath, args, {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  env: process.env,
});
