import {
	$div,
	clamp,
	createClampedStepper,
	css,
	type EventBaseInit,
	type EventsList,
	EventValue,
	type EventValueInit,
	formatWithStep,
	Throttle,
} from 'abm-utils';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
	events,
	type Slidable,
	type SlideBorder,
	type UIEventSlide,
} from '../../../events';
import { type KeyboardEvents, keyboard } from '../../../keyboard';
import {
	type Navigable,
	type NavigateCallbackOptions,
	navigate,
} from '../../../navigate';
import { tooltips } from '../../tooltips';
import { Widget } from '../base';
import CSS from './index.styl';

interface WidgetRangeEventsInit {
	/** 输入事件 */
	input: EventValueInit<WidgetRange, [start: number, end: number]>;
	/** 更改事件 */
	change: EventBaseInit<WidgetRange>;
}

export interface WidgetRangeEvents extends EventsList<WidgetRangeEventsInit> {}

export interface WidgetRangeProp {
	/** 当前值 */
	value?: [number, number];
	/** 起始值 */
	start?: number;
	/** 结束值 */
	end?: number;
	/** 范围起点 */
	from?: number;
	/** 范围终点 */
	to?: number;
	/** 步长 */
	step?: number;
	/** 按钮增量 */
	incrementStep?: number;
	/** 禁用 */
	disabled?: boolean;
}

const THUMB_R = 11;
const THUMB_SIZE = THUMB_R * 2;

