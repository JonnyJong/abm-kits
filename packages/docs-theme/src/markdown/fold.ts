import {
	type CommonPlugin,
	type Parsed,
	type ParsedChild,
	utils,
} from 'ezal-markdown';

interface FoldParsed extends Parsed {
	children: [summary: ParsedChild, details: ParsedChild];
}

const PATTERN_START = /(?<=^|\n) {0,3}(\+{3,}) {0,3}(\S.*)\n/;

const { $ } = utils;

export const fold: CommonPlugin<'block', FoldParsed> = {
	name: 'fold',
	type: 'block',
	order: 0,
	priority: 0,
	start: PATTERN_START,
	parse(source, { md }) {
		const matched = source.match(PATTERN_START);
		if (!matched) return;
		const size = matched[1].length;
		const summary = matched[2];
		const pattern = new RegExp(`(?<=^|\\n) {0,3}\\+{${size}}\\s*(\\n|$)`);
		const endMatched = source.match(pattern);
		const end = endMatched?.index ?? Infinity;
		const rawEnd = end + (endMatched?.[0].length ?? 0);
		const raw = source.slice(0, rawEnd);
		const details = raw.slice(matched[0].length, end);
		return {
			raw,
			children: [md(summary, 'inline'), md(details, 'block')],
		};
	},
	render({ children: [summary, details] }) {
		return $('details', {
			html: [
				$('summary', { class: 'sticky', html: summary.html }),
				$('div', { class: 'sticky-content', html: details.html }),
			],
		});
	},
};
