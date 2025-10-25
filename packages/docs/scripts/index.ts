import LiveServer from 'live-server';
import { buildDemo, stopBuildDemo } from './build/demo';
import { buildDeps, stopBuildDeps } from './build/deps';
import { buildMain, stopBuildMain } from './build/main';
import { out } from './fs';
import { Logger } from './logger';
import { PugRenderer } from './render/pug';

const watchMode = process.argv.includes('-w');

const logger = new Logger('main');

async function shutdown() {
	await Promise.all([
		stopBuildDemo(),
		stopBuildMain(),
		stopBuildDeps(),
		PugRenderer.destroyAll(),
	]);
}

async function main() {
	Logger.stopWhenError = !watchMode;
	await Promise.all([buildMain(), buildDemo(), buildDeps()]);
	if (!watchMode) {
		await shutdown();
		return;
	}
	LiveServer.start({
		port: 5500,
		root: out('..'),
		logLevel: 0,
		open: false,
		file: '/abm-kits/404.html',
	});
	logger.log('Ready on http://localhost:5500/abm-kits');
	process.once('SIGINT', async () => {
		logger.log('Shutting down...');
		LiveServer.shutdown();
		await shutdown();
		process.exit(0);
	});
}

main();
