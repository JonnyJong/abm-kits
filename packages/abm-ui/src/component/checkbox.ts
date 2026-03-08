import { toType } from 'abm-utils';
import { defineElement, property } from '../infra/decorator';
import type { ElementProps } from '../infra/dom';
import { $svg } from '../infra/dom';
import { css } from '../infra/style';
import { state } from '../state';
import type { AriaConfig } from './base';
import { FormControl } from './form';

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-checkbox': Checkbox;
	}
}

export interface CheckboxProp extends ElementProps<Checkbox> {}

/**
 * 复选框
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form/checkbox)
 */
@defineElement('abm-checkbox')
export class Checkbox extends FormControl<boolean, CheckboxProp> {
	protected static navigable = true;
	protected static hoverable = true;
	protected static style = css`
		:host {
			display: inline-block;
			--size: 24px;
			width: var(--size);
			height: var(--size);
			background: var(--ui-bg);
			border: 1px solid var(--ui-border);
			border-radius: var(--border-radius);
			transition: .1s;
			transition-property: background, border-color;
		}
		svg {
			width: 100%;
			height: 100%;
			padding: 2px;
			fill: none;
			transition: .1s stroke-dashoffset;
			stroke: var(--primary-fg);
			stroke-linecap: round;
			stroke-linejoin: round;
			stroke-dasharray: 15;
			stroke-dashoffset: 15;
		}
		path { transition: .1s d }
		:host([hover]:not([disabled])) {
			background: var(--ui-bg-hover);
			border-color: var(--ui-border-hover);
		}
		:host([active]:not([disabled])) {
			background: var(--ui-bg-active);
			border-color: var(--ui-border-active);
		}
		:host([checked]), :host([indeterminate]) {
			--ui-bg: var(--primary-bg);
			--ui-bg-hover: var(--primary-bg-hover);
			--ui-bg-active: var(--primary-bg-active);
			--ui-border: var(--primary-border);
			--ui-border-hover: var(--primary-border-hover);
			--ui-border-active: var(--primary-border-active);
		}
		:host([invalid]) {
			--ui-bg: var(--danger-bg);
			--ui-bg-hover: var(--danger-bg-hover);
			--ui-bg-active: var(--danger-bg-active);
			--ui-border: var(--danger-border);
			--ui-border-hover: var(--danger-border-hover);
			--ui-border-active: var(--danger-border-active);
		}
		:host([invalid][checked]), :host([invalid][indeterminate]) {
			--ui-bg: var(--critical-bg);
			--ui-bg-hover: var(--critical-bg-hover);
			--ui-bg-active: var(--critical-bg-active);
			--ui-border: var(--critical-border);
			--ui-border-hover: var(--critical-border-hover);
			--ui-border-active: var(--critical-border-active);
		}
		:host([checked]) svg { stroke-dashoffset: 0 }
		:host([indeterminate]) path {
			stroke-dashoffset: 0;
			d: path('M 0.99038251,4.5 4.0129808,4.5 11.009617,4.5');
		}
		:host([disabled]) {
			opacity: .75;
		}
	`;
	protected static aria: AriaConfig = { role: 'checkbox' };
	constructor(_props?: CheckboxProp) {
		super();
		this.attachShadow(
			{},
			$svg(
				'svg',
				{ attr: { width: 12, height: 9, viewBox: '0 0 12 9' } },
				$svg('path', {
					attr: {
						d: 'M 0.99038251,4.9854434 4.0129808,8.0145144 11.009617,0.98551681',
					},
				}),
			),
		);
		state.active.on(this, this.#activeHandler);
	}
	#activeHandler(active: boolean, cancel: boolean) {
		if (this.disabled || active || cancel) return;
		this.checked = !this.checked;
		this.indeterminate = false;
		this.emit('change', this.checked);
	}
	#updateCheckedAria() {
		this.updateAria({ checked: this.#indeterminate ? 'mixed' : this.#checked });
	}
	@property({ toValue: Boolean })
	@toType(Boolean)
	accessor default = false;
	#checked = false;
	@property({ reflect: true, toValue: Boolean })
	@toType(Boolean)
	get checked() {
		return this.#checked;
	}
	set checked(value) {
		this.#checked = value;
		this.#updateCheckedAria();
	}
	@toType(Boolean)
	get value() {
		return this.#checked;
	}
	set value(value) {
		this.checked = value;
	}
	#indeterminate = false;
	/** 中间状态 */
	@property({ reflect: true, toValue: Boolean })
	@toType(Boolean)
	get indeterminate() {
		return this.#indeterminate;
	}
	set indeterminate(value) {
		this.#indeterminate = value;
		this.#updateCheckedAria();
	}
	protected clone(from: this): void {
		super.clone(from);
		this.indeterminate = from.indeterminate;
	}
}
