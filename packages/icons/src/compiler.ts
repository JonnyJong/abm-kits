import { existsSync } from 'node:fs';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import cliProgress from 'cli-progress';
import svg2ttf from 'svg2ttf';
import type { SVGIcons2SVGFontStream } from 'svgicons2svgfont';
import ttf2woff from 'ttf2woff';
import { ReadStream } from 'typeorm/platform/PlatformTools';
import { getAllIcons } from './db';
import { ICONS, PROJECT_ROOT } from './path';
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

async function compileIcons(name: string, icons: IconsToCompile) {
	const dir = path.join(PROJECT_ROOT, name, 'assets');
	const svg = path.join(dir, 'icon.svg');
	const ttf = path.join(dir, 'icon.ttf');
	const woff = path.join(dir, 'icon.woff');
	const woff2 = path.join(dir, 'icon.woff2');
	const css = path.join(dir, 'icon.css');

	if (!existsSync(dir)) await mkdir(dir, { recursive: true });

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

function checkProjectAvailable(name: string) {
	const dir = path.join(PROJECT_ROOT, name);
	return existsSync(dir);
}

const compiling = new Map<string, Promise<boolean>>();

async function executeCompile(name: string) {
	if (!checkProjectAvailable(name)) return false;
	const icons = [...(await getProject(name)).entries()].map<IconsToCompile[0]>(
		([file, { id }]) => [file, id],
	);
	await compileIcons(name, icons);
	compiling.delete(name);
	return true;
}

async function executeCompileAll(name: string) {
	if (!checkProjectAvailable(name)) return false;
	const icons = await getAllIcons();
	await compileIcons(name, icons);
	compiling.delete(name);
	return true;
}

export function compileProject(name: string) {
	let compiler = compiling.get(name);
	if (compiler) return;
	compiler = executeCompile(name);
	compiling.set(name, compiler);
	return;
}

export function compileAllIconForProject(name: string) {
	let compiler = compiling.get(name);
	if (compiler) return;
	compiler = executeCompileAll(name);
	compiling.set(name, compiler);
	return;
}
