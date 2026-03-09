import { clamp } from 'abm-utils';
import { defineElement, property } from '../infra/decorator';
import type { ElementProps } from '../infra/dom';
import { $svg } from '../infra/dom';
import { register } from '../infra/registry';
import { css } from '../infra/style';
import { type AriaConfig, Component } from './base';

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-spinner': Spinner;
	}
}

declare module '../infra/registry' {
	interface Registry {
		spinner: Spinner;
	}
}

export interface SpinnerProp extends ElementProps<Spinner> {}

/**
 * 转盘
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/spinner)
 */
@register('spinner')
@defineElement('abm-spinner')
export class Spinner extends Component<SpinnerProp> {
	protected static style = css`
		:host {
			--size: 14px;
			display: inline-block;
			width: var(--size);
			height: var(--size);
			vertical-align: middle;
		}
		svg {
			display: block;
			width: 100%;
			height: 100%;
			rotate: -90deg;
		}
		circle {
			transition: .3s stroke-dasharray, .2s stroke;
			fill: none;
			stroke: currentColor;
			stroke-width: 3;
			stroke-linecap: round;
			stroke-dasharray: var(--progress), 38;
		}
		.track {
			stroke: var(--ui-bg);
			stroke-dasharray: none;
		}
		@keyframes rotate {
			100% { rotate: 270deg }
		}
		.loading { animation: rotate 1s linear infinite }
		.loading .thumb { stroke-dasharray: 0, 4.7 }
		.loading .track { opacity: 0 }
	`;
	protected static aria: AriaConfig = { role: 'progressbar', valueText: 'NaN' };
	#svg = $svg('svg');
	constructor(_props?: SpinnerProp) {
		super();
		this.#svg.classList.add('loading');
		this.#svg.setAttribute('viewBox', '-8 -8 16 16');
		this.#svg.innerHTML =
			'<circle class="track" r="6"/><circle class="thumb" r="6"/>';
		this.attachShadow({}, this.#svg);
	}
	#value = NaN;
	/**
	 * 进度值
	 * @description
	 * - 0 ~ 100：实际进度
	 * - NaN：不确定状态
	 */
	@property({
		toValue: (value: string | null) => (value ? parseFloat(value) : NaN),
	})
	get value() {
		return this.#value;
	}
	set value(value) {
		this.#value = clamp(0, value, 100);
		this.#svg.classList.toggle('loading', Number.isNaN(this.#value));
		this.#svg.style.setProperty('--progress', String(this.#value * 0.38));
		this.ariaValueText = String(this.#value);
	}
	#size = 14;
	/** 大小 */
	@property({ toValue: Number })
	get size() {
		return this.#size;
	}
	set size(value) {
		this.#size = value;
		this.style.setProperty('--size', `${value}px`);
	}
	protected clone(from: this): void {
		this.value = from.value;
		this.size = from.size;
	}
}
