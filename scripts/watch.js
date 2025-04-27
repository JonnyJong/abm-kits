const chokidar = require('chokidar');
const { compile, DIST } = require('./build');

/// <reference types="node:fs" />

/**
 * @type {Map<string, number>}
 */
const mTimes = new Map();

/**
 * @param {string} file
 * @param {Stats} stat
 */
function handler(file, stat) {
	if (!file.endsWith('.js')) return;
	if (!stat.isFile()) return;
	if (stat.mtimeMs <= (mTimes.get(file) ?? 0)) return;
	console.log(`compiling ${file}`);
	compile(file);
	mTimes.set(file, Date.now());
}

const watcher = chokidar.watch(DIST, {
	awaitWriteFinish: true,
});

watcher.on('ready', () => {
	watcher.on('change', handler).on('add', handler);
});
