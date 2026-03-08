import path from 'node:path';
import { theme } from 'docs-theme';
import { defineConfig } from 'ezal';

function parse(src: string): [dir: string, name: string] {
	if (src[0] === '/') src = src.slice(1);
	const nameSep = src.lastIndexOf('/');

	let dir = src.slice(0, nameSep);
	if (dir.startsWith('docs')) dir = dir.slice(5);

	let name = src.slice(nameSep + 1);
	const extSep = name.lastIndexOf('.');
	if (extSep !== -1) name = name.slice(0, extSep);

	return [dir, name];
}

const STATIC_URLS = new Set(['/404.html', '/demo.html']);

function formatUrl(src: string): string {
	if (STATIC_URLS.has(src)) return src;
	const [dir, name] = parse(src.replaceAll('\\', '/'));
	if (name === 'index') return dir;
	return `${dir}/${name}`;
}

export default defineConfig(async () => ({
	site: {
		title: 'ABM Kits Docs',
		author: 'Jonny',
		language: 'zh',
		domain: 'https://jonnyjong.github.io',
		root: '/abm-kits',
		pageUrlFormat: ({ src }) => formatUrl(src),
		articleUrlFormat: ({ src }) => formatUrl(src),
	},
	source: {
		root: 'src',
		article: 'docs',
	},
	outDir: 'dist',
	theme: await theme({
		locales: { en: 'English', zh: '简体中文' },
		assets: {
			'abm.css': path.join(import.meta.dirname, 'node_modules/abm-ui/index.css'),
		},
	}),
	server: { port: 5500, host: '0.0.0.0', autoReload: true },
}));
