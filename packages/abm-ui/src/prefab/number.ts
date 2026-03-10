import { NumberBox, type NumberBoxProps } from '../component/input';
import { Slider, type SliderProps } from '../component/slider';
import { $new } from '../infra/dom';

export interface NumberInputPrefabInit {
	slider?: SliderProps<number> | Slider<number>;
	numberBox?: NumberBoxProps | NumberBox;
	default?: number;
	value?: number;
	start?: number;
	end?: number;
	step?: number;
	$input?: (value: number) => any;
	$change?: (value: number) => any;
}

function toNum(input: unknown, fallback: number): number {
	if (typeof input !== 'number') return fallback;
	return Number.isFinite(input) ? input : fallback;
}

export function createNumberInputPrefab(init?: NumberInputPrefabInit) {
	// Create
	let slider: Slider<number>;
	let numberBox: NumberBox;
	if (init?.slider instanceof Slider) slider = init.slider;
	else slider = $new(Slider<number>, init?.slider);
	if (init?.numberBox instanceof NumberBox) numberBox = init.numberBox;
	else numberBox = $new(NumberBox, init?.numberBox);
	// Range
	const start = toNum(init?.start, 0);
	const end = toNum(init?.end, 1);
	const step = toNum(init?.step, 0);
	const value = toNum(init?.value, 0);
	const defaultValue = toNum(init?.default, value);
	slider.start = start;
	slider.end = end;
	slider.step = step;
	slider.value = value;
	slider.default = defaultValue;
	numberBox.min = Math.min(start, end);
	numberBox.max = Math.max(start, end);
	numberBox.step = step;
	numberBox.value = value;
	numberBox.default = defaultValue;
	// Event
	slider.on('input', (value) => {
		numberBox.value = value;
		init?.$input?.(value);
	});
	slider.on('change', (value) => {
		numberBox.value = value;
		init?.$change?.(value);
	});
	numberBox.on('input', (value) => {
		slider.value = value;
		init?.$input?.(value);
	});
	numberBox.on('change', (value) => {
		slider.value = value;
		init?.$change?.(value);
	});
	numberBox.on('submit', () => {
		const value = numberBox.value;
		slider.value = value;
		init?.$change?.(value);
	});
	// API
	const updateRange = () => {
		numberBox.min = Math.min(slider.start, slider.end);
		numberBox.max = Math.min(slider.start, slider.end);
	};
	return {
		get slider() {
			return slider;
		},
		get numberBox() {
			return numberBox;
		},
		get start() {
			return slider.start;
		},
		set start(value) {
			slider.start = value;
			updateRange();
		},
		get end() {
			return slider.end;
		},
		set end(value) {
			slider.end = value;
			updateRange();
		},
		get step() {
			return slider.step;
		},
		set step(value) {
			slider.step = value;
			numberBox.step = slider.step;
		},
		get default() {
			return slider.default;
		},
		set default(value) {
			slider.default = value;
			numberBox.default = slider.default;
		},
		get value() {
			return slider.value;
		},
		set value(value) {
			slider.value = value;
			numberBox.value = slider.value;
		},
	};
}
