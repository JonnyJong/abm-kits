import path from 'node:path';
import { fs, getConfig, type Page, URL } from 'ezal';
import { type CommonPlugin, type Parsed, utils } from 'ezal-markdown';
import { highlight, PATTERN_EMPTY_LINE } from './codeblock';

interface DemoParsed extends Parsed {
	src: string;
}

const { $ } = utils;

const PATTERN = /(?<=^|\n)\{\{\[demo\]\((.*)\)\}\}(?=\n|$)/;

export const demo: CommonPlugin<'block', DemoParsed> = {
	name: 'demo',
	type: 'block',
	order: 0,
	priority: 0,
	start: PATTERN,
	parse(source, { shared }) {
		const matched = source.match(PATTERN);
		if (!matched) return;
		const page = shared.page as any as Page;
		const src = path.join(page.src, '..', matched[1]);
		return { raw: matched[0], src };
	},
	async render({ src }) {
		const { source, site } = getConfig();
		const ext = path.extname(src).slice(1);
		const dist = `${src.slice(0, -ext.length)}js`;

		let code = await fs.readFile(path.join(source.root, src));
		if (code instanceof Error) throw code;
		const index = code.indexOf('\n//#region #Reg\n');
		if (index !== -1) code = code.slice(0, index).trimEnd();

		let [html] = await highlight(code, ext);
		html = html.replace(PATTERN_EMPTY_LINE, '</code></pre>');

		const script = `${site.root ?? ''}/${dist.replaceAll('\\', '/')}`;
		return $('div', {
			class: 'surface demo',
			html: [
				$('iframe', {
					class: 'demo-host',
					attr: { src: `${URL.for('demo.html')}?script=${script}` },
				}),
				$('figure', { class: 'code', html }),
			],
		});
	},
};
