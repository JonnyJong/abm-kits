import fs from 'node:fs';
import path from 'node:path';

/**
 * 将相对路径转换为绝对路径
 * @description
 * 从 `docs` 目录开始
 */
export function here(...paths: string[]): string {
	return path.join(__dirname, '..', ...paths);
}

/** 将相对路径转换为绝对输出路径 */
export function out(...paths: string[]): string {
	return path.join(__dirname, '../../../docs/abm-kits', ...paths);
}

const PATTERN_SEP = /[\\/]+/g;
/** 检查路径是否应忽略 */
export function isIgnore(filepath: string): boolean {
	if (path.isAbsolute(filepath)) {
		filepath = path.relative(here(), filepath);
		if (path.isAbsolute(filepath)) return true;
		if (filepath.startsWith('..')) return true;
	}
	const paths = filepath.split(PATTERN_SEP);
	return paths.some((v) => v[0] === '_');
}

export function* iterFiles(root: string): Generator<string> {
	if (!path.isAbsolute(root)) root = here(root);
	const queue: string[] = [root];
	while (true) {
		const dir = queue.pop();
		if (!dir) return;
		for (const dirent of fs.readdirSync(dir, { withFileTypes: true })) {
			if (dirent.name[0] === '_') continue;
			const pathname = path.join(dir, dirent.name);
			if (dirent.isDirectory()) {
				queue.push(pathname);
				continue;
			}
			if (!dirent.isFile()) continue;
			yield path.relative(root, pathname);
		}
	}
}

export function writeFile(filepath: string, data: string) {
	if (!path.isAbsolute(filepath)) filepath = out(filepath);
	const dir = path.join(filepath, '..');
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
	fs.writeFileSync(filepath, data, 'utf8');
}

export function copyFile(from: string, to: string) {
	if (!path.isAbsolute(from)) from = here(from);
	if (!path.isAbsolute(to)) to = out(to);
	const dir = path.join(to, '..');
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
	fs.copyFileSync(from, to);
}
