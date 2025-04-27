const { rm } = require('node:fs/promises');
const path = require('node:path');

const PATHS = [
	'cache',
	'packages/abm-utils/browser',
	'packages/abm-utils/dist',
	'packages/abm-ui/dist',
	'packages/scc/dist',
	'packages/icons/node',
];

async function clean() {
	console.log('Cleaning...');
	for (const PATH of PATHS) {
		const target = path.join(__dirname, '..', PATH);
		console.log(target);
		await rm(target, { recursive: true, force: true });
	}
}

clean();
