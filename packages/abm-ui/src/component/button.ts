import { RepeatingTriggerController } from 'abm-utils';
import { defineElement, property } from '../infra/decorator';
import type { ElementProps } from '../infra/dom';
import { $slot } from '../infra/dom';
import { register } from '../infra/registry';
import { css } from '../infra/style';
import type { Navigable } from '../navigate';
import { state } from '../state';
import { type AriaConfig, Component } from './base';

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-btn': Button;
	}
}

declare module '../infra/registry' {
	interface Registry {
		button: Button;
	}
}

export interface ButtonProp extends ElementProps<Button> {}
export interface ButtonEventMap {
	/** 按钮触发事件 */
	active: [element: Button];
}

/**
 * 按钮变体
 * @description
 * - ` `：默认，线框样式
 * - `primary`：主要样式
 * - `secondary`：次要样式
 * - `danger`：危险样式
 * - `critical`：严重危险样式
 */
export type ButtonVariant =
	| ''
	| 'primary'
	| 'secondary'
	| 'danger'
	| 'critical';

/**
 * 按钮
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/button)
 */
@register('button')
@defineElement('abm-btn')
export class Button
	extends Component<ButtonProp, ButtonEventMap>
	implements Navigable
{
	protected static hoverable = true;
	protected static navigable = true;
	protected static style = css`
		:host {
			vertical-align: middle;
			display: inline-flex;
			flex-wrap: wrap;
			align-content: center;
			justify-content: center;
			align-items: center;
			gap: .25em;
			line-height: 1;
			padding: .6em;
			background: var(--ui-bg);
			border: 1px solid var(--ui-border);
			border-radius: var(--border-radius);
			transition: .1s;
			transition-property: background, border-color;
		}
		:host([variant="primary"]) {
			color: var(--primary-fg);
			--ui-bg: var(--primary-bg);
			--ui-bg-hover: var(--primary-bg-hover);
			--ui-bg-active: var(--primary-bg-active);
			--ui-border: var(--primary-border);
			--ui-border-hover: var(--primary-border-hover);
			--ui-border-active: var(--primary-border-active);
		}
		:host([variant="secondary"]) {
			color: var(--secondary-fg);
			--ui-bg: var(--secondary-bg);
			--ui-bg-hover: var(--secondary-bg-hover);
			--ui-bg-active: var(--secondary-bg-active);
			--ui-border: var(--secondary-border);
			--ui-border-hover: var(--secondary-border-hover);
			--ui-border-active: var(--secondary-border-active);
		}
		:host([variant="danger"]) {
			color: var(--danger-fg);
			--ui-bg: var(--danger-bg);
			--ui-bg-hover: var(--danger-bg-hover);
			--ui-bg-active: var(--danger-bg-active);
			--ui-border: var(--danger-border);
			--ui-border-hover: var(--danger-border-hover);
			--ui-border-active: var(--danger-border-active);
		}
		:host([variant="critical"]) {
			color: var(--critical-fg);
			--ui-bg: var(--critical-bg);
			--ui-bg-hover: var(--critical-bg-hover);
			--ui-bg-active: var(--critical-bg-active);
			--ui-border: var(--critical-border);
			--ui-border-hover: var(--critical-border-hover);
			--ui-border-active: var(--critical-border-active);
		}
		:host([flat]) {
			background: #0000;
			--ui-border: transparent;
			--ui-border-hover: transparent;
			--ui-border-active: transparent;
		}
		:host([rounded]) { border-radius: 100vmax }
		:host([hover]:not([disabled])) {
			background: var(--ui-bg-hover);
			border-color: var(--ui-border-hover);
		}
		:host([active]:not([disabled])) {
			background: var(--ui-bg-active);
			border-color: var(--ui-border-active);
		}
		:host([disabled]) {
			opacity: .75;
		}
	`;
	protected static aria: AriaConfig = { role: 'button' };
	#repeatController = new RepeatingTriggerController(() =>
		this.emit('active', this),
	);
	constructor(_props?: ButtonProp) {
		super();
		this.attachShadow({}, $slot());
		state.active.on(this, this.#activeHandler);
	}
	#activeHandler(active: boolean, cancel: boolean) {
		if (this.#disabled) return;
		if (this.#repeat) {
			if (active) this.#repeatController.start();
			else this.#repeatController.stop();
			return;
		}
		if (active || cancel) return;
		this.emit('active', this);
	}
	/**
	 * 按钮变体
	 * @description
	 * - ` `：默认，线框
	 * - `solid`：实心
	 * - `flat`：扁平
	 */
	@property({
		reflect: true,
		filter: ['', 'primary', 'secondary', 'danger', 'critical'],
	})
	accessor variant: ButtonVariant = '';
	/** 扁平 */
	@property({ reflect: true, toValue: Boolean })
	accessor flat = false;
	/** 圆形 */
	@property({ reflect: true, toValue: Boolean })
	accessor rounded = false;
	#repeat = false;
	/** 重复触发 */
	@property({ toValue: Boolean })
	get repeat() {
		return this.#repeat;
	}
	set repeat(value) {
		this.#repeat = !!value;
		if (this.#repeat) return;
		this.#repeatController.stop();
	}
	#disabled = false;
	/** 禁用按钮 */
	@property({ reflect: true, toValue: Boolean })
	get disabled() {
		return this.#disabled;
	}
	set disabled(value) {
		value = !!value;
		if (value === this.#disabled) return;
		this.#disabled = value;
		this.updateAria({ disabled: value });
		if (this.#disabled) return;
		this.#repeatController.stop();
	}
	protected clone(from: this): void {
		this.variant = from.variant;
		this.flat = from.flat;
		this.rounded = from.rounded;
		this.repeat = from.repeat;
		this.disabled = from.disabled;
	}
}
