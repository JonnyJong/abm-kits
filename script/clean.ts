import { glob, rm } from 'node:fs/promises';

const PATTERNS: string[] = [
	'packages/abm-utils/dist',
	'packages/abm-ui/component',
	'packages/abm-ui/infra',
	'packages/abm-ui/input',
	'packages/abm-ui/navigate',
	'packages/abm-ui/prefab',
	'packages/abm-ui/state',
	'packages/abm-ui/widget',
	'packages/abm-ui/*.js',
	'packages/abm-ui/*.js.map',
	'packages/abm-ui/*.d.ts',
	'packages/abm-ui/index.css',
	'packages/docs-theme/dist',
	'packages/docs/dist',
];

async function main() {
	for await (const filepath of glob(PATTERNS)) {
		console.log(`Removing: ${filepath}`);
		await rm(filepath, { force: true, recursive: true });
	}
}

main();
