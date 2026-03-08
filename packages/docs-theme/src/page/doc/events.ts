import type { Article } from 'ezal';
import { getLanguages } from '../../locale';
import { Pagefind } from '../../pagefind';
import { pageManager } from './page-manager';
import { parsePagePath } from './path';

/**
 * 处理文档添加事件
 * @param page 新增的文档页面
 */
export function handleDocAdd(page: Article): void {
	const [path, language] = parsePagePath(page);
	pageManager.getSourcePages().set(path, language, page);
	Pagefind.add(language, page, false);
	if (!pageManager.isAllowResolve()) return;
	const existingFallbacks = pageManager.getFallbackPages().getInnerMap(path);
	// When first page of path
	if (!existingFallbacks) {
		for (const lang of getLanguages()) {
			if (lang === language) continue;
			pageManager.createFallbackPage(path, lang, page);
		}
		return;
	}
	// Delete existing fallback
	pageManager.getFallbackPages().get(path, language)!.destroy();
	pageManager.getFallbackPages().delete(path, language);
	// Update fallback
	const fallback = pageManager.getFallbackPage(path);
	if (fallback !== page) return;
	for (const page of existingFallbacks.values()) page.updateFallback(fallback);
}

/**
 * 处理文档删除事件
 * @param page 删除的文档页面
 */
export function handleDocRm(page: Article): void {
	const [path, language] = parsePagePath(page);
	pageManager.getSourcePages().delete(path, language);
	if (!pageManager.isAllowResolve()) return;
	// Delete when empty
	if (pageManager.getSourcePages().getInnerMap(path)!.size === 0) {
		pageManager.getSourcePages().deleteInnerMap(path);
		for (const page of pageManager.getFallbackPages().getInnerMap(path)!.values())
			page.destroy();
		pageManager.getFallbackPages().deleteInnerMap(path);
		return;
	}
	// Update fallback
	const fallback = pageManager.getFallbackPage(path);
	const map = pageManager.getFallbackPages().getInnerMap(path)!;
	for (const page of map.values()) {
		if (page.fallback === fallback) break;
		page.updateFallback(fallback);
	}
	// Create
	pageManager.createFallbackPage(path, language, fallback);
}
