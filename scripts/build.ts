import path from 'node:path';
import { StyleTask, compileStyle, compileStyleModule } from './build-style';
import { compileTypeScript } from './build-ts';

const PKGS_ROOT = path.join(__dirname, '../packages');

interface Task {
	/** tsconfig path */
	ts?: string[];
	style?: StyleTask[];
	styleModule?: [root: string, dist: string][];
}

const BUILD_ORDER = ['utils', 'ui', 'scc', 'icons'];
const TASKS: Record<string, Task> = {
	utils: {
		ts: [
			path.join(PKGS_ROOT, 'abm-utils/tsconfig.json'),
			path.join(PKGS_ROOT, 'abm-utils/tsconfig.browser.json'),
		],
	},
	ui: {
		ts: [path.join(PKGS_ROOT, 'abm-ui/tsconfig.json')],
		style: [
			{
				root: path.join(PKGS_ROOT, 'abm-ui/src/styles'),
				dist: path.join(PKGS_ROOT, 'abm-ui/dist/styles'),
				redirect(file) {
					if (file === 'var.styl') return file;
					return 'main.styl';
				},
			},
		],
		styleModule: [
			[
				path.join(PKGS_ROOT, 'abm-ui/src/components/widgets'),
				path.join(PKGS_ROOT, 'abm-ui/dist/components/widgets'),
			],
		],
	},
	scc: {
		ts: [
			path.join(PKGS_ROOT, 'scc/tsconfig.json'),
			path.join(PKGS_ROOT, 'scc/tsconfig.browser.json'),
			path.join(PKGS_ROOT, 'scc/tsconfig.node.json'),
		],
	},
	icons: {
		ts: [path.join(PKGS_ROOT, 'icons/tsconfig.json')],
	},
};

function checkArg(argv: string[], inputs: string[]) {
	for (const arg of argv) {
		if (inputs.includes(arg)) return true;
	}
	return false;
}

function resolveArgv() {
	const i = process.argv.indexOf(__filename.slice(0, -3)) + 1;
	if (i === process.argv.length)
		return { targets: ['utils', 'ui'], watch: false };
	const inputs = process.argv.slice(i).map((v) => v.toLowerCase());
	const targets = [];
	for (const target of BUILD_ORDER) {
		if (inputs.includes(target)) targets.push(target);
	}
	if (targets.length === 0) targets.push('utils', 'ui');
	const watch = checkArg(['-w', '--watch'], inputs);
	return { targets, watch };
}

function main() {
	const { targets, watch } = resolveArgv();
	const type = watch ? 'Start watching' : 'Compiling';

	for (const target of targets) {
		console.log(`Start ${watch ? 'watching' : 'compiling'} ${target}`);

		const pkg = TASKS[target];
		for (const tsconfigPath of pkg.ts ?? []) {
			console.log(`${type} ts project: ${tsconfigPath}`);
			compileTypeScript(tsconfigPath, watch);
		}
		for (const styleTask of pkg.style ?? []) {
			console.log(`${type} styles: ${styleTask.root}`);
			compileStyle(styleTask, watch);
		}
		for (const [root, dist] of pkg.styleModule ?? []) {
			console.log(`${type} styles : ${root}`);
			compileStyleModule(root, dist, watch);
		}
	}
	console.log('Ready!');
}

main();
