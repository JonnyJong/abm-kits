import { Signal } from '@lit-labs/signals';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { configs } from '../../../configs';
import { Widget } from '../base';

export interface WidgetIconProp {
	/** 命名空间 */
	namespace?: string;
	/** 图标名 */
	key?: string;
}

const styles = new CSSStyleSheet();
styles.insertRule(`
	:host {
		display: inline-block;
	}
`);

/** 图标组件 */
@customElement('w-icon')
export class WidgetIcon extends Widget {
	#initialized = false;
	#namespace = configs.icon.defaultNamespace;
	#key = '';
	#updateStyleSheet = () => {
		if (!(this.renderRoot instanceof ShadowRoot)) return;
		this.renderRoot.adoptedStyleSheets = [styles, ...configs.icon.signal.get()];
	};
	constructor() {
		super();
		const watcher = new Signal.subtle.Watcher(() =>
			queueMicrotask(this.#updateStyleSheet),
		);
		watcher.watch(configs.icon.signal);
		// this.#updateStyleSheet();
		this.addController({
			hostConnected: this.#updateStyleSheet,
			hostUpdated: this.#updateStyleSheet,
		});
	}
	connectedCallback(): void {
		super.connectedCallback();

		if (this.#initialized) return;
		this.#initialized = true;

		if (this.textContent) this.key = this.textContent;
	}
	/** 命名空间 */
	@property({ type: String })
	get namespace() {
		return this.#namespace;
	}
	set namespace(value: string) {
		this.#initialized = true;
		this.#namespace = value;
	}
	/** 图标名 */
	@property({ type: String })
	get key() {
		return this.#key;
	}
	set key(value: string) {
		this.#initialized = true;

		const i = value.indexOf(':');
		if (i !== -1) {
			this.#namespace = value.slice(0, i);
		}
		this.#key = value.slice(i + 1);
	}
	protected render() {
		return html`<div class="${this.namespace} ${this.namespace}-${this.key}"></div>`;
	}
	cloneNode(deep?: boolean): WidgetIcon {
		const node = this.cloneNode(deep) as WidgetIcon;
		node.namespace = this.#namespace;
		node.key = this.#key;
		return node;
	}
}
