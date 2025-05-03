import { Color, clamp, css, runSync } from 'abm-utils';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { Widget } from '../base';
import CSS_BAR from './bar.styl';
import CSS_RING from './ring.styl';

export interface WidgetProgressProp {
	/**
	 * 进度值
	 * @description
	 * - 0 ~ 100：实际进度
	 * - NaN：等待中
	 */
	value?: number;
	/** 颜色 */
	color?: Color;
}

/** 进度条 */
export abstract class WidgetProgress extends Widget {
	protected _value = NaN;
	/**
	 * 进度值
	 * @description
	 * - 0 ~ 100：实际进度
	 * - NaN：等待中
	 */
	@property({ type: Number })
	get value(): number {
		return this._value;
	}
	set value(value: number) {
		if (typeof value !== 'number') value = parseFloat(value);
		this._value = clamp(0, value, 100);
	}
	protected _color?: Color;
	/** 颜色 */
	@property({ type: String })
	get color(): Color | undefined {
		return this._color?.clone();
	}
	set color(value: Color | string | undefined) {
		if (value instanceof Color) {
			this._color = value.clone();
			return;
		}
		if (typeof value !== 'string') {
			this._color = undefined;
			return;
		}
		runSync(() => {
			this._color = Color.hex(value);
		});
	}
	/** 克隆进度条 */
	cloneNode(deep?: boolean): WidgetProgress {
		const node = super.cloneNode(deep) as WidgetProgress;
		node.value = this.value;
		node.color = this.color;
		return node;
	}
}

/** 条形进度条 */
@customElement('w-progress-bar')
export class WidgetProgressBar extends WidgetProgress {
	static styles = css(CSS_BAR);
	protected render() {
		return html`<div class="track" style=${styleMap({
			'--theme': this._color?.hex(),
		})}>
			<div class=${classMap({
				thumb: true,
				waiting: isNaN(this.value),
			})} style=${styleMap({
				'--progress': `${this._value}%`,
			})}></div>
		</div>`;
	}
	cloneNode(deep?: boolean): WidgetProgressBar {
		return super.cloneNode(deep) as WidgetProgressBar;
	}
}

const RING_OFFSET_BEGIN = 157;
const RING_OFFSET_SLOPE = -3.2;

/** 圆形进度条 */
@customElement('w-progress-ring')
export class WidgetProgressRing extends WidgetProgress {
	static styles = css(CSS_RING);
	#thickness = 5;
	/** 粗细 */
	@property({ type: Number })
	get thickness() {
		return this.#thickness;
	}
	set thickness(value) {
		if (isNaN(value)) return;
		this.#thickness = clamp(1, value, 24);
	}
	protected render() {
		const offset = RING_OFFSET_BEGIN + this.#thickness * RING_OFFSET_SLOPE;
		return html`<svg class=${classMap({
			track: true,
			waiting: isNaN(this.value),
		})} viewBox="25 25 50 50" style=${styleMap({
			'--thickness': this.#thickness,
			'--progress': ((100 - this._value) / 100) * offset,
			'--offset': offset,
			'--a': offset * 0.75,
			'--b': offset * -0.25,
			'--c': offset * -1,
			'--theme': this._color?.hex(),
		})}><circle class="thumb" r="20" cy="50" cx="50"></circle></svg>`;
	}
	cloneNode(deep?: boolean): WidgetProgressRing {
		const node = super.cloneNode(deep) as WidgetProgressRing;
		node.thickness = this.thickness;
		return node;
	}
}
