import { Signal } from '@lit-labs/signals';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
	DEFAULTS_ICONS_NAMES,
	UIDefaultsIcons,
	configs,
} from '../../../configs';
import { Widget } from '../base';

export interface WidgetIconProp {
	/** 命名空间 */
	namespace?: string;
	/** 图标名 */
	key?: string;
	keyUI?: UIDefaultsIcons;
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
	#keyUI: undefined | UIDefaultsIcons = undefined;
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
		this.addController({
			hostConnected: this.#updateStyleSheet,
			hostUpdated: this.#updateStyleSheet,
		});
	}
	connectedCallback(): void {
		super.connectedCallback();

		if (this.#initialized) return;
		this.#updateKey();
	}
	#updateKey(value = this.textContent ?? '') {
		this.#initialized = true;

		const i = value.indexOf(':');
		if (i !== -1) {
			this.#namespace = value.slice(0, i);
		}
		this.#key = value.slice(i + 1);
	}
	/** 命名空间 */
	@property({ type: String })
	get namespace() {
		if (!this.#initialized) this.#updateKey();
		return this.#namespace;
	}
	set namespace(value: string) {
		this.#initialized = true;
		this.#namespace = value;
	}
	/** 图标名 */
	@property({ type: String })
	get key() {
		if (!this.#initialized) this.#updateKey();
		return this.#key;
	}
	set key(value: string) {
		this.#updateKey(value);
	}
	@property({ type: String, attribute: 'key-ui' })
	get keyUI() {
		return this.#keyUI;
	}
	set keyUI(value) {
		if (!DEFAULTS_ICONS_NAMES.includes(value!)) value = undefined;
		if (this.#keyUI === value) return;
		if (this.#keyUI)
			configs.icon.offDefaultChange(this.#keyUI, this.#defaultChangeHandler);
		this.#keyUI = value;
		if (this.#keyUI)
			configs.icon.onDefaultChange(this.#keyUI, this.#defaultChangeHandler);
		this.#defaultChangeHandler();
	}
	#defaultChangeHandler = () => {
		if (!this.#keyUI) return;
		this.#namespace = configs.icon.defaultNamespace;
		this.#key = configs.icon.defaults[this.#keyUI];
	};
	protected render() {
		return html`<div class="${this.namespace} ${this.namespace}-${this.key}"></div>`;
	}
	cloneNode(deep?: boolean): WidgetIcon {
		const node = this.cloneNode(deep) as WidgetIcon;
		if (!this.#initialized) this.#updateKey();
		node.namespace = this.#namespace;
		node.key = this.#key;
		return node;
	}
}
