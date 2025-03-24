import { customElement, property } from 'lit/decorators.js';
import { LocaleOptions, LocaleProvider } from '../../locale';
import { Widget } from './base';

export interface WidgetLangProp<Options extends LocaleOptions = LocaleOptions> {
	/** 命名空间 */
	namespace?: string;
	/** 本地化键名 */
	key?: string;
	/** 本地化参数 */
	options?: Options;
}

/** 本地化组件 */
@customElement('w-lang')
export class WidgetLang<
	Options extends LocaleOptions = LocaleOptions,
> extends Widget<WidgetLangProp<Options>> {
	#initialized = false;
	#locale = new LocaleProvider<Options>();
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
		return this.#locale.namespace;
	}
	set namespace(value) {
		this.#initialized = true;
		this.#locale.namespace = value;
	}
	/** 本地化键名 */
	@property({ type: String })
	get key() {
		return this.#locale.key;
	}
	set key(value) {
		this.#initialized = true;
		this.#locale.key = value;
	}
	/** 本地化参数 */
	get options() {
		return this.#locale.options;
	}
	set options(value) {
		this.#initialized = true;
		this.#locale.options = value;
	}
	cloneNode(deep?: boolean): WidgetLang<Options> {
		const node = super.cloneNode(deep) as WidgetLang<Options>;
		node.options = this.options;
		node.namespace = this.namespace;
		node.key = this.key;
		return node;
	}
}