/** 范围滑动条 */
@customElement('w-range')
export class WidgetRange
	extends Widget<WidgetRangeEventsInit>
	implements Navigable, Slidable
{
	static styles = css(CSS);
	#clampedStepper = createClampedStepper(0, 100);
	#direction = -1;
	constructor() {
		super({ navGroup: true, eventTypes: ['input', 'change'] });

		tooltips.set(this, '0 ~ 0');

		for (const thumb of this.#thumbs) {
			events.hover.add(thumb);
			events.slide.on(thumb, this.#slideHandler);
			thumb.navParent = this;
			thumb.navCallback = (options) => this.#navCallback(thumb, options);
		}
		events.slide.on(this, this.#slideHandler);
	}
	#clampIncrementStep() {
		if (this.#step === 0) return;
		this.#incrementStep =
			Math.round(this.#incrementStep / this.#step) * this.#step;
	}
	#updateMinMaxStep() {
		if (this.#from <= this.#to) {
			this.#left = this.#from;
			this.#right = this.#to;
		} else {
			this.#left = this.#to;
			this.#right = this.#from;
		}

		this.#clampedStepper = createClampedStepper(this.#from, this.#to, this.#step);
		this.#direction = Math.sign(this.#from - this.#to);
		this.#values[0] = this.#clampedStepper(this.#values[0]);
		this.#values[1] = this.#clampedStepper(this.#values[1]);
		this.#updateView();
	}
	//#region View
	#thumbs: (HTMLElement & Navigable)[] = [
		$div({ class: 'thumb', attr: { 'ui-nav': '' } }),
		$div({ class: 'thumb', attr: { 'ui-nav': '' } }),
	];
	protected render() {
		return html`
			<div class="track"></div>
			${this.#thumbs[0]}
			${this.#thumbs[1]}
		`;
	}
	#updateView = Throttle.new(() => {
		const stroke = this.#to - this.#from;
		const offsetA = this.#values[0] - this.#from;
		const percentA = (offsetA / stroke) * 100;
		const offsetB = this.#values[1] - this.#from;
		const percentB = (offsetB / stroke) * 100;
		this.style.setProperty('--w-range-a', `${percentA}%`);
		this.style.setProperty('--w-range-b', `${percentB}%`);
		this.#updateTooltips(this.#values[0], this.#values[1]);
	});
	#updateTooltips(a: number, b: number) {
		if (Math.sign(a - b) !== this.#direction) [a, b] = [b, a];
		const startText = formatWithStep(a, this.#step);
		const endText = formatWithStep(b, this.#step);
		tooltips.set(this, `${startText} ~ ${endText}`);
	}
	//#region Properties
	/** 禁用 */
	@property({ type: Boolean, reflect: true }) accessor disabled = false;
	#values: [number, number] = [0, 0];
	/** 起始值 */
	@property({ type: Number })
	get start() {
		if (this.#direction > 0) return Math.max(...this.#values);
		return Math.min(...this.#values);
	}
	set start(value) {
		const index = this.#values.indexOf(this.start);
		if (value === this.#values[index]) return;
		this.#values[index] = this.#clampedStepper(value);
		this.#updateView();
	}
	/** 结束值 */
	@property({ type: Number })
	get end() {
		if (this.#direction > 0) return Math.min(...this.#values);
		return Math.max(...this.#values);
	}
	set end(value) {
		const index = this.#values.indexOf(this.end);
		if (value === this.#values[index]) return;
		this.#values[index] = this.#clampedStepper(value);
		this.#updateView();
	}
	/** 当前值 */
	get value(): [start: number, end: number] {
		const value: [start: number, end: number] = [...this.#values];
		if (Math.sign(value[0] - value[1]) !== this.#direction) value.reverse();
		return value;
	}
	set value(value: [start: number, end: number]) {
		let [start, end] = value;
		if (Math.sign(start - end) !== this.#direction) [end, start] = value;
		const a = this.start;
		const b = this.end;
		if (start === a && end === b) return;
		this.#values[0] = this.#clampedStepper(start);
		this.#values[1] = this.#clampedStepper(end);
		this.#updateView();
	}
	#from = 0;
	@property({ type: Number })
	get from() {
		return this.#from;
	}
	set from(value: number) {
		if (this.#from === value) return;
		this.#from = value;
		this.#updateMinMaxStep();
	}
	#to = 100;
	@property({ type: Number })
	get to() {
		return this.#to;
	}
	set to(value: number) {
		if (this.#to === value) return;
		this.#to = value;
		this.#updateMinMaxStep();
	}
	#step = 0;
	/** 步长 */
	@property({ type: Number })
	get step() {
		return this.#step;
	}
	set step(value: number) {
		if (Number.isNaN(value)) value = 0;
		value = Math.abs(value);
		if (this.#step === value) return;
		this.#step = value;
		this.#clampIncrementStep();
		this.#updateMinMaxStep();
	}
	#incrementStep = 1;
	@property({ type: Number, attribute: 'increment-step' })
	get incrementStep() {
		return this.#incrementStep;
	}
	set incrementStep(value) {
		if (!Number.isFinite(value)) return;
		if (value <= 0) return;
		this.#incrementStep = value;
		this.#clampIncrementStep();
	}
	#left = 0;
	#right = 100;
	//#region Events
	#slideTarget = -1;
	#tempValue = 0;
	#sliding = false;
	#emit(change: boolean) {
		let value: [start: number, end: number];
		if (change) value = this.value;
		else {
			value = [this.#values[1 - this.#slideTarget], this.#tempValue];
			if (Math.sign(value[0] - value[1]) !== this.#direction) value.reverse();
		}
		this.events.emit(
			new EventValue(change ? 'change' : 'input', {
				target: this,
				value,
			}),
		);
	}
	#findTarget(event: UIEventSlide) {
		this.#slideTarget = this.#thumbs.indexOf(event.target);
		if (this.#slideTarget !== -1) return;
		const { left, width } = this.getBoundingClientRect();
		const percent = (event.x - left - THUMB_R) / (width - THUMB_SIZE);
		const stroke = this.#to - this.#from;
		const offsetA = this.#values[0] - this.#from;
		const percentA = offsetA / stroke;
		const offsetB = this.#values[1] - this.#from;
		const percentB = offsetB / stroke;
		this.#slideTarget =
			Math.abs(percentA - percent) > Math.abs(percentB - percent) ? 1 : 0;
	}
	#applySlide(value: number): number {
		const { left, width } = this.getBoundingClientRect();
		const percent = clamp(0, (value - left - THUMB_R) / (width - THUMB_SIZE), 1);
		this.#tempValue = this.#clampedStepper(
			percent * (this.#to - this.#from) + this.#from,
		);

		return percent;
	}
	#applyDigitalSlide(value: number): number {
		this.#tempValue = this.#clampedStepper(value);
		const stroke = this.#to - this.#from;
		const offset = this.#tempValue - this.#from;
		return offset / stroke;
	}
	#slideHandler = (event: UIEventSlide) => {
		if (this.disabled) return;
		// Start
		if (event.state === 'start') {
			if (this.#sliding) return;
			this.#sliding = true;
			keyboard.on('aliasPress', this.#aliasPressHandler);
			tooltips.lock(this);
			this.setAttribute('ui-slide', this.#slideTarget.toString());
			if (this.#slideTarget === -1) this.#findTarget(event);
		}
		if (event.target !== this) return;
		// Slide
		let percent: number;
		if (event.pointer) {
			this.classList.toggle('w-range-sliding', event.state === 'move');
			percent = this.#applySlide(event.x);
		} else {
			percent = this.#applyDigitalSlide(event.x);
		}
		this.style.setProperty(
			`--w-range-${['a', 'b'][this.#slideTarget]}`,
			`${percent * 100}%`,
		);
		this.#updateTooltips(this.#values[1 - this.#slideTarget], this.#tempValue);
		// Moving
		if (event.state !== 'end') {
			this.#emit(false);
			return;
		}
		// End
		this.#sliding = false;
		this.#slideTarget = -1;
		keyboard.off('aliasPress', this.#aliasPressHandler);
		this.#values[this.#slideTarget] = this.#tempValue;
		this.#updateView();
		tooltips.unlock();
		this.#emit(true);
	};
	#aliasPressHandler = (event: KeyboardEvents['aliasPress']) => {
		if (event.key !== 'ui.cancel') return;
		keyboard.off('aliasPress', this.#aliasPressHandler);
		events.slide.cancel(this);
		this.classList.remove('w-range-sliding');
		this.#updateView();
		tooltips.unlock();
		this.#emit(false);
	};
	get navChildren() {
		return [...this.#thumbs];
	}
	get nonNavigable() {
		return this.disabled;
	}
	#navCallback = (
		thumb: HTMLElement & Navigable,
		{ active, cancel }: NavigateCallbackOptions,
	) => {
		if (this.disabled) return;
		// Active
		if (active === false) {
			const locking = navigate.locking;
			navigate.lock(locking ? null : thumb);
			// Start
			if (!(locking || cancel)) {
				tooltips.lock(this);
				this.#slideTarget = this.#thumbs.indexOf(thumb);
				events.slide.start(this, -2, this.#values[this.#slideTarget]);
				return;
			}
			// Confirm
			tooltips.unlock();
			events.slide.cancel(this);
			this.#values[this.#slideTarget] = this.#tempValue;
			this.#slideTarget = -1;
			this.#emit(true);
			return;
		}
		// Cancel
		if (cancel) {
			navigate.lock(null);
			this.#updateView();
			tooltips.unlock();
			events.slide.cancel(this);
			this.#slideTarget = -1;
			this.#emit(false);
		}
	};
	get digitalXStep() {
		return this.#incrementStep;
	}
	get joystickXSpeedFactor() {
		return this.#incrementStep * 50;
	}
	get slideBorder(): SlideBorder {
		return [this.#left, this.#right, 0, 0];
	}
	cloneNode(deep?: boolean): WidgetRange {
		const node = super.cloneNode(deep) as WidgetRange;

		node.from = this.#from;
		node.to = this.#to;
		node.step = this.#step;
		node.incrementStep = this.#incrementStep;
		node.value = this.value;
		node.disabled = this.disabled;

		return node;
	}
}
