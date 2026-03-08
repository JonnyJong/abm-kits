import { $new, Button, ico, TextBox } from 'abm-ui';

const clear = $new(
	Button,
	{ slot: 'right', flat: true, style: { display: 'none' } },
	ico('ui.keyNumpadMultiply'),
);

const textBox = $new(TextBox, {}, clear);
textBox.autofill = [
	{ id: '1', value: 'Value only' },
	{ id: '2', label: 'Label only' },
	{ id: '3', value: 'Value', label: 'Label' },
];
textBox.on('input', (value) => console.log('input', { value }));
textBox.on('change', (value) => console.log('change', { value }));
textBox.on('submit', () => console.log('submit'));
textBox.on('autofill', (id) => console.log('autofill', { id }));

const updateClear = () => {
	clear.style.display = textBox.value.length > 0 ? '' : 'none';
};
textBox.on('input', updateClear);
textBox.on('autofill', updateClear);
clear.on('active', () => {
	textBox.value = '';
	updateClear();
});

body.append(textBox);

//#region #Reg
__registerControl(textBox, {
	events: ['input', 'change', 'submit', 'autofill'],
	props: {
		value: 'string',
		default: 'string',
		disabled: 'boolean',
		invalid: 'boolean',
		readOnly: 'boolean',
		autoSize: 'boolean',
	},
	actions: { reset: () => textBox.reset() },
});
