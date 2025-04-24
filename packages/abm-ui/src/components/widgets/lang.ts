import { LocaleParams } from 'abm-utils';
import { customElement, property } from 'lit/decorators.js';
import { LocaleProvider } from '../../locale';
import { Widget } from './base';

export interface WidgetLangProp<Params extends LocaleParams = LocaleParams> {
	/** 命名空间 */
	namespace?: string;
	/** 本地化键名 */
	key?: string;
	/** 本地化参数 */
	params?: Params;
}

/** 本地化组件 */
@customElement('w-lang')
export class WidgetLang<
	Params extends LocaleParams = LocaleParams,
> extends Widget<WidgetLangProp<Params>> {
	#initialized = false;
	#locale = new LocaleProvider<Params>();
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
	get params() {
		return this.#locale.params;
	}
	set params(value) {
		this.#initialized = true;
		this.#locale.params = value;
	}
	cloneNode(deep?: boolean): WidgetLang<Params> {
		const node = super.cloneNode(deep) as WidgetLang<Params>;
		node.params = this.params;
		node.namespace = this.namespace;
		node.key = this.key;
		return node;
	}
}
