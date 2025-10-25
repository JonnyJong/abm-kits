import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	type Stats,
	writeFileSync,
} from 'node:fs';
import path from 'node:path';
import chokidar from 'chokidar';
import stylus from 'stylus';
import uglifyCSS from 'uglifycss';

export interface StyleTask {
	root: string;
	dist: string;
	redirect?: (file: string) => string;
}

const PATTERN_CSS_SELECTOR = /(?<=^|\}|,):host([^{,>]+?)(?=\{| |,|>)/g;

function redirect(task: StyleTask, sources: string[]): string[] {
	if (!task.redirect) return sources;

	const result = new Set<string>();
	for (const source of sources) {
		result.add(task.redirect(source));
	}
	return [...result];
}

function readdir(dir: string) {
	return readdirSync(dir, { recursive: true, withFileTypes: true })
		.filter((dirent) => dirent.isFile() && path.extname(dirent.name) === '.styl')
		.map((dirent) => {
			const filepath = path.join(dirent.parentPath, dirent.name);
			return path.relative(dir, filepath);
		});
}

function writeFile(file: string, data: string) {
	const dir = path.dirname(file);
	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
	writeFileSync(file, data, 'utf8');
}

function compileStylusFile(stylusFile: string, dest: string, mod?: boolean) {
	const stylusContent = readFileSync(stylusFile, 'utf8');
	let css = stylus.render(stylusContent, {
		paths: [path.dirname(stylusFile)],
		filename: stylusFile,
	});
	css = uglifyCSS.processString(css);

	css = css.replace(PATTERN_CSS_SELECTOR, (raw, selector) => {
		if (typeof selector !== 'string') return raw;
		if (selector.startsWith('(') && selector.endsWith(')')) return raw;
		return `:host(${selector})`;
	});

	if (mod) {
		css = `export default ${JSON.stringify(`*{box-sizing:border-box;}${css}`)};`;
	}

	writeFile(dest, css);
}

function debounce<P extends unknown[] = unknown[]>(
	fn: (...args: P) => void,
	delay = 100,
): (...args: P) => void {
	let timer: NodeJS.Timeout | null = null;
	return (...args: P) => {
		if (timer !== null) clearTimeout(timer);

		timer = setTimeout(() => {
			fn(...args);
			if (timer !== null) clearTimeout(timer);
			timer = null;
		}, delay);
	};
}

function toExt(filepath: string, ext: string): string {
	const { dir, name } = path.parse(filepath);
	return path.join(dir, `${name}.${ext}`);
}

export function compileStyle(task: StyleTask, watch?: boolean) {
	if (!watch) {
		for (const file of redirect(task, readdir(task.root))) {
			compileStylusFile(
				path.join(task.root, file),
				toExt(path.join(task.dist, file), 'css'),
			);
		}
		return;
	}

	const waitQueue: string[] = [];
	let processing = false;
	const process = debounce(() => {
		if (processing) return;
		processing = true;
		while (waitQueue.length > 0) {
			const file = waitQueue.pop();
			if (!file) break;
			console.log(`Updating ${file}`);
			compileStylusFile(
				path.join(task.root, file),
				toExt(path.join(task.dist, file), 'css'),
			);
		}
		processing = false;
	}, 10);

	const watcher = chokidar.watch(task.root, { awaitWriteFinish: true });
	const handler = (file: string, stat?: Stats) => {
		if (stat && !stat?.isFile()) return;
		if (!file.endsWith('.styl')) return;
		const target = redirect(task, [path.relative(task.root, file)])[0];
		if (!waitQueue.includes(target)) waitQueue.push(target);
		if (!processing) process();
	};
	watcher.on('ready', () => {
		watcher.on('add', handler).on('change', handler);
	});
}

export function compileStyleModule(
	root: string,
	dist: string,
	watch?: boolean,
) {
	if (!watch) {
		for (const file of readdir(root)) {
			compileStylusFile(
				path.join(root, file),
				toExt(path.join(dist, file), 'styl.js'),
				true,
			);
		}
		return;
	}

	const watcher = chokidar.watch(root, { awaitWriteFinish: true });
	const handler = (file: string, stat?: Stats) => {
		if (stat && !stat?.isFile()) return;
		if (!file.endsWith('.styl')) return;
		console.log(`Updating ${file}`);
		compileStylusFile(
			file,
			toExt(path.join(dist, path.relative(root, file)), 'styl.js'),
			true,
		);
	};
	watcher.on('ready', () => {
		watcher.on('add', handler).on('change', handler);
	});
}
