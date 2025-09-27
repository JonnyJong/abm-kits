import { WidgetSlider2D } from 'abm-ui';
import { $ } from 'abm-utils';

const slider = $<WidgetSlider2D>('w-slider-2d')!;

slider.on('input', (event) => {
	console.log(event);
	emit('input');
});

slider.on('change', (event) => {
	console.log(event);
	emit('change');
	update('x', slider.x);
	update('y', slider.y);
});

const { emit, update } = window.register({
	events: ['input', 'change'],
	attrs: [
		{
			id: 'x',
			type: 'number',
			value: slider.x,
			action(v) {
				slider.x = v;
			},
		},
		{
			id: 'y',
			type: 'number',
			value: slider.y,
			action(v) {
				slider.y = v;
			},
		},
		{
			id: 'minX',
			type: 'number',
			value: slider.minX,
			action(v) {
				slider.minX = v;
			},
		},
		{
			id: 'maxX',
			type: 'number',
			value: slider.maxX,
			action(v) {
				slider.maxX = v;
			},
		},
		{
			id: 'stepX',
			type: 'number',
			value: slider.stepX,
			action(v) {
				slider.stepX = v;
			},
		},
		{
			id: 'incrementStepX',
			type: 'number',
			min: 0,
			value: slider.incrementStepX,
			action(v) {
				slider.incrementStepX = v;
			},
		},
		{
			id: 'minY',
			type: 'number',
			value: slider.minY,
			action(v) {
				slider.minY = v;
			},
		},
		{
			id: 'maxY',
			type: 'number',
			value: slider.maxY,
			action(v) {
				slider.maxY = v;
			},
		},
		{
			id: 'stepY',
			type: 'number',
			value: slider.stepY,
			action(v) {
				slider.stepY = v;
			},
		},
		{
			id: 'incrementStepY',
			type: 'number',
			min: 0,
			value: slider.incrementStepY,
			action(v) {
				slider.incrementStepY = v;
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
