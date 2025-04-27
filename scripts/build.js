const fs = require('node:fs');
const path = require('node:path');
const stylus = require('stylus');
const uglifyCSS = require('uglifycss');

const PACKAGE_ROOT = path.join(__dirname, '../packages/abm-ui');
const DIST = path.join(PACKAGE_ROOT, 'dist');
const STYLE_ROOT = path.join(PACKAGE_ROOT, 'styles/widgets');

const PATTERN_IMPORT = /import ([A-Z0-9_]+) from '([a-z0-9-]+)\.style';/g;
const PATTERN_CSS_SELECTOR = /(?<=^|\}|,):host([^{,>]+?)(?=\{| |,|>)/g;

/**
 * @param {string} mod
 * @returns {string}
 */
function getCSS(mod) {
	const file = path.join(STYLE_ROOT, `${mod}.styl`);
	const str = fs.readFileSync(file, 'utf8');
	let css = stylus.render(str);
	css = uglifyCSS.processString(css);

	css = css.replace(PATTERN_CSS_SELECTOR, (raw, selector) => {
		if (typeof selector !== 'string') return raw;
		if (selector.startsWith('(') && selector.endsWith(')')) return raw;
		return `:host(${selector})`;
	});

	return css;
}

/**
 * @param {string} file
 */
function compile(file) {
	let js = fs.readFileSync(file, 'utf8');
	let changed = false;
	js = js.replace(PATTERN_IMPORT, (origin, label, mod) => {
		if (!(label && mod)) return origin;
		changed = true;
		return `const ${label} = ${JSON.stringify(getCSS(mod))};`;
	});
	if (!changed) return;
	fs.writeFileSync(file, js, 'utf8');
}

module.exports = {
	PACKAGE_ROOT,
	DIST,
	compile,
};

if (require.main === module) {
	for (const dirent of fs.readdirSync(DIST, {
		withFileTypes: true,
		recursive: true,
	})) {
		if (!dirent.isFile()) continue;
		if (path.extname(dirent.name) !== '.js') continue;
		const file = path.join(dirent.parentPath, dirent.name);
		compile(file);
	}
}
