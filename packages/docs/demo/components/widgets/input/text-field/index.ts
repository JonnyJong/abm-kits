import type { WidgetTextField } from 'abm-ui';
import { $ } from 'abm-utils';

const input = $<WidgetTextField>('w-text-field')!;

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
			type: 'string',
			value: input.value,
			action(v) {
				input.value = v;
			},
		},
		{
			id: 'placeholder',
			type: 'string',
			value: input.placeholder,
			action(v) {
				input.placeholder = v;
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
