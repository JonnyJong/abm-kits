import { toType } from 'abm-utils';
import { defineElement, property } from '../infra/decorator';
import { $div, $slot, type ElementProps } from '../infra/dom';
import { register } from '../infra/registry';
import { css } from '../infra/style';
import { state } from '../state';
import { Component } from './base';

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-collapsible': Collapsible;
	}
}

declare module '../infra/registry' {
	interface Registry {
		collapsible: Collapsible;
	}
}

export interface CollapsibleProp extends ElementProps<Collapsible> {}

export interface CollapsibleEventMap {
	expand: [];
	collapse: [];
}

/**
 * 可折叠面板
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/collapsible)
 */
@register('collapsible')
@defineElement('abm-collapsible')
export class Collapsible extends Component<
	CollapsibleProp,
	CollapsibleEventMap
> {
	protected static style = css`
		:host {
			display: block;
		}
		.head, .content { padding: 4px 8px }
		.head {
			border-radius: var(--border-radius);
			transition: .1s background;
		}
		:host(:not([disabled])) .head[hover] { background: var(--ui-bg-hover) }
		:host(:not([disabled])) .head[active] { background: var(--ui-bg-active) }
		.body {
			content-visibility: hidden;
			height: 0;
			overflow: clip;
			transition: height .3s ease, content-visibility .3s ease allow-discrete;
			interpolate-size: allow-keywords;
		}
		:host([expanded]) .body {
			content-visibility: visible;
			height: auto;
		}
	`;
	#head = $div(
		{ className: 'head', part: 'head', role: 'button', ariaExpanded: 'false' },
		$slot('head'),
	);
	#body = $div(
		{ className: 'body' },
		$div({ className: 'content', part: 'body' }, $slot()),
	);
	constructor(_props?: CollapsibleProp) {
		super();
		this.attachShadow({}, this.#head, this.#body);
		state.hover.add(this.#head);
		state.active.on(this.#head, (active, cancel) => {
			if (this.disabled || active || cancel) return;
			this.expanded = !this.expanded;
			this.emit(this.expanded ? 'expand' : 'collapse');
		});
	}
	#disabled = false;
	/** 禁用 */
	@property({ reflect: true, toValue: Boolean })
	@toType(Boolean)
	get disabled() {
		return this.#disabled;
	}
	set disabled(value) {
		this.#disabled = value;
		this.#head.ariaDisabled = String(value);
	}
	#expanded = false;
	/** 展开 */
	@property({ reflect: true, toValue: Boolean })
	@toType(Boolean)
	get expanded() {
		return this.#expanded;
	}
	set expanded(value) {
		this.#expanded = value;
		this.#head.ariaExpanded = String(value);
	}
	protected clone(from: this): void {
		this.disabled = from.disabled;
		this.expanded = from.expanded;
	}
}
