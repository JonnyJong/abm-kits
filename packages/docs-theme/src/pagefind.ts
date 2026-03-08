import {
	getMode,
	Logger,
	type Page,
	type PromiseOr,
	VirtualAssets,
} from 'ezal';
import type { RouteContent } from 'ezal/dist/route';
import type * as pagefind from 'pagefind';
import type { Language } from './locale';
import type { FallbackPage } from './page/doc/fallback-page';

const logger = new Logger('pagefind');

class PagefindAsset extends VirtualAssets {
	buffer: Buffer;
	constructor(url: string, buffer: Buffer) {
		super(url);
		this.buffer = buffer;
	}
	build(): PromiseOr<RouteContent> {
		return this.buffer;
	}
	protected onDependenciesChanged() {}
}

function toBuffer(uint8: Uint8Array): Buffer {
	return Buffer.from(uint8.buffer, uint8.byteOffset, uint8.byteLength);
}

const indexes = new Map<Language, Pagefind>();

export class Pagefind {
	#index!: pagefind.PagefindIndex;
	#lang: Language;
	#files = new Map<string, PagefindAsset>();
	constructor(lang: Language) {
		this.#lang = lang;
	}
	/** 初始化索引 */
	async init() {
		if (this.#index) return;
		const pagefind = await import('pagefind');
		const response = await pagefind.createIndex();
		if (!response.index) throw response.errors;
		this.#index = response.index;
	}
	/** 添加页面 */
	async add(page: Page | FallbackPage): Promise<string[]> {
		if (!this.#index) return ['Not initialized'];
		const { errors } = await this.#index.addCustomRecord({
			url: page.url,
			content: page.content ?? page.markdownContent ?? '',
			language: this.#lang,
			meta: { title: page.title },
		});
		if (errors.length > 0) logger.error(errors);
		return errors;
	}
	/** 构建所有资源 */
	async build(): Promise<string[]> {
		if (!this.#index) return ['Not initialized'];
		const { errors, files } = await this.#index.getFiles();
		if (errors.length > 0) {
			logger.error(errors);
			return errors;
		}
		const old = new Set(this.#files.keys());
		for (const { path, content } of files) {
			old.delete(path);
			const buffer = toBuffer(content);
			const asset = this.#files.get(path);
			if (!asset) {
				this.#files.set(path, new PagefindAsset(`${this.#lang}/${path}`, buffer));
				continue;
			}
			asset.buffer = buffer;
			asset.invalidated();
		}
		return [];
	}
	/**
	 * 添加页面
	 * @param lang 语言
	 * @param page 页面
	 * @param built 页面构建完成
	 * @description
	 * 在构建模式下，`built` 为 `true` 时才添加页面；
	 * 预览模式下，`built` 为 `true` 时不添加页面。
	 */
	static async add(
		lang: Language,
		page: Page | FallbackPage,
		built: boolean,
	): Promise<string[]> {
		if ((getMode() === 'build') !== built) return [];
		let index = indexes.get(lang);
		if (!index) {
			index = new Pagefind(lang);
			indexes.set(lang, index);
			await index.init();
		}
		const errors = await index.add(page);
		if (getMode() === 'serve') errors.push(...(await index.build()));
		return errors;
	}
	static async build(): Promise<void> {
		if (getMode() === 'serve') return;
		const errors = await Promise.all(
			indexes.values().map((index) => index.build()),
		).then((e) => e.flat(1));
		if (errors.length > 0) logger.fatal(errors);
	}
}
