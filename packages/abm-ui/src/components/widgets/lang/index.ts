import { $new, type DOMApplyOptions, type FlatLocaleParams } from 'abm-utils';
import { customElement, property } from 'lit/decorators.js';
import { LocaleProvider, type UIDefaultLocaleDict } from '../../../locale';
import { Widget } from '../base';

export interface WidgetLangProp<
	K extends keyof FlatLocaleParams<UIDefaultLocaleDict> | (string & {}) = string,
	A extends FlatLocaleParams<UIDefaultLocaleDict>[K] = Record<string, any>,
> {
	/** 命名空间 */
	namespace?: string;
	/** 本地化键名 */
	key?: string;
	/** 本地化参数 */
	params?: A;
}

/** 本地化组件 */
@customElement('w-lang')
export class WidgetLang<
	K extends keyof FlatLocaleParams<UIDefaultLocaleDict> | (string & {}) = string,
	A extends FlatLocaleParams<UIDefaultLocaleDict>[K] = Record<string, any>,
> extends Widget {
	#initialized = false;
	#locale = new LocaleProvider<K, A>();
	connectedCallback(): void {
		super.connectedCallback();

		if (this.#initialized) return;
		this.#initialized = true;

		this.#locale.key = this.textContent ?? '';
	}
	protected render() {
		return this.#locale.textSignal.get();
	}
	/** 命名空间 */
	@property({ type: String })
	get namespace() {
		if (!this.#initialized) this.#locale.key = this.textContent ?? '';
		return this.#locale.namespace;
	}
	set namespace(value) {
		this.#initialized = true;
		this.#locale.namespace = value;
	}
	/** 本地化键名 */
	@property({ type: String })
	get key() {
		if (!this.#initialized) this.#locale.key = this.textContent ?? '';
		return this.#locale.key;
	}
	set key(value) {
		this.#initialized = true;
		this.#locale.key = value;
	}
	/** 本地化参数 */
	get params() {
		return this.#locale.params;
	}
	set params(value) {
		this.#initialized = true;
		this.#locale.params = value;
	}
	cloneNode(deep?: boolean): WidgetLang<K, A> {
		const node = super.cloneNode(deep) as WidgetLang<K, A>;
		node.params = this.params;
		node.namespace = this.namespace;
		node.key = this.key;
		return node;
	}
}

/** 创建 <w-lang> 元素并应用配置 */
export function $lang<T>(
	options?: T extends HTMLElement | string ? T : DOMApplyOptions<'w-lang'>,
	...content: (HTMLElement | string)[]
): WidgetLang {
	if (typeof options === 'string' || options instanceof HTMLElement) {
		return $new({ tag: 'w-lang' }, options, ...content);
	}
	if (options && typeof options === 'object') {
		return $new({ ...options, tag: 'w-lang' }, ...content);
	}
	return $new({ tag: 'w-lang' }, ...content);
}
