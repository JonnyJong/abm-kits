import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { watch } from 'chokidar';
import { here, isIgnore, iterFiles, out, writeFile } from '../fs';
import { Logger } from '../logger';
import { StylusRenderer } from '../render/stylus';
import { TypeScriptRenderer } from '../render/typescript';
import { setupWatcher } from '../utils';

const logger = new Logger('build/deps');

const root = here('deps');
const watcher = watch(root, { awaitWriteFinish: true, ignoreInitial: true });
const tsRenderer = new TypeScriptRenderer(() => false);
const stylusRenderer = new StylusRenderer();

async function buildTS(filepath: string) {
	const result = await tsRenderer.render(filepath);
	if (!result) {
		logger.err(`Failed to build ${filepath}`);
		return;
	}
	const name = path.basename(filepath, path.extname(filepath));
	const codeOutput = out(
		'deps',
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
	const output = out('deps', path.relative(root, filepath), '..', `${name}.css`);
	try {
		writeFile(output, css);
	} catch (error) {
		logger.err(`Error when writing ${output}`, error);
	}
}

function tryBuild(filepath: string) {
	const ext = path.extname(filepath);
	if (ext === '.ts') return buildTS(filepath);
	if (ext === '.styl') return buildStylus(filepath);
}

export async function buildDeps() {
	setupWatcher(watcher, (filepath) => {
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
	await Promise.all(
		[...iterFiles(root)].map((file) => tryBuild(path.join(root, file))),
	);
	tsRenderer.on('update', async (filepaths) => {
		await Promise.all(
			filepaths.map(async (filepath) => {
				logger.log(`Updating ${filepath}`);
				await buildTS(filepath);
			}),
		);
	});
	stylusRenderer.on('update', (filepaths) => {
		for (const filepath of filepaths) {
			logger.log(`Updating ${filepath}`);
			buildStylus(filepath);
		}
	});
}

export function stopBuildDeps() {
	return Promise.all([
		watcher.close(),
		tsRenderer.destroy(),
		stylusRenderer.destroy(),
	]);
}
