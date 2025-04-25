import { defineConfig } from 'vite';
import pugVite from 'vite-plugin-pug';

const HOST = '127.0.0.1';
const PORT = 5502;

// https://vitejs.dev/config/
export default defineConfig({
	clearScreen: false,
	server: {
		port: PORT,
		strictPort: true,
		host: HOST,
		hmr: {
			protocol: 'ws',
			host: HOST,
			port: PORT + 1,
		},
	},
	optimizeDeps: {
		force: true,
	},
	plugins: [pugVite()],
});
