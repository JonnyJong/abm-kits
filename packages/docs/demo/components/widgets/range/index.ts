import { WidgetRange } from 'abm-ui';
import { $ } from 'abm-utils';

const range = $<WidgetRange>('w-range')!;
range.value = [10, 20];

range.on('input', (event) => {
	console.log(event);
	emit('input');
});

range.on('change', (event) => {
	console.log(event);
	emit('change');
	update('start', range.start);
	update('end', range.end);
});

const { emit, update } = window.register({
	events: ['input', 'change'],
	attrs: [
		{
			id: 'start',
			type: 'number',
			value: range.start,
			action(v) {
				range.start = v;
			},
		},
		{
			id: 'end',
			type: 'number',
			value: range.end,
			action(v) {
				range.end = v;
			},
		},
		{
			id: 'from',
			type: 'number',
			value: range.from,
			action(v) {
				range.from = v;
			},
		},
		{
			id: 'to',
			type: 'number',
			value: range.to,
			action(v) {
				range.to = v;
			},
		},
		{
			id: 'step',
			type: 'number',
			value: range.step,
			action(v) {
				range.step = v;
			},
		},
		{
			id: 'incrementStep',
			type: 'number',
			value: range.incrementStep,
			action(v) {
				range.incrementStep = v;
			},
		},
		{
			id: 'disabled',
			type: 'boolean',
			value: range.disabled,
			action(v) {
				range.disabled = v;
			},
		},
	],
});
