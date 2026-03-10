import {
	type LocaleArgs,
	type LocaleKey,
	type LocaleKeyWithNoParams,
	type LocaleKeyWithParams,
	type LocaleParams,
	locale,
} from 'abm-utils';
import { defineElement } from '../infra/decorator';
import type { ElementProps } from '../infra/dom';
import { $new } from '../infra/dom';
import { register } from '../infra/registry';
import type { AriaConfig } from './base';
import { KeyedComponent } from './keyed';

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-i18n': I18n;
	}
}

declare module '../infra/registry' {
	interface Registry {
		i18n: I18n;
	}
}

export interface I18nProps extends ElementProps<I18n> {}

/**
 * 国际化
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/i18n)
 */
@register('i18n')
@defineElement('abm-i18n')
export class I18n extends KeyedComponent<string, I18nProps> {
	protected static aria: AriaConfig = { role: 'group' };
	#root = this.attachShadow();
	constructor(_props?: I18nProps) {
		super();
		locale.on('update', () => this.update());
	}
	/** 更新翻译 */
	update() {
		const raw: any[] | null = (locale.getRaw as any)(this.key, this.#args);
		if (!raw) {
			this.#root.replaceChildren(this.key);
			return;
		}
		const exists = new Set<Node>();
		const content = raw.map((item) => {
			if (!(item instanceof Node)) return String(item);
			if (exists.has(item)) return item.cloneNode(true);
			exists.add(item);
			return item;
		});
		this.#root.replaceChildren(...content);
	}
	#args: LocaleArgs = {};
	/** 翻译参数 */
	get args() {
		return this.#args;
	}
	set args(value) {
		if (typeof value !== 'object') return;
		this.#args = value;
		this.update();
	}
	protected clone(from: this): void {
		this.#args = from.#args;
		super.clone(from);
	}
}

/** 创建并返回 I18n 组件实例 */
export function t<K extends LocaleKeyWithNoParams>(key: K): I18n;
export function t<K extends LocaleKeyWithParams, A extends LocaleParams<K>>(
	key: K,
	args: A,
): I18n;
export function t<K extends LocaleKey, A extends LocaleParams<K>>(
	key: K,
	args?: A,
): I18n {
	return $new('abm-i18n', { key, args: args as LocaleArgs });
}
