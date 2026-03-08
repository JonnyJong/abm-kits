import { formatWithStep, steppedClamp, type Vec2, Vector2 } from 'abm-utils';
import { defineElement } from '../infra/decorator';
import type { ElementProps } from '../infra/dom';
import { $div } from '../infra/dom';
import { $style, css } from '../infra/style';
import { MovementController, type MovementEvent } from '../movement';
import { type Navigable, type NavState, navigate } from '../navigate/index';
import { state } from '../state';
import { tooltip } from '../widget/tooltip';
import { FormControl } from './form';

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-vec2-pad': Vec2Pad;
	}
}

export interface Vec2PadProp extends ElementProps<Vec2Pad> {}

function format(value: Vec2, step: Vec2): string {
	return `(${value.map((v, i) => formatWithStep(v, step[i])).join(', ')})`;
}

/**
 * 二维向量面板
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form/vec2-pad)
 */
@defineElement('abm-vec2-pad')
export class Vec2Pad
	extends FormControl<Vec2, Vec2PadProp>
	implements Navigable
{
	protected static hoverable = true;
	protected static activatable = true;
	protected static style = css`
		:host {
			position: relative;
			display: block;
			height: 100px;
			background: var(--ui-bg);
			border: 1px solid var(--ui-border);
			border-radius: var(--border-radius);
			transition: .1s;
			transition-property: background, border-color;
		}
		.anchor { position: absolute }
		.t { top: 0 }
		.l { left: 0 }
		.r { right: 0 }
		.b { bottom: 0 }
		.thumb {
			position: absolute;
			width: 15px;
			height: 15px;
			top: 0%;
			left: 0%;
			translate: -50% -50%;
			border: 2px solid var(--fg);
			border-radius: var(--border-radius-max);
			transition: .1s scale, .1s left, .1s top;
		}
		.move { transition: .1s scale }
		:host([hover]:not([disabled])) .thumb,
		:host(:not([disabled])) .thumb[hover] { scale: 1.1 }
		:host([active]:not([disabled])) .thumb,
		:host(:not([disabled])) .thumb[active] { scale: .9 }
	`;
	protected static aria = { role: 'group' };
	#anchorO = $div({ className: 'anchor t l' });
	#anchorX = $div({ className: 'anchor t r' });
	#anchorY = $div({ className: 'anchor b l' });
	#thumb = $div<Navigable>({
		className: 'thumb',
		part: 'thumb',
		nav: true,
		tabIndex: -1,
		tooltip: '(0, 0)',
		role: 'slider',
		ariaLabel: 'Vector 2 Pad',
		ariaValueMin: '(0, 0)',
		ariaValueMax: '(1, 1)',
		ariaValueText: '(0, 0)',
	});
	#default: Vec2 = [0, 0];
	#value: Vec2 = [0, 0];
	#start: Vec2 = [0, 0];
	#end: Vec2 = [1, 1];
	#step: Vec2 = [0, 0];
	#move: MovementController<Vec2, this>;
	constructor(_props?: Vec2PadProp) {
		super();
		this.#thumb.navParent = this;
		this.#thumb.navCallback = this.#handleNav;
		state.hover.add(this.#thumb);
		state.active.add(this.#thumb);
		this.attachShadow(
			{},
			this.#anchorO,
			this.#anchorX,
			this.#anchorY,
			this.#thumb,
		);
		this.#move = new MovementController(
			{
				value: () => this.#value,
				start: () => this.#start,
				end: () => this.#end,
				step: () => this.#step,
				penStartDelay: 0,
				touchStartDelay: 0,
			},
			{
				handler: this.#handleMove,
				axis: () => ({
					o: this.#anchorO,
					x: this.#anchorX,
					y: this.#anchorY,
				}),
				triggers: this,
			},
		);
	}
	#updateTooltip() {
		const text = this.tooltipFormatter
			? this.tooltipFormatter(this.value)
			: format(this.#value, this.step);
		tooltip.set(this.#thumb, String(text));
		this.#thumb.ariaValueText = String(text);
	}
	#handleMove = (event: MovementEvent<Vec2>) => {
		if (event.state === 'start') {
			navigate.lock(this.#thumb);
			tooltip.lock(this.#thumb);
			state.active.set(this.#thumb, true);
		}
		this.#thumb.classList.toggle(
			'move',
			event.pointer && event.state === 'moving',
		);
		this.#value = event.value;
		this.#updateView();
		this.emitUpdate(event.state === 'end');
		if (!event.end) return;
		tooltip.unlock(this.#thumb);
		navigate.unlock();
		state.active.set(this.#thumb, false);
		state.active.set(this, false);
	};
	#handleNav = (state: NavState) => {
		if (this.disabled) return;
		if (state.type === 'active') {
			if (state.down) return;
			this.#move.moving ? this.#move.stop() : this.#move.start();
			return;
		}
		if (state.type === 'cancel') return this.#move.stop(true);
		if (state.type === 'blur') return this.#move.stop();
		this.#move.handleNav(state);
	};
	#updateView() {
		const [u, v] = MovementController.value2uv(
			this.#value,
			this.#start,
			this.#end,
		);
		$style(this.#thumb, { left: `${u * 100}%`, top: `${v * 100}%` });
		this.#updateTooltip();
	}
	#fitValue() {
		this.#value[0] = steppedClamp(
			this.#start[0],
			this.#end[0],
			this.#value[0],
			this.#step[0],
		);
		this.#value[1] = steppedClamp(
			this.#start[1],
			this.#end[1],
			this.#value[1],
			this.#step[1],
		);
	}
	#updateRange() {
		this.#fitValue();
		this.#updateView();
		this.#thumb.ariaValueMin = `(${this.#start.join()})`;
		this.#thumb.ariaValueMax = `(${this.#end.join()})`;
	}
	get disabled() {
		return super.disabled;
	}
	set disabled(value) {
		super.disabled = value;
		if (super.disabled) this.#move.stop();
	}
	get default(): Vec2 {
		return [...this.#default];
	}
	set default(value) {
		if (!Vector2.isVec2(value)) return;
		this.#default = Vector2.toVec2(value);
	}
	get value(): Vec2 {
		return [...this.#value];
	}
	set value(value) {
		if (!Vector2.isVec2(value)) return;
		this.#value = Vector2.toVec2(value);
		this.#fitValue();
		this.#updateView();
	}
	/** 起始值 */
	get start(): Vec2 {
		return [...this.#start];
	}
	set start(value) {
		if (!Vector2.isVec2(value)) return;
		this.#start = Vector2.toVec2(value);
		this.#updateRange();
	}
	/** 结束值 */
	get end(): Vec2 {
		return [...this.#end];
	}
	set end(value) {
		if (!Vector2.isVec2(value)) return;
		this.#end = Vector2.toVec2(value);
		this.#updateRange();
	}
	/** 步长 */
	get step(): Vec2 {
		return [...this.#step];
	}
	set step(value) {
		if (!Vector2.isVec2(value)) return;
		this.#step = Vector2.toVec2(value);
		this.#updateRange();
	}
	/** 工具提示格式化 */
	accessor tooltipFormatter: ((value: Vec2) => string) | undefined;
	get navChildren() {
		return [this.#thumb];
	}
	protected clone(from: this): void {
		this.#start = from.start;
		this.#end = from.end;
		this.#step = from.step;
		super.clone(from);
	}
}
