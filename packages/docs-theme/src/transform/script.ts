import path from 'node:path';
import esbuild from 'esbuild';
import { getMode, type TransformRule } from 'ezal';

export const scriptTransformRule: TransformRule = {
	from: ['.ts', '.tsx'],
	to: '.js',
	async transformer(src: string) {
		const buildMode = getMode() === 'build';
		const {
			outputFiles,
			metafile: { inputs },
		} = await esbuild.build({
			// Load
			entryPoints: [src],
			loader: { '.ts': 'ts', '.tsx': 'tsx', '.svg': 'text' },
			// Output
			bundle: true,
			platform: 'browser',
			format: 'iife',
			target: 'es2024',
			write: false,
			metafile: true,
			sourcemap: buildMode ? false : 'inline',
			external: ['abm-ui', 'abm-utils', 'log2dom'],
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
