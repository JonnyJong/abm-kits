import path from 'node:path';
import CleanCSS from 'clean-css';
import { fs, getMode, normalizeError, type TransformRule } from 'ezal';
import stylus from 'stylus';

const cleaner = new CleanCSS();

export const styleTransformRule: TransformRule = {
	from: '.styl',
	to: '.css',
	async transformer(src: string) {
		const file = await fs.readFile(src);
		if (file instanceof Error) return file;
		try {
			const renderer = stylus(file, {
				paths: [path.join(src, '..')],
				filename: path.basename(src),
				// @ts-expect-error
				'include css': true,
			});
			const dependencies = renderer.deps().map((dep) => {
				if (!dep.startsWith('//?/')) return dep;
				return path.normalize(dep.slice(4));
			});
			let result = renderer.render();
			if (getMode() === 'build') result = cleaner.minify(result).styles;
			return { result, dependencies };
		} catch (error) {
			return normalizeError(error);
		}
	},
};
