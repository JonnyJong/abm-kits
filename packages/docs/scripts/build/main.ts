import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { watch } from 'chokidar';
import yaml from 'yaml';
import { copyFile, here, isIgnore, iterFiles, out, writeFile } from '../fs';
import { Logger } from '../logger';
import { MarkdownRenderer } from '../render/markdown';
import { StylusRenderer } from '../render/stylus';
import { TypeScriptRenderer } from '../render/typescript';
import { PageData } from '../types';
import { OrderedMap } from '../utils';

export interface LangCate {
	locale: Record<string, any>;
	pages: Map<string, MarkdownRenderer>;
	items: OrderedMap<string, LangPageData>;
}

interface LangPageData {
	data?: PageData & { url: string };
	items: OrderedMap<string, LangPageData>;
}

const logger = new Logger('build/main');

const root = here('src');
const watcher = watch(here(root));
const tsRenderer = new TypeScriptRenderer();
const stylusRenderer = new StylusRenderer();
const mdRenderer = new Map<string, MarkdownRenderer>();
const langCates = new Map<string, LangCate>();

//#region Utils

function getLang(filepath: string): string | null {
	const [lang] = path.relative(root, filepath).replace('\\', '/').split('/', 1);
	return existsSync(here('src', lang, 'locale.yaml')) ? lang : null;
}

function compareString(a: string, b: string): number {
	if (a > b) return 1;
	if (a < b) return -1;
	return 0;
}

function langPageDataComparer(
	[an, av]: [string, LangPageData],
	[bn, bv]: [string, LangPageData],
): number {
	const nameOrder = compareString(an, bn);
	if (typeof av.data?.order !== 'number') {
		if (typeof bv.data?.order === 'number') return 1;
		return nameOrder;
	}
	if (typeof bv.data?.order !== 'number') return -1;
	const diff = av.data.order - bv.data.order;
	if (diff) return diff;
	return nameOrder;
}

function getLangCate(lang: string): LangCate {
	let cate = langCates.get(lang);
	if (cate) return cate;
	cate = {
		locale: {},
		pages: new Map(),
		items: new OrderedMap(undefined, langPageDataComparer),
	};
	langCates.set(lang, cate);
	return cate;
}

function setLangCateItem(item: LangPageData, filepath: string, data: PageData) {
	const paths = filepath2Paths(filepath);
	const last = paths.pop()!;
	for (const name of paths) {
		let next = item.items.get(name);
		if (next) {
			item = next;
			continue;
		}
		next = { items: new OrderedMap(undefined, langPageDataComparer) };
		item.items.set(name, next);
		item = next;
	}
	let next = item.items.get(last);
	if (!next) {
		next = { items: new OrderedMap(undefined, langPageDataComparer) };
	}
	next.data = { ...data, url: [...paths, last].join('/') };
	item.items.set(last, next);
}

function getLangCateItems(
	item: LangPageData,
	filepath: string,
): OrderedMap<string, LangPageData> {
	const paths = filepath2Paths(filepath);
	for (const name of paths) {
		let next = item.items.get(name);
		if (next) {
			item = next;
			continue;
		}
		next = { items: new OrderedMap(undefined, langPageDataComparer) };
		item.items.set(name, next);
		item = next;
	}
	return item.items;
}

function applyLangCateFallback(
	lang: string,
	main: LangCate,
	fallbacks: LangCate[],
): LangCate {
	const result: LangCate = {
		locale: main.locale,
		pages: new Map(),
		items: new OrderedMap(undefined, langPageDataComparer),
	};
	for (const cate of [main, ...fallbacks]) {
		for (let [filepath, renderer] of cate.pages) {
			filepath = patchFilepath(filepath, lang);
			const data = renderer.data ?? {
				title: path.basename(filepath, path.extname(filepath)),
				layout: 'doc',
				source: [],
			};
			setLangCateItem(result, filepath, data);
			result.pages.set(filepath, renderer);
		}
	}
	return result;
}

const PATTERN_SEP = /[\\/]/g;

function filepath2Paths(filepath: string): string[] {
	const paths = path.relative(root, filepath).split(PATTERN_SEP).slice(1);
	const last = paths.pop()!;
	if (last !== 'index.md') paths.push(last.slice(0, -3));
	return paths;
}

