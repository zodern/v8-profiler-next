'use strict';

module.exports = {
  write: true,
  prefix: '^',
  test: [
    'test',
  ],
  dep: [
    'nan',
    'node-gyp-build',
  ],
  devdep: [
    'autod',
    'chai',
    'clang-format',
    'eslint',
    'mocha',
    'prebuildify',
  ],
  exclude: [
    './build',
    './scripts',
    './test/fixtures',
    './demo.js',
    './lib/worker_threads.js'
  ],
  semver: [
    'mocha@5'
  ]
};
