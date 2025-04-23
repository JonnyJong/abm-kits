import { existsSync } from 'node:fs';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import cliProgress from 'cli-progress';
import svg2ttf from 'svg2ttf';
// @ts-ignore
import type { SVGIcons2SVGFontStream } from 'svgicons2svgfont';
import ttf2woff from 'ttf2woff';
import { ReadStream } from 'typeorm/platform/PlatformTools';
import { Icons } from '../types';
import { getAllIcons } from './db';
import { DEFAULTS_ICONS } from './defaults';
import { ICONS } from './path';
import { getProject } from './project';

export type IconsToCompile = [file: string, id: string][];

const UNICODE_RANGE = [
	[0xe000, 0xf8ff],
	[0xf0000, 0x10ffff],
];

function generateUnicode() {
	let i = UNICODE_RANGE[0][0];
	let range = 0;
	return () => {
		const result: [string, number] = [String.fromCharCode(i), i];
		if (i >= 0x10000) result[0] += ' ';

		i++;
		if (i <= UNICODE_RANGE[range][1]) return result;

		range++;
		if (range > UNICODE_RANGE.length) throw new Error('Unicode range exceeded');
		i = UNICODE_RANGE[range][0];

		return result;
	};
}

function pushIcon(
	file: string,
	unicode: () => [string, number],
	id: string,
	fontStream: SVGIcons2SVGFontStream,
) {
	const glyph = createReadStream(path.join(ICONS, file)) as ReadStream & {
		metadata: { unicode: string[]; name: string };
	};
	glyph.metadata = {
		unicode: [unicode()[0]],
		name: id,
	};
	fontStream.write(glyph);
	return new Promise<void>((resolve, reject) => {
		glyph.on('end', resolve);
		glyph.on('error', reject);
	});
}

async function compileSVG(svgPath: string, icons: IconsToCompile) {
	const { SVGIcons2SVGFontStream } = await import('svgicons2svgfont');
	const fontStream = new SVGIcons2SVGFontStream({
		fontName: 'icon',
		fontId: 'icon',
		fontHeight: 1000,
		normalize: true,
		descent: 150,
	});
	const writeStream = createWriteStream(svgPath);
	fontStream.pipe(writeStream);

	const progress = new cliProgress.SingleBar(
		{ fps: 2 },
		cliProgress.Presets.rect,
	);
	progress.start(icons.length, 0);
	let i = 0;

	const unicode = generateUnicode();
	for (const [file, id] of icons) {
		await pushIcon(file, unicode, id, fontStream);
		progress.update(++i);
	}
	fontStream.end();
	progress.stop();

	return new Promise<void>((resolve, reject) => {
		writeStream.on('close', resolve);
		writeStream.on('error', reject);
		fontStream.on('error', reject);
	});
}

async function generateTTF(ttfPath: string, svgPath: string) {
	const ttf = svg2ttf(await readFile(svgPath, 'utf8'));
	const buffer = Buffer.from(ttf.buffer);
	await writeFile(ttfPath, Buffer.from(ttf.buffer));
	return buffer;
}

function generateWOFF(woffPath: string, buffer: Buffer) {
	const woff = ttf2woff(buffer);
	return writeFile(woffPath, woff);
}

async function generateWOFF2(woff2Path: string, buffer: Buffer) {
	const ttf2woff2 = (await import('ttf2woff2')).default;
	const woff2 = ttf2woff2(buffer);
	return writeFile(woff2Path, woff2);
}

function generateCSS(cssPath: string, icons: IconsToCompile) {
	const hash = Date.now().toString(36);
	const stream = createWriteStream(cssPath, 'utf8');
	const promise = new Promise<void>((resolve, reject) => {
		stream.on('close', resolve);
		stream.on('error', reject);
	});

	stream.write(`@font-face{font-family:'icon';src:`);

	stream.write(
		[
			`url('./icon.woff2?${hash}') format('woff2')`,
			`url('./icon.woff?${hash}') format('woff')`,
			`url('./icon.ttf?${hash}') format('truetype')`,
			`url('./icon.svg?${hash}') format('svg')`,
		].join(','),
	);
	stream.write(
		`;font-weight:normal;font-style:normal;font-display:swap;}[class*='icon-']{font-family:'icon'!important;speak:never;font-style:normal;font-weight:normal;font-variant:normal;text-transform:none;line-height:1;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}`,
	);

	const progress = new cliProgress.SingleBar(
		{ fps: 2 },
		cliProgress.Presets.rect,
	);
	progress.start(icons.length, 0);
	let i = 0;

	const unicode = generateUnicode();

	for (const [_, id] of icons) {
		stream.write(`.icon-${id}:before{content:'\\${unicode()[1].toString(16)}';}`);
		progress.update(++i);
	}

	stream.close();

	progress.stop();

	return promise;
}

async function compileIcons(name: string, icons: IconsToCompile, dist: string) {
	const svg = path.join(dist, 'icon.svg');
	const ttf = path.join(dist, 'icon.ttf');
	const woff = path.join(dist, 'icon.woff');
	const woff2 = path.join(dist, 'icon.woff2');
	const css = path.join(dist, 'icon.css');

	if (!existsSync(dist)) await mkdir(dist, { recursive: true });

	try {
		console.log(`Compiling svg for ${name}`);
		await compileSVG(svg, icons);
		console.log(`Generating ttf for ${name}`);
		const buffer = await generateTTF(ttf, svg);
		console.log(`Generating woff for ${name}`);
		await generateWOFF(woff, buffer);
		console.log(`Generating woff2 for ${name}`);
		await generateWOFF2(woff2, buffer);
		console.log(`Generating css for ${name}`);
		await generateCSS(css, icons);
		console.log(`Success for ${name}`);
	} catch (error) {
		console.error(error);
	}
}

function checkProjectAvailable(projectPath: string) {
	return existsSync(projectPath);
}

const compiling = new Map<string, Promise<boolean>>();

function prepareIcons(icons: Icons): IconsToCompile {
	return [...icons.entries()].map<IconsToCompile[0]>(([file, { id }]) => [
		file,
		id,
	]);
}

async function executeCompile(projectPath: string) {
	if (!checkProjectAvailable(projectPath)) return false;
	const project = await getProject(projectPath);
	const icons = prepareIcons(project.icons);
	if (project.includeDefaults) {
		const defaultsIcons = new Map(DEFAULTS_ICONS);
		for (const key of project.icons.keys()) {
			defaultsIcons.delete(key);
		}
		icons.push(...prepareIcons(defaultsIcons));
	}
	await compileIcons(projectPath, icons, path.join(projectPath, project.dist));
	compiling.delete(projectPath);
	return true;
}

async function executeCompileAll(projectPath: string) {
	if (!checkProjectAvailable(projectPath)) return false;
	const project = await getProject(projectPath);
	const icons = await getAllIcons();
	await compileIcons(projectPath, icons, path.join(projectPath, project.dist));
	compiling.delete(projectPath);
	return true;
}

export function compileProject(projectPath: string) {
	let compiler = compiling.get(projectPath);
	if (compiler) return;
	compiler = executeCompile(projectPath);
	compiling.set(projectPath, compiler);
	return;
}

export function compileAllIconForProject(projectPath: string) {
	let compiler = compiling.get(projectPath);
	if (compiler) return;
	compiler = executeCompileAll(projectPath);
	compiling.set(projectPath, compiler);
	return;
}