function filepath2Dist(filepath: string): string {
	const paths = path.relative(root, filepath).split(PATTERN_SEP);
	const last = paths.pop()!;
	if (last !== 'index.md') paths.push(last.slice(0, -3));
	return out(...paths, 'index.html');
}

function patchFilepath(filepath: string, lang: string): string {
	const paths = path.relative(root, filepath).split(PATTERN_SEP).slice(1);
	return path.join(root, lang, ...paths);
}

//#region Build

async function buildTS(filepath: string) {
	const result = await tsRenderer.render(filepath);
	if (!result) {
		logger.err(`Failed to build ${filepath}`);
		return;
	}
	result[0] = `(()=>{\n${result[0]}\n})()`;
	const name = path.basename(filepath, path.extname(filepath));
	const codeOutput = out(path.relative(root, filepath), '..', `${name}.js`);
	const mapOutput = `${codeOutput}.map`;
	try {
		writeFile(codeOutput, result[0]);
	} catch (error) {
		logger.err(`Error when writing ${codeOutput}`, error);
	}
	try {
		writeFile(mapOutput, result[1]);
	} catch (error) {
		logger.err(`Error when writing ${mapOutput}`, error);
	}
}

function buildStylus(filepath: string) {
	const css = stylusRenderer.render(filepath);
	const name = path.basename(filepath, path.extname(filepath));
	const output = out(path.relative(root, filepath), '..', `${name}.css`);
	try {
		writeFile(output, css);
	} catch (error) {
		logger.err(`Error when writing ${output}`, error);
	}
}

function buildAssets(filepath: string) {
	const output = out(path.relative(root, filepath));
	copyFile(filepath, output);
}

async function buildPage(filepath: string, renderer: MarkdownRenderer) {
	const output = filepath2Dist(filepath);
	const result = await renderer.render();
	if (typeof result !== 'string') return;
	try {
		writeFile(output, result);
	} catch (error) {
		logger.err(`Failed to write ${output}`, error);
	}
}

function buildLocale(filepath: string, lang: string) {
	const cate = getLangCate(lang);
	let file: string;
	try {
		file = readFileSync(filepath, 'utf8');
	} catch (error) {
		logger.err(`Failed to read locale of ${lang}.`, error);
		return;
	}
	try {
		cate.locale = yaml.parse(file);
	} catch (error) {
		logger.err(`Failed to build locale of ${lang}.`, error);
	}
}

async function prepareDoc(filepath: string, lang: string) {
	const cate = getLangCate(lang);
	const renderer = new MarkdownRenderer(filepath);
	renderer.on('update', async () => {
		logger.log(`Updating ${filepath}`);
		const name = path.basename(filepath, path.extname(filepath));
		let data = await renderer.parse();
		if (typeof data !== 'object')
			data = { title: name, layout: 'doc', source: [] };
		setLangCateItem(cate, filepath, data);
		await buildDoc(filepath2Dist(filepath), renderer, cate, lang, filepath);
	});
	const name = path.basename(filepath, path.extname(filepath));
	let data = await renderer.parse();
	if (typeof data !== 'object')
		data = { title: name, layout: 'doc', source: [] };
	setLangCateItem(cate, filepath, data);
	cate.pages.set(filepath, renderer);
}

async function buildDoc(
	output: string,
	renderer: MarkdownRenderer,
	lang: LangCate,
	language: string,
	filepath: string,
) {
	const result = await renderer.render({
		lang,
		languages: [...langCates.keys()],
		language,
		localeJS: `window.__LOCALE = ${JSON.stringify(lang.locale)}`,
		languagesJS: `window.__LANGUAGES = ${JSON.stringify([...langCates.keys()])}`,
		items: getLangCateItems(lang, filepath),
	});
	if (typeof result !== 'string') return;
	try {
		writeFile(output, result);
	} catch (error) {
		logger.err(`Failed to write ${output}`, error);
	}
}

