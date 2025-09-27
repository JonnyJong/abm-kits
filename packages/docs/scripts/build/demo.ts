import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { watch } from 'chokidar';
import { here, isIgnore, iterFiles, out, writeFile } from '../fs';
import { Logger } from '../logger';
import { PugRenderer } from '../render/pug';
import { StylusRenderer } from '../render/stylus';
import { TypeScriptRenderer } from '../render/typescript';

const logger = new Logger('build/demo');

const root = here('demo');
const watcher = watch(root);
const template = PugRenderer.getRenderer('demo');
const tsRenderer = new TypeScriptRenderer();
const stylusRenderer = new StylusRenderer();
const pugRenderers = new Set<PugRenderer>();

function buildPug(filepath: string, renderer: PugRenderer) {
	const cssPath = path.join(filepath, '../index.styl');
	const scriptPath = path.join(filepath, '../index.ts');
	const output = out('demo', path.relative(root, filepath), '..', 'index.html');
	const main = renderer.render();
	const html = template.render({
		inject: {
			css: existsSync(cssPath),
			script: existsSync(scriptPath),
		},
		main,
	});
	try {
		writeFile(output, html);
	} catch (error) {
		logger.err(`Error when writing ${output}`, error);
	}
}

function preparePug(filepath: string) {
	const renderer = PugRenderer.getRenderer(filepath);
	if (pugRenderers.has(renderer)) return;
	pugRenderers.add(renderer);
	buildPug(filepath, renderer);
	renderer.on('update', () => buildPug(filepath, renderer));
}

async function buildTS(filepath: string) {
	const result = await tsRenderer.render(filepath);
	if (!result) {
		logger.err(`Failed to build ${filepath}`);
		return;
	}
	result[0] = `window.demo = (console)=>{\n${result[0]}\n}`;
	const name = path.basename(filepath, path.extname(filepath));
	const codeOutput = out(
		'demo',
		path.relative(root, filepath),
		'..',
		`${name}.js`,
	);
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
	const output = out('demo', path.relative(root, filepath), '..', `${name}.css`);
	try {
		writeFile(output, css);
	} catch (error) {
		logger.err(`Error when writing ${output}`, error);
	}
}

function tryBuild(filepath: string) {
	const name = path.basename(filepath);
	if (name === 'index.pug') return preparePug(filepath);
	const entryFile = path.join(filepath, '..', 'index.pug');
	if (!existsSync(entryFile)) return;
	const ext = path.extname(filepath);
	if (ext === '.ts') return buildTS(filepath);
	if (ext === '.styl') return buildStylus(filepath);
}

export async function buildDemo() {
	watcher.once('ready', () => {
		watcher.on('all', (_, filepath) => {
			if (tsRenderer.isTracing(filepath)) return;
			if (stylusRenderer.isTracing(filepath)) return;
			if (isIgnore(filepath)) return;
			if (!existsSync(filepath)) return;
			try {
				if (!statSync(filepath).isFile()) return;
			} catch {
				return;
			}
			logger.log(`Updating ${filepath}`);
			tryBuild(filepath);
		});
	});
	for (const file of iterFiles(root)) {
		await tryBuild(path.join(root, file));
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
	template.on('update', () => {
		for (const file of iterFiles(root)) {
			const name = path.basename(file);
			if (name !== 'index.pug') continue;
			preparePug(path.join(root, file));
		}
	});
}

export function stopBuildDemo() {
	return Promise.all([
		watcher.close(),
		tsRenderer.destroy(),
		stylusRenderer.destroy(),
	]);
}
