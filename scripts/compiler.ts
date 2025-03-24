import { readFile } from 'node:fs/promises';
import path from 'node:path';
import stylus from 'stylus';
import uglifyCSS from 'uglifycss';
import { Plugin } from 'vite';
import pugVite from 'vite-plugin-pug';

function styleFilter(id: string) {
	if (id.endsWith('?direct')) return false;
	if (!id.split('?')[0].endsWith('.style')) return false;
	return true;
}

const CSS_SELECTOR_REGEX = /(?<=^|\}|,):host([^{,>]+?)(?=\{| |,|>)/g;

const styleVite: Plugin = {
	name: 'style-importer',
	resolveId(source, importer, _options) {
		if (!(styleFilter(source) && importer)) return null;
		return path.join(
			importer.slice(0, importer.indexOf('abm-ui') + 6),
			'styles/widgets',
			source,
		);
	},
	async load(id, _options) {
		if (!styleFilter(id)) return null;
		const path = id.slice(0, -1);

		this.addWatchFile(path);

		try {
			const styl = await readFile(path, 'utf8');
			let css = stylus.render(styl);
			css = uglifyCSS.processString(css);

			css = css.replace(CSS_SELECTOR_REGEX, (raw, selector) => {
				if (typeof selector !== 'string') return raw;
				if (selector.startsWith('(') && selector.endsWith(')')) return raw;
				return `:host(${selector})`;
			});

			return `export default ${JSON.stringify(css)}`;
		} catch (error) {
			console.error(error);
			return null;
		}
	},
};

export const compilePlugins = [pugVite(), styleVite];
