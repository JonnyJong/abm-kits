const { copyFileSync } = require('node:fs');

copyFileSync('./src/common.d.ts', './dist/common.d.ts');