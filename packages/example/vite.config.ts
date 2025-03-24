import { defineConfig } from 'vite';
import { compilePlugins } from '../../scripts/compiler.ts';

const HOST = '127.0.0.1';
const PORT = 5500;

// https://vitejs.dev/config/
export default defineConfig({
	clearScreen: false,
	server: {
		port: PORT,
		strictPort: true,
		host: HOST,
		hmr: {
			protocol: 'ws',
			HOST,
			port: PORT + 1,
		},
	},
	optimizeDeps: {
		force: true,
	},
	plugins: [...compilePlugins],
});
