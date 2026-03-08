import { TwoKeyMap } from 'abm-utils';
import type { Article } from 'ezal';
import { Logger } from 'ezal';
import type { Language } from '../../locale';
import { getLanguages } from '../../locale';
import { Pagefind } from '../../pagefind';
import { FallbackPage } from './fallback-page';
import type { PagePath } from './path';

const logger = new Logger('doc');

/**
 * 页面管理器
 * @description 管理源页面和回退页面的存储和操作
 */
export class PageManager {
	private sourcePages = new TwoKeyMap<PagePath, Language, Article>();
	private fallbackPages = new TwoKeyMap<PagePath, Language, FallbackPage>();
	private allowResolve = false;

	/**
	 * 启用页面解析
	 */
	enableResolve(): void {
		this.allowResolve = true;
		for (const [path, variants] of [...this.sourcePages.entries()]) {
			// Remove empty
			if (variants.size === 0) {
				this.sourcePages.deleteInnerMap(path);
				continue;
			}
			// Check & Create
			const fallback = this.getFallbackPage(path);
			for (const lang of getLanguages()) {
				if (variants.has(lang)) continue;
				this.createFallbackPage(path, lang, fallback);
			}
		}
	}

	/**
	 * 获取指定路径的回退页面
	 * @param path 页面路径
	 * @returns 回退页面
	 */
	getFallbackPage(path: PagePath): Article {
		const map = this.sourcePages.getInnerMap(path);
		for (const lang of getLanguages()) {
			const page = map?.get(lang);
			if (page) return page;
		}
		throw logger.fatal(`Could not found fallback doc of "${path}"`);
	}

	/**
	 * 创建回退页面
	 * @param path 页面路径
	 * @param language 语言
	 * @param fallback 回退的原始页面
	 */
	createFallbackPage(
		path: PagePath,
		language: Language,
		fallback: Article,
	): void {
		const page = new FallbackPage(path, language, fallback);
		this.fallbackPages.set(path, language, page);
		Pagefind.add(language, page, false);
	}

	/**
	 * 获取源页面映射
	 * @returns 源页面映射
	 */
	getSourcePages(): TwoKeyMap<PagePath, Language, Article> {
		return this.sourcePages;
	}

	/**
	 * 获取回退页面映射
	 * @returns 回退页面映射
	 */
	getFallbackPages(): TwoKeyMap<PagePath, Language, FallbackPage> {
		return this.fallbackPages;
	}

	/**
	 * 检查是否允许解析
	 * @returns 是否允许解析
	 */
	isAllowResolve(): boolean {
		return this.allowResolve;
	}

	/**
	 * 构建 Index
	 */
	async buildIndex() {
		for (const [lang, page] of this.sourcePages.innerEntries()) {
			await Pagefind.add(lang, page, true);
		}
		for (const [lang, page] of this.fallbackPages.innerEntries()) {
			await Pagefind.add(lang, page, true);
		}
		await Pagefind.build();
	}
}

// 导出单例实例
export const pageManager = new PageManager();

/**
 * 启用页面解析
 */
export function enableResolve(): void {
	pageManager.enableResolve();
}
