import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { transform } from 'lightningcss';

async function main() {
	const target = path.join(import.meta.dirname, '../packages/abm-ui/index.css');
	const source = await readFile(target);
	const { code } = transform({
		filename: 'index.css',
		code: source,
		minify: true,
		sourceMap: false,
	});
	await writeFile(target, code, 'utf8');
}

main();
