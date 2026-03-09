import { clamp } from 'abm-utils';
import { defineElement, property } from '../infra/decorator';
import type { ElementProps } from '../infra/dom';
import { $div } from '../infra/dom';
import { register } from '../infra/registry';
import { css } from '../infra/style';
import { type AriaConfig, Component } from './base';

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-progress': Progress;
	}
}

declare module '../infra/registry' {
	interface Registry {
		progress: Progress;
	}
}

export interface ProgressProp extends ElementProps<Progress> {}

/**
 * 进度条
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/progress)
 */
@register('progress')
@defineElement('abm-progress')
export class Progress extends Component<ProgressProp> {
	protected static style = css`
		:host {
			display: block;
			overflow: clip;
			width: 100%;
			height: 4px;
			border-radius: var(--border-radius);
			background: var(--ui-bg);
		}
		.thumb {
			position: relative;
			height: 100%;
			border-radius: var(--border-radius);
			background: currentColor;
			transition: .1s width;
		}
		@keyframes loading {
			0% { inset-inline-start: 0% }
			100% { inset-inline-start: 70% }
		}
		.loading {
			width: 30%;
			animation: loading .8s infinite alternate cubic-bezier(.5, 0, .5, 1)
		}
	`;
	protected static aria: AriaConfig = { role: 'progressbar', valueText: 'NaN' };
	#thumb = $div({ class: 'thumb loading' });
	constructor(_props?: ProgressProp) {
		super();
		this.attachShadow({}, this.#thumb);
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
	set value(value: number) {
		this.#value = clamp(0, value, 100);
		if (Number.isNaN(this.#value)) {
			this.#thumb.classList.add('loading');
			this.#thumb.style.width = '';
			return;
		}
		this.#thumb.classList.remove('loading');
		this.#thumb.style.width = `${this.#value}%`;
		this.ariaValueNow = String(this.#value);
	}
	protected clone(from: this): void {
		this.value = from.value;
	}
}
