import {
	$div,
	Throttle,
	clamp,
	createClampedStepper,
	css,
	formatWithStep,
} from 'abm-utils';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import CSS from 'slider.style';
import { events, UIEventSlide } from '../../events';
import { EventValue, EventValueInit } from '../../events/api/value';
import { EventsList } from '../../events/events';
import { Slidable, SlideBorder } from '../../events/ui/slide';
import { KeyboardEvents, keyboard } from '../../keyboard';
import { Navigable, NavigateCallbackOptions, navigate } from '../../navigate';
import { tooltips } from '../tooltips';
import { Widget } from './base';

interface WidgetSliderEventsInit {
	/** 输入事件 */
	input: EventValueInit<WidgetSlider, number>;
	/** 更改事件 */
	change: EventValueInit<WidgetSlider, number>;
}

export type WidgetSliderEvents = EventsList<WidgetSliderEventsInit>;

export interface WidgetSliderProp {
	/** 当前值 */
	value?: number;
	from?: number;
	to?: number;
	/** 步长 */
	step?: number;
	// ticks?: number[] | number;
	// snapTicks?: boolean;
	/** 禁用 */
	disabled?: boolean;
	// vertical?: boolean;
}

const THUMB_R = 11;
const THUMB_SIZE = THUMB_R * 2;

/** 滑动条 */
@customElement('w-slider')
export class WidgetSlider
	extends Widget<WidgetSliderProp, WidgetSliderEventsInit>
	implements Navigable, Slidable
{
	static styles = css(CSS);
	#clampedStepper = createClampedStepper(0, 100);
	constructor() {
		super(['input', 'change'], true);

		tooltips.set(this, '0');

		events.hover.add(this);
		events.slide.on(this, this.#slideHandler);
	}

	#updateMinMaxStep() {
		const stroke = this.#to - this.#from;
		this.#digitalStep = this.#step;
		if (!this.#digitalStep)
			this.#digitalStep = Math.abs(stroke) <= 1 ? stroke / 100 : 1;

		if (this.#from <= this.#to) {
			this.#left = this.#from;
			this.#right = this.#to;
		} else {
			this.#left = this.#to;
			this.#right = this.#from;
		}

		this.#clampedStepper = createClampedStepper(this.#from, this.#to, this.#step);
		this.#value = this.#clampedStepper(this.#value);
		this.#updateView();
	}
	//#region View
	#thumb = $div({ class: 'thumb' });
	protected render() {
		return html`
			<div class="track"></div>
			${this.#thumb}
		`;
	}
	#updateView = Throttle.new(() => {
		const stroke = this.#to - this.#from;
		const offset = this.#value - this.#from;
		const percent = (offset / stroke) * 100;
		this.style.setProperty('--value', `${percent}%`);
		this.#updateTooltips(this.#value);
	});
	#updateTooltips(value: number) {
		tooltips.set(this, formatWithStep(value, this.#step));
	}
	//#region Properties
	/** 禁用 */
	@property({ type: Boolean, reflect: true }) accessor disabled = false;
	#value = 0;
	/** 当前值 */
	@property({ type: Number })
	get value() {
		return this.#value;
	}
	set value(value: number) {
		if (this.#value === value) return;
		this.#value = this.#clampedStepper(value);
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
		if (isNaN(value)) value = 0;
		value = Math.abs(value);
		if (this.#step === value) return;
		this.#step = value;
		this.#updateMinMaxStep();
	}
	#digitalStep = 1;
	#left = 0;
	#right = 100;
	//#region Events
	#tempValue = 0;
	#emit(change: boolean) {
		this.events.emit(
			new EventValue(change ? 'change' : 'input', {
				target: this,
				value: change ? this.#value : this.#tempValue,
			}),
		);
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
	#slideHandler(event: UIEventSlide) {
		if (this.disabled) return;

		// Start
		if (event.state === 'start') {
			keyboard.on('aliasPress', this.#aliasPressHandler);
			tooltips.lock(this);
		}

		// Slide
		let percent: number;
		if (event.pointer) {
			this.classList.toggle('w-slider-sliding', event.state === 'move');
			percent = this.#applySlide(event.x);
		} else {
			percent = this.#applyDigitalSlide(event.x);
		}

		this.style.setProperty('--value', `${percent * 100}%`);
		this.#updateTooltips(this.#tempValue);

		// Moving
		if (event.state !== 'end') {
			this.#emit(false);
			return;
		}

		// End
		keyboard.off('aliasPress', this.#aliasPressHandler);
		this.#value = this.#tempValue;
		this.#updateView();
		tooltips.unlock();
		this.#emit(true);
	}
	#aliasPressHandler = (event: KeyboardEvents['aliasPress']) => {
		if (event.key !== 'ui.cancel') return;
		keyboard.off('aliasPress', this.#aliasPressHandler);
		events.slide.cancel(this);
		this.classList.remove('w-slider-sliding');
		this.#updateView();
		tooltips.unlock();
		this.#tempValue = this.#value;
		this.#emit(false);
	};
	get nonNavigable() {
		return this.disabled;
	}
	navCallback({ active, cancel }: NavigateCallbackOptions) {
		if (this.disabled) return;
		// Active
		if (active === false) {
			const locking = navigate.locking;
			navigate.lock(locking ? null : this.#thumb);
			// Start
			if (!(locking || cancel)) {
				tooltips.lock(this);

				events.slide.start(
					this,
					-2,
					this.#from < this.#to ? this.#value : this.#from - this.#value,
				);
				return;
			}
			// Confirm
			tooltips.unlock();
			events.slide.cancel(this);
			this.#value = this.#tempValue;
			this.#emit(true);
			return;
		}
		// Cancel
		if (cancel) {
			navigate.lock(null);
			this.#updateView();
			tooltips.unlock();
			events.slide.cancel(this);
			this.#tempValue = this.#value;
			this.#emit(false);
		}
	}
	get digitalXStep() {
		return this.#digitalStep;
	}
	get joystickXSpeedFactor() {
		return this.#digitalStep * 50;
	}
	get slideBorder(): SlideBorder {
		return [this.#left, this.#right, 0, 0];
	}
	cloneNode(deep?: boolean): WidgetSlider {
		const node = super.cloneNode(deep) as WidgetSlider;

		node.from = this.#from;
		node.to = this.#to;
		node.step = this.#step;
		node.value = this.#value;
		node.disabled = this.disabled;

		return node;
	}
}
