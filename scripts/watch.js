const chokidar = require('chokidar');
const { compile, DIST, STYLE_ROOT, getMods } = require('./build');
const path = require('node:path');
const { readdirSync } = require('node:fs');

/// <reference types="node:fs" />

/**
 * @type {Map<string, number>}
 */
const mTimes = new Map();
/**
 * @type {Map<string, string[]>}
 */
const mods = new Map();

/**
 * @param {string} file
 * @param {Stats} stat
 */
function tsHandler(file, stat) {
	if (!file.endsWith('.js')) return;
	if (!stat.isFile()) return;
	if (stat.mtimeMs <= (mTimes.get(file) ?? 0)) return;
	console.log(`compiling ${file}`);
	mods.set(file, compile(file));
	mTimes.set(file, Date.now());
}

function styleHandler(file, stat) {
	if (!file.endsWith('.styl')) return;
	if (!stat.isFile()) return;
	const { name } = path.parse(file);
	for (const [file, styles] of mods) {
		if (!styles.includes(name)) continue;
		console.log(`compiling ${file}`);
		mods.set(file, compile(file));
		mTimes.set(file, Date.now());
	}
}

for (const dirent of readdirSync(DIST, {
	withFileTypes: true,
	recursive: true,
})) {
	if (!dirent.isFile()) continue;
	if (path.extname(dirent.name) !== '.js') continue;
	const file = path.join(dirent.parentPath, dirent.name);
	mods.set(file, getMods(file));
}

const watcher = chokidar.watch([DIST, STYLE_ROOT], {
	awaitWriteFinish: true,
});

watcher.on('ready', () => {
	watcher
		.on('change', tsHandler)
		.on('add', tsHandler)
		.on('change', styleHandler)
		.on('add', styleHandler);
});
