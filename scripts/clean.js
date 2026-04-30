'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const targets = ['prebuilds', 'build'];

for (const t of targets) {
  const p = path.join(root, t);
  fs.rmSync(p, { recursive: true, force: true });
  console.log(`removed ${t}/`);
}
