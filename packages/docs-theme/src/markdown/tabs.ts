import {
	type CommonPlugin,
	type Parsed,
	type ParsedChild,
	utils,
} from 'ezal-markdown';

interface TabsParsed extends Parsed {
	children: [tab: ParsedChild, content: ParsedChild][];
}

const PATTERN_START = /(?<=^|\n) {0,3}(:{3,}) {0,3}\S/;

const { $ } = utils;

export const tabs: CommonPlugin<'block', TabsParsed, number> = {
	name: 'tabs',
	type: 'block',
	order: 0,
	priority: 0,
	start: PATTERN_START,
	parse(source, { md }) {
		const size = source.match(PATTERN_START)?.[1].length ?? 0;
		if (!size) return;

		const pattern = new RegExp(`(?<=^|\\n) {0,3}:{${size}}(.*)(\\n|$)`);
		const children: TabsParsed['children'] = [];

		let matched = source.match(pattern);
		let offset = 0;
		while (matched) {
			offset += matched[0].length;
			if (matched[1].trim().length === 0) break;
			const tab = md(matched[1], 'inline');
			matched = source.slice(offset).match(pattern);
			const next = (matched?.index ?? Infinity) + offset;
			const content = md(source.slice(offset, next), 'block');
			offset = next;
			children.push([tab, content]);
		}

		if (children.length === 0) return;

		return { raw: source.slice(0, offset), children };
	},
	render({ children }) {
		const nav = children.map(([tab]) => $('div', tab));
		const content = children.map(([_, content], i) =>
			$('div', { class: i === 0 ? 'active' : undefined, html: content.html }),
		);
		return $('div', {
			class: ['surface', 'tabs'],
			html: [
				$('div', { class: ['tab-nav', 'sticky'], html: nav }),
				$('div', { class: ['tab-content', 'sticky-content'], html: content }),
			],
		});
	},
};
