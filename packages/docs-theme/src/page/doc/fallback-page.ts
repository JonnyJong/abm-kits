import type { Article } from 'ezal';
import { getConfig, URL, VirtualPage } from 'ezal';
import type { DependencyUpdateInfo } from 'ezal/dist/items/dependent';
import type { Language } from '../../locale';
import type { PagePath } from './path';

/**
 * 回退页面类
 * @description 当某语言版本的页面不存在时，使用其他语言版本的页面作为回退
 */
export class FallbackPage extends VirtualPage {
	#fallback: Article;
	#language: Language;
	/**
	 * 创建回退页面实例
	 * @param path 页面路径
	 * @param lang 语言
	 * @param fallback 回退的原始页面
	 */
	constructor(path: PagePath, lang: Language, fallback: Article) {
		const root = getConfig().source.article;
		const src = URL.join(root, lang) + path;
		super({
			id: src,
			src,
			layout: fallback.layout,
			dependencies: [fallback.src],
		});
		this.#language = lang;
		this.#fallback = fallback;
	}
	/** 获取页面标题 */
	get title() {
		return this.#fallback.title;
	}
	/** 获取页面描述 */
	get description() {
		return this.#fallback.description;
	}
	/** 获取页面关键词 */
	get keywords() {
		return this.#fallback.keywords;
	}
	/** 获取页面数据 */
	get data() {
		return this.#fallback.data!;
	}
	/** 获取页面内容 */
	get content() {
		return this.#fallback.content;
	}
	/** 获取页面内容（Markdown） */
	get markdownContent() {
		return this.#fallback.markdownContent;
	}
	/** 获取页面语言 */
	get language() {
		return this.#language;
	}
	/** 获取回退的原始页面 */
	get fallback() {
		return this.#fallback;
	}
	/**
	 * 更新回退的原始页面
	 * @param fallback 新的回退页面
	 */
	updateFallback(fallback: Article): void {
		this.layout = fallback.layout;
		this.customDependencies = [fallback.src];
		this.#fallback = fallback;
		this.invalidated();
	}
	/**
	 * 处理依赖项变化
	 * @param updates 依赖项更新信息
	 */
	protected onDependenciesChanged(updates: DependencyUpdateInfo[]): void {
		if (updates.find(([filepath]) => filepath === this.customDependencies[0])) {
			this.layout = this.#fallback.layout;
		}
		super.onDependenciesChanged(updates);
	}
}
