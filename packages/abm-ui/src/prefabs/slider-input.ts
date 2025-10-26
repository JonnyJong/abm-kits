import {
	$new,
	type EventsList,
	EventValue,
	type EventValueInit,
} from 'abm-utils';
import { Prefab } from './base';

export interface PrefabSliderInputInit {
	/** 起始值 */
	value?: number;
	/** 起始范围 */
	from?: number;
	/** 结束范围 */
	to?: number;
	/** 步长 */
	step?: number;
	/** 按键步长 */
	incrementStep?: number;
	/** 滑动条起始范围 */
	sliderFrom?: number;
	/** 滑动条结束范围 */
	sliderTo?: number;
}

interface PrefabSliderInputEventsInit {
	/** 输入事件 */
	input: EventValueInit<PrefabSliderInput, number>;
	/** 更改事件 */
	change: EventValueInit<PrefabSliderInput, number>;
}

export interface PrefabSliderInputEvents
	extends EventsList<PrefabSliderInputEventsInit> {}

/** 预制件：滑动条与输入框 */
export class PrefabSliderInput extends Prefab<PrefabSliderInputEventsInit> {
	#slider = $new({ tag: 'w-slider' });
	#input = $new({ tag: 'w-number' });
	constructor(init?: PrefabSliderInputInit) {
		super({ eventTypes: ['input', 'change'] });
		this.#slider.on('input', ({ value }) => {
			this.#input.value = value;
			this.events.emit(new EventValue('input', { target: this, value }));
		});
		this.#input.on('input', () => {
			this.#slider.value = this.#input.value;
			this.events.emit(
				new EventValue('input', { target: this, value: this.#input.value }),
			);
		});
		this.#slider.on('change', this.#changeHandler);
		this.#input.on('confirm', this.#changeHandler);
		if (!init) return;
		if (typeof init.from === 'number') this.#slider.from = init.from;
		if (typeof init.to === 'number') this.#slider.to = init.to;
		if (typeof init.from === 'number' || typeof init.to === 'number') {
			let a = init.from ?? -Infinity;
			let b = init.to ?? +Infinity;
			if (a > b) [a, b] = [b, a];
			this.#input.min = a;
			this.#input.max = b;
		}
		if (typeof init.sliderFrom === 'number') this.#slider.from = init.sliderFrom;
		if (typeof init.sliderTo === 'number') this.#slider.to = init.sliderTo;
		if (typeof init.step === 'number') {
			this.#input.step = init.step;
			this.#slider.step = init.step;
		}
		if (typeof init.incrementStep === 'number') {
			this.#input.incrementStep = init.incrementStep;
			this.#slider.incrementStep = init.incrementStep;
		}
		if (typeof init.value === 'number') this.value = init.value;
	}
	#changeHandler = () => {
		this.events.emit(
			new EventValue('change', { target: this, value: this.#input.value }),
		);
	};
	/** 滑动条 */
	get slider() {
		return this.#slider;
	}
	/** 输入框 */
	get input() {
		return this.#input;
	}
	/** 值 */
	get value() {
		return this.#input.value;
	}
	set value(value) {
		this.#input.value = value;
		this.#slider.value = this.#input.value;
	}
	/** 起始范围 */
	get from() {
		if (this.#slider.from > this.#slider.to) return this.#input.max;
		return this.#input.min;
	}
	set from(value) {
		if (this.#slider.from > this.#slider.to) {
			this.#input.max = value;
			if (!Number.isFinite(this.#input.max)) return;
			this.#slider.from = Math.min(this.#slider.from, this.#input.max);
		} else {
			this.#input.min = value;
			if (!Number.isFinite(this.#input.min)) return;
			this.#slider.from = Math.max(this.#slider.from, this.#input.min);
		}
	}
	/** 结束范围 */
	get to() {
		if (this.#slider.from > this.#slider.to) return this.#input.min;
		return this.#input.max;
	}
	set to(value) {
		if (this.#slider.from > this.#slider.to) {
			this.#input.min = value;
			if (!Number.isFinite(this.#input.min)) return;
			this.#slider.to = Math.max(this.#slider.to, this.#input.min);
		} else {
			this.#input.max = value;
			if (!Number.isFinite(this.#input.max)) return;
			this.#slider.to = Math.min(this.#slider.to, this.#input.max);
		}
	}
	/** 步长 */
	get step() {
		return this.#input.step;
	}
	set step(value) {
		this.#input.step = value;
		this.#slider.step = value;
	}
	/** 按键步长 */
	get incrementStep() {
		return this.#input.incrementStep;
	}
	set incrementStep(value) {
		this.#input.incrementStep = value;
		this.#slider.incrementStep = value;
	}
	/** 滑动条起始范围 */
	get sliderFrom() {
		return this.#slider.from;
	}
	set sliderFrom(value) {
		this.#slider.from = value;
	}
	/** 滑动条结束范围 */
	get sliderTo() {
		return this.#slider.to;
	}
	set sliderTo(value) {
		this.#slider.to = value;
	}
}
