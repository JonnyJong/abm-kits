import type { WidgetNumber } from 'abm-ui';
import { $ } from 'abm-utils';

const input = $<WidgetNumber>('w-number')!;
input.autoFill = [{ id: 'test', value: 123456, label: 'Hello world' }, 1, 2, 3];

input.on('input', (event) => {
	console.log(event);
	emit('input');
	update('value', input.value);
});

input.on('confirm', (event) => {
	console.log(event);
	emit('confirm');
});

input.on('autofill', (event) => {
	console.log(event);
	emit('autofill');
});

input.on('action', (event) => {
	console.log(event);
	emit('action');
	update('value', input.value);
});

const { emit, update } = window.register({
	events: ['input', 'confirm', 'autofill', 'action'],
	attrs: [
		{
			id: 'value',
			type: 'number',
			value: input.value,
			action(v) {
				input.value = v;
			},
		},
		{
			id: 'textContent',
			type: 'string',
			value: input.textContent,
			action(v) {
				input.textContent = v;
			},
		},
		{
			id: 'default',
			type: 'number',
			value: input.default,
			action(v) {
				input.default = v;
			},
		},
		{
			id: 'min',
			type: 'number',
			value: input.min,
			action(v) {
				input.min = v;
			},
		},
		{
			id: 'max',
			type: 'number',
			value: input.max,
			action(v) {
				input.max = v;
			},
		},
		{
			id: 'step',
			type: 'number',
			min: 0,
			value: input.step,
			action(v) {
				input.step = v;
			},
		},
		{
			id: 'incrementStep',
			type: 'number',
			min: 0,
			value: input.incrementStep,
			action(v) {
				input.incrementStep = v;
			},
		},
		{
			id: 'invalid',
			type: 'boolean',
			value: input.invalid,
			action(v) {
				input.invalid = v;
			},
		},
		{
			id: 'disabled',
			type: 'boolean',
			value: input.disabled,
			action(v) {
				input.disabled = v;
			},
		},
		{
			id: 'readOnly',
			type: 'boolean',
			value: input.readOnly,
			action(v) {
				input.readOnly = v;
			},
		},
		{
			id: 'autoSize',
			type: 'boolean',
			value: input.autoSize,
			action(v) {
				input.autoSize = v;
			},
		},
		{
			id: 'flat',
			type: 'boolean',
			value: input.flat,
			action(v) {
				input.flat = v;
			},
		},
	],
});
