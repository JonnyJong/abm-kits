import EventEmitter from 'node:events';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { FSWatcher } from 'chokidar';
import {
	CodeHighlighter,
	CommonPlugin,
	EzalMarkdown,
	Parsed,
	plugins,
	SafeAny,
	utils,
} from 'ezal-markdown';
import prism from 'prismjs';
import loadLanguages from 'prismjs/components/index';
import pug from 'pug';
import yaml from 'yaml';
import { here } from '../fs';
import { Logger } from '../logger';
import { PageData } from '../types';
import { PugRenderer } from './pug';

const ERROR = {
	FILE: 'Could not found markdown file.',
	PARSE: 'Error while parsing',
	RESOLVE: 'Parsing not completed first.',
	RENDER: 'Error while rendering',
	LAYOUT: 'Error applying template.',
} as const;

export enum MarkdownParseError {
	ReadFile,
	Parse,
}
export enum MarkdownRenderError {
	Unresolved,
	Render,
	Layout,
}

const { $ } = utils;
const logger = new Logger('render/markdown');

//#region DEMO

interface DemoParsed extends Parsed {
	id: string;
	locale?: any;
}

const PATTERN_START = /(?<=^|\n)( {0,3})(`{3,}demo[^`\n]*|~{3,}demo.*)(?=$|\n)/;
const PATTERN_FENCE_HEAD = /(?<=^|\n)( {0,3})(`{3,}|~{3,}).*(?=$|\n)/;
const PATTERN_FENCE_INFO_SPLIT = /[ \t]/;

const TYPE_LANGS: Record<string, string> = {
	styl: 'stylus',
};
const TYPE_NAMES: Record<string, string> = {
	ts: 'TypeScript',
	styl: 'Stylus',
	pug: 'Pug',
};
function type2lang(type: string) {
	if (type in TYPE_LANGS) return TYPE_LANGS[type];
	return type;
}
function type2name(type: string) {
	if (type in TYPE_NAMES) return TYPE_NAMES[type];
	return type[0].toUpperCase() + type.slice(1);
}

const demoRenderer: CommonPlugin<'block', DemoParsed> = {
	name: 'demo',
	type: 'block',
	priority: 1,
	start: PATTERN_START,
	parse(source, { shared }) {
		const start = source.match(PATTERN_FENCE_HEAD);
		if (!start) return;
		const removeSpaces = start[1].length;
		const fenceLength = start[2].length;
		const fenceType = start[2][0];
		const startOffset = start[0].length;
		const end = source
			.slice(startOffset)
			.match(
				new RegExp(`(?<=\n)( {0,3})${fenceType}{${fenceLength},}[ \t]*(\n|$)`),
			);
		const raw = source.slice(
			0,
			end?.index ? startOffset + end.index + end[0].length : undefined,
		);
		const info = raw.slice(removeSpaces + fenceLength, startOffset).trim();
		const index = info.match(PATTERN_FENCE_INFO_SPLIT)?.index;
		let lang = info;
		if (!index) return;
		lang = info.slice(0, index);
		const text = info.slice(index).trimStart();
		if (lang.toLowerCase() !== 'demo') return;
		const code = raw
			.slice(startOffset + 1, end?.index ? startOffset + end.index : undefined)
			.replace(new RegExp(`^ {0,${removeSpaces}}`, 'gm'), '');
		const data = yaml.parse(code);
		let demo: string[] | SafeAny = shared.demo;
		if (!Array.isArray(demo)) {
			demo = [];
			shared.demo = demo as any;
		}
		demo.push(text);
		return {
			raw,
			id: text,
			locale: data.locale,
		};
	},
	render({ id, locale }) {
		const dir = here('demo', id);
		const entry = path.join(dir, 'index.pug');
		if (!existsSync(dir)) {
			logger.warn(`Unknown demo: ${id}`);
			return $('figure', {
				class: ['demo', 'demo-error'],
				html: [
					$('w-icon', { attr: { key: 'Warning' } }),
					$('w-lang', { attr: { key: 'demo.missing' } }),
					$('div', { content: id }),
				],
			});
		}
		let html = '';
		if (entry) {
			html += $('iframe', {
				attr: { src: `/abm-kits/demo/${id}`, locale: JSON.stringify(locale) },
			});
		}
		html += '<w-nav></w-nav><div class="demo-files">';
		for (const dirent of readdirSync(dir, { withFileTypes: true })) {
			if (!dirent.isFile()) continue;
			const file = readFileSync(path.join(dir, dirent.name), 'utf8');
			if (file.length === 0) continue;
			const type = path.extname(dirent.name).slice(1);
			const lang = type2lang(type);
			const code = prism.highlight(file, prism.languages[lang], lang);
			html += $('pre', {
				attr: { name: type2name(type) },
				html: $('code', code),
			});
		}
		html += '</div>';
		return $('figure', { class: 'demo', html });
	},
};

const highlighter: CodeHighlighter = (code, type) => {
	if (!type) type = 'plain';
	const lang = type2lang(type);
	const html = prism.highlight(code, prism.languages[lang], lang);
	return [html, `codeblock lang-${type2name(type)}`];
};

const renderer = new EzalMarkdown();
renderer.set(
	demoRenderer,
	plugins.heading({ shiftLevels: true }),
	plugins.codeblock({ highlighter }),
);
loadLanguages(['ts', 'stylus', 'pug']);

//#region Renderer

function normalizePageData(name: string, data: SafeAny): PageData {
	const result: PageData = {
		title: name,
		layout: 'doc',
		source: [],
	};
	if (!data || typeof data !== 'object') return result;
	if (typeof data.title === 'string') result.title = data.title;
	if (typeof data.layout === 'string') result.layout = data.layout;
	if (typeof data.icon === 'string') result.icon = data.icon;
	if (typeof data.order === 'number') result.order = data.order;
	if (Array.isArray(data.source)) result.source = data.source;
	return result;
}

export class MarkdownRenderer extends EventEmitter<{ update: [] }> {
	#data?: PageData;
	#template?: PugRenderer;
	#parsed?: Awaited<ReturnType<typeof renderer.parse>>;
	#filepath: string;
	#filename: string;
	#demo: string[] = [];
	#watcher = new FSWatcher();
	constructor(filepath: string) {
		super();
		this.#filepath = filepath;
		this.#filename = path.basename(this.#filepath, path.extname(this.#filepath));
		this.#watcher.add(this.#filepath);
		this.#watcher.once('ready', () => {
			this.#watcher.on('all', () => this.#updateEmitter());
		});
	}
	#updateEmitter = () => {
		this.emit('update');
	};
	get data(): Readonly<PageData> | undefined {
		return this.#data;
	}
	async parse(): Promise<PageData | MarkdownParseError> {
		// Read File
		let source: string;
		try {
			source = readFileSync(this.#filepath, 'utf8');
		} catch (error) {
			logger.err(ERROR.FILE, this.#filepath, error);
			return MarkdownParseError.ReadFile;
		}
		// Parse
		try {
			this.#parsed = await renderer.parse(source, { frontmatter: true });
		} catch (error) {
			logger.err(ERROR.PARSE, this.#filepath, error);
			return MarkdownParseError.Parse;
		}
		// Page Data
		this.#data = normalizePageData(
			this.#filename,
			this.#parsed.frontmatter?.data as any,
		);
		// Template
		if (this.#template) this.#template.off('update', this.#updateEmitter);
		this.#template = PugRenderer.getRenderer(this.#data.layout);
		this.#template.on('update', this.#updateEmitter);
		// Demo
		let demo: string[] | SafeAny = this.#parsed.context.shared.demo;
		if (Array.isArray(demo)) demo = demo.map((v) => here('demo', v));
		else demo = [];
		const oldDemo = new Set(this.#demo);
		for (const dir of demo) {
			if (oldDemo.has(dir)) {
				oldDemo.delete(dir);
				continue;
			}
			this.#watcher.add(dir);
		}
		for (const dir of oldDemo) {
			this.#watcher.unwatch(dir);
		}
		this.#demo = demo;
		return this.#data;
	}
	async render(data?: pug.LocalsObject): Promise<string | MarkdownRenderError> {
		if (!(this.#template && this.#parsed && this.#data)) {
			logger.err(ERROR.RESOLVE, this.#filepath);
			return MarkdownRenderError.Unresolved;
		}
		let content: string;
		try {
			content = (
				await renderer.renderHTML(this.#parsed.document, this.#parsed.options)
			).html;
		} catch (error) {
			logger.err(ERROR.RENDER, this.#filepath, error);
			return MarkdownRenderError.Render;
		}
		try {
			return this.#template.render({
				...this.#data,
				...data,
				content,
			});
		} catch (error) {
			logger.err(ERROR.LAYOUT, this.#filepath, error);
			return MarkdownRenderError.Layout;
		}
	}
	destroy() {
		return this.#watcher.close();
	}
}
