import path from 'node:path';
import esbuild from 'esbuild';
import ts from 'typescript';
import { createProgram, createWatchProgram, report } from './ts.ts';

const BASE = path.join(import.meta.dirname, '../packages/abm-utils');
const TSCONFIG = path.join(BASE, 'tsconfig.json');

const shared: esbuild.BuildOptions = {
	entryPoints: [path.join(BASE, 'src/index.ts')],
	bundle: true,
	sourcemap: true,
	minify: true,
};

const cjs: esbuild.BuildOptions = {
	...shared,
	format: 'cjs',
	outfile: path.join(BASE, 'dist/index.cjs'),
};

const esm: esbuild.BuildOptions = {
	...shared,
	format: 'esm',
	outfile: path.join(BASE, 'dist/index.mjs'),
};

async function build() {
	const program = createProgram(TSCONFIG);
	const result = program.emit();
	report(...ts.getPreEmitDiagnostics(program).concat(result.diagnostics));

	await esbuild.build(cjs);
	await esbuild.build(esm);
}

async function watch() {
	const program = createWatchProgram(TSCONFIG);

	const cjsCtx = await esbuild.context(cjs);
	const esmCtx = await esbuild.context(esm);
	await Promise.all([cjsCtx.watch(), esmCtx.watch()]);

	process.on('SIGINT', async () => {
		program.close();
		await cjsCtx.dispose();
		await esmCtx.dispose();
		process.exit(0);
	});
}

async function main() {
	if (process.argv.includes('-w')) await watch();
	else await build();
}

main();
