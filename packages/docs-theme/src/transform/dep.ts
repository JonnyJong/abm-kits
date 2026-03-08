import path from 'node:path';
import esbuild from 'esbuild';
import { getMode, type TransformRule } from 'ezal';

export const depTransformRule: TransformRule = {
	from: '.js',
	to: '.js',
	async transformer(src: string) {
		const buildMode = getMode() === 'build';
		const {
			outputFiles,
			metafile: { inputs },
		} = await esbuild.build({
			// Load
			entryPoints: [src],
			loader: { '.js': 'js' },
			// Output
			bundle: true,
			platform: 'browser',
			format: 'iife',
			target: 'es2024',
			write: false,
			metafile: true,
			sourcemap: buildMode ? false : 'inline',
			// Other
			treeShaking: buildMode,
			minify: buildMode,
		});
		const cwd = process.cwd();
		const result = outputFiles[0].text;
		const dependencies = Object.keys(inputs).map((src) => path.join(cwd, src));
		return { result, dependencies };
	},
};
