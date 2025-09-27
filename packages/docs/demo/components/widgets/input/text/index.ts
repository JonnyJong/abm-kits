import { WidgetText } from 'abm-ui';
import { $ } from 'abm-utils';

const input = $<WidgetText>('w-text')!;
input.autoFill = [
	{ id: 'test', value: 'Hello world', label: 'Hello world' },
	'A',
	'B',
	'C',
	'D',
	'E',
	'F',
	'G',
	'H',
	'I',
	'J',
	'K',
	'L',
	'M',
	'N',
];
input.actionsLeft = [{ id: 'search', icon: 'Search' }];
input.actionsRight = [{ id: 'clear', icon: 'Dismiss', hidden: true }];

input.on('input', (event) => {
	console.log(event);
	input.actionsRight[0].hidden = !input.value;
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
	if (event.value === 'clear') {
		input.value = '';
		input.actionsRight[0].hidden = true;
	}
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
