import path from 'node:path';
import { defineConfig } from 'rolldown';

export default defineConfig({
	input: path.join(__dirname, 'scripts/index.ts'),
	output: {
		file: path.join(__dirname, 'scripts/index.js'),
		format: 'cjs',
		sourcemap: true,
	},
	external: (id: string) => !(id[0] === '.' || path.isAbsolute(id)),
});
