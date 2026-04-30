'use strict';

const cp = require('child_process');
const path = require('path');

cp.execSync('node-gyp rebuild', {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  env: process.env,
});
