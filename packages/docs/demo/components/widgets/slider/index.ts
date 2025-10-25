import type { WidgetSlider } from 'abm-ui';
import { $ } from 'abm-utils';

const slider = $<WidgetSlider>('w-slider')!;

slider.on('input', (event) => {
	console.log(event);
	emit('input');
});

slider.on('change', (event) => {
	console.log(event);
	emit('change');
	update('value', slider.value);
});

const { emit, update } = window.register({
	events: ['input', 'change'],
	attrs: [
		{
			id: 'value',
			type: 'number',
			value: slider.value,
			action(v) {
				slider.value = v;
			},
		},
		{
			id: 'from',
			type: 'number',
			value: slider.from,
			action(v) {
				slider.from = v;
			},
		},
		{
			id: 'to',
			type: 'number',
			value: slider.to,
			action(v) {
				slider.to = v;
			},
		},
		{
			id: 'step',
			type: 'number',
			value: slider.step,
			action(v) {
				slider.step = v;
			},
		},
		{
			id: 'incrementStep',
			type: 'number',
			min: 0,
			value: slider.incrementStep,
			action(v) {
				slider.incrementStep = v;
			},
		},
		{
			id: 'disabled',
			type: 'boolean',
			value: slider.disabled,
			action(v) {
				slider.disabled = v;
			},
		},
	],
});
