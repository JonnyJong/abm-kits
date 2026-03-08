import { getConfig } from 'ezal';
import type { Language } from '../../locale';

/**
 * 页面路径
 * @description
 * 不包含语言部分
 * @example '/component/button/'
 */
export type PagePath = string;

/**
 * 解析页面路径，提取路径和语言信息
 */
export function parsePagePath(page: { src: string }): [PagePath, Language] {
	const root = getConfig().source.article;
	let path = page.src.replaceAll('\\', '/');
	if (root) path = path.slice(path.indexOf(root) + root.length);
	if (path[0] === '/') path = path.slice(1);
	let index = path.indexOf('/');
	const dotIndex = path.indexOf('.');
	if (index === -1 || dotIndex < index) index = dotIndex;
	return [path.slice(index), path.slice(0, index) as Language];
}

/**
 * 解析导航路径，将文件路径转换为导航路径数组
 */
export function parseNavPath(path: string): string[] {
	if (path.endsWith('/index.md')) path = path.slice(0, -9);
	else if (path.endsWith('.md')) path = path.slice(0, -3);
	if (path[0] === '/') path = path.slice(1);
	return path.split('/');
}
