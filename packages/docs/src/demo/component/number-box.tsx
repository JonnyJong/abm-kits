import { $new, NumberBox } from 'abm-ui';

const numberBox = $new(NumberBox);
numberBox.autofill = [
	{ id: '1', value: 2 },
	{ id: '2', label: 'Label only' },
	{ id: '3', value: 1, label: 'Label' },
];
numberBox.on('input', (value) => console.log('input', { value }));
numberBox.on('change', (value) => console.log('change', { value }));
numberBox.on('submit', () => console.log('submit'));
numberBox.on('autofill', (id) => console.log('autofill', { id }));

body.append(numberBox);

//#region #Reg
__registerControl(numberBox, {
	events: ['input', 'change', 'submit', 'autofill'],
	props: {
		min: 'number',
		max: 'number',
		step: 'number',
		value: 'number',
		default: 'number',
		disabled: 'boolean',
		invalid: 'boolean',
		readOnly: 'boolean',
		autoSize: 'boolean',
	},
	actions: { reset: () => numberBox.reset() },
});
