import type { Language } from '../../locale';
import { pageManager } from './page-manager';
import { parseNavPath } from './path';

/** 文档导航项 */
export interface DocsNav {
	id: string;
	order?: number;
	title: string;
	url: string;
	children: DocsNav[];
}

function compareNav(a: DocsNav, b: DocsNav): number {
	const aHasOrder = a.order !== undefined;
	const bHasOrder = b.order !== undefined;
	if (aHasOrder !== bHasOrder) return aHasOrder ? -1 : 1;
	if (aHasOrder && bHasOrder && a.order !== b.order) return a.order! - b.order!;
	if (a.id === b.id) return 0;
	return a.id < b.id ? -1 : 1;
}

function sortNavRecursively(nav: DocsNav[]): void {
	nav.sort(compareNav);
	for (const item of nav) {
		if (item.children.length > 0) sortNavRecursively(item.children);
	}
}

export function getDocsNav(lang: Language): DocsNav[] {
	const nav: DocsNav[] = [];
	const getItem = (path: string[]): DocsNav => {
		let item: DocsNav;
		let current = nav;
		for (const id of path) {
			let next = current.find((item) => item.id === id);
			if (!next) {
				next = { id, title: '', url: '/', children: [] };
				current.push(next);
			}
			item = next;
			current = item.children;
		}
		return item!;
	};
	for (const [path, pages] of pageManager.getSourcePages()) {
		if (path === '/index.md') continue;
		const navPath = parseNavPath(path);
		const item = getItem(navPath);
		const page =
			pages.get(lang) ?? pageManager.getFallbackPages().get(path, lang)!;
		item.title = page.title;
		item.url = page.url;
		item.order = page.data?.order;
	}
	sortNavRecursively(nav);
	return nav;
}