async function tryBuild(filepath: string) {
	const ext = path.extname(filepath);
	if (ext === '.ts') return buildTS(filepath);
	if (ext === '.styl') return buildStylus(filepath);
	const lang = getLang(filepath);
	if (!lang) {
		if (ext !== '.md') {
			buildAssets(filepath);
			return;
		}
		const renderer = new MarkdownRenderer(filepath);
		await renderer.parse();
		renderer.on('update', async () => {
			logger.log(`Updating ${filepath}`);
			await renderer.parse();
			await buildPage(filepath, renderer);
		});
		mdRenderer.set(filepath, renderer);
		return;
	}
	if (ext === '.yaml' && path.join(filepath, '..') === here('src', lang)) {
		switch (path.basename(filepath)) {
			case 'locale.yaml':
				buildLocale(filepath, lang);
				return;
		}
	}
	if (ext === '.md') await prepareDoc(filepath, lang);
	else buildAssets(filepath);
}

//#region Entry

async function tryUpdateDoc(filepath: string): Promise<boolean> {
	const lang = getLang(filepath);
	if (!lang) return false;
	const cate = getLangCate(lang);
	if (here('src', lang, 'locale.yaml') === filepath) {
		buildLocale(filepath, lang);
		for (const [filepath, renderer] of cate.pages) {
			await buildDoc(filepath2Dist(filepath), renderer, cate, lang, filepath);
		}
		return true;
	}
	if (path.extname(filepath) !== '.md') return false;
	if (!cate.pages.has(filepath)) await prepareDoc(filepath, lang);
	await buildDoc(
		filepath2Dist(filepath),
		cate.pages.get(filepath)!,
		cate,
		lang,
		filepath,
	);
	return true;
}

async function buildAllDocs() {
	const { fallbackOrder } = JSON.parse(
		readFileSync(here('config.json'), 'utf8'),
	) as { fallbackOrder: string[] };
	fallbackOrder.reverse();
	const fallbacks: LangCate[] = [];
	for (const lang of fallbackOrder) {
		const cate = getLangCate(lang);
		fallbacks.push(cate);
		const patchedCate = applyLangCateFallback(
			lang,
			cate,
			[...fallbacks].reverse(),
		);
		for (const [filepath, renderer] of patchedCate.pages) {
			await buildDoc(
				filepath2Dist(filepath),
				renderer,
				patchedCate,
				lang,
				filepath,
			);
		}
	}
	fallbacks.reverse();
	for (const [lang, cate] of langCates) {
		if (fallbackOrder.includes(lang)) continue;
		const patchedCate = applyLangCateFallback(lang, cate, fallbacks);
		for (const [filepath, renderer] of patchedCate.pages) {
			await buildDoc(
				filepath2Dist(filepath),
				renderer,
				patchedCate,
				lang,
				filepath,
			);
		}
	}
}

export async function buildMain() {
	watcher.once('ready', () => {
		watcher.on('all', async (_, filepath) => {
			if (tsRenderer.isTracing(filepath)) return;
			if (stylusRenderer.isTracing(filepath)) return;
			if (mdRenderer.has(filepath)) return;
			if (isIgnore(filepath)) return;
			if (!existsSync(filepath)) return;
			try {
				if (!statSync(filepath).isFile()) return;
			} catch {
				return;
			}
			logger.log(`Updating ${filepath}`);
			if (await tryUpdateDoc(filepath)) return;
			tryBuild(filepath);
			const renderer = mdRenderer.get(filepath);
			if (!renderer) return;
			buildPage(filepath, renderer);
		});
	});
	for (const file of iterFiles(root)) {
		await tryBuild(path.join(root, file));
	}
	await buildAllDocs();
	for (const [filepath, renderer] of mdRenderer) {
		await buildPage(filepath, renderer);
	}
	tsRenderer.on('update', async (filepaths) => {
		for (const filepath of filepaths) {
			logger.log(`Updating ${filepath}`);
			await buildTS(filepath);
		}
	});
	stylusRenderer.on('update', (filepaths) => {
		for (const filepath of filepaths) {
			logger.log(`Updating ${filepath}`);
			buildStylus(filepath);
		}
	});
}

export function stopBuildMain() {
	const promises: Promise<any>[] = [
		watcher.close(),
		tsRenderer.destroy(),
		stylusRenderer.destroy(),
	];
	for (const renderer of mdRenderer.values()) {
		promises.push(renderer.destroy());
	}
	for (const cate of langCates.values()) {
		for (const renderer of cate.pages.values()) {
			promises.push(renderer.destroy());
		}
	}
	return Promise.all(promises);
}
