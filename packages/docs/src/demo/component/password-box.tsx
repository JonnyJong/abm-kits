import { $new, Button, Icon, ico, PasswordBox, state } from 'abm-ui';
import Eye from '../../../node_modules/@fluentui/svg-icons/icons/eye_20_regular.svg';

const visible = $new(Button, { slot: 'left', flat: true }, Icon.svg(Eye));
state.active.on(visible, (active) => {
	visible.variant = active ? 'primary' : '';
	passwordBox.passwordVisible = active;
});

const clear = $new(
	Button,
	{ slot: 'right', flat: true, style: { display: 'none' } },
	ico('ui.keyNumpadMultiply'),
);

const passwordBox = $new(PasswordBox, {}, visible, clear);
passwordBox.autofill = [
	{ id: '1', value: 'Value only' },
	{ id: '2', label: 'Label only' },
	{ id: '3', value: 'Value', label: 'Label' },
];
passwordBox.on('input', (value) => console.log('input', { value }));
passwordBox.on('change', (value) => console.log('change', { value }));
passwordBox.on('submit', () => console.log('submit'));
passwordBox.on('autofill', (id) => console.log('autofill', { id }));

const updateClear = () => {
	clear.style.display = passwordBox.value.length > 0 ? '' : 'none';
};
passwordBox.on('input', updateClear);
passwordBox.on('autofill', updateClear);
clear.on('active', () => {
	passwordBox.value = '';
	updateClear();
});

body.append(passwordBox);

//#region #Reg
__registerControl(passwordBox, {
	events: ['input', 'change', 'submit', 'autofill'],
	props: {
		passwordVisible: 'boolean',
		value: 'string',
		default: 'string',
		disabled: 'boolean',
		invalid: 'boolean',
		readOnly: 'boolean',
		autoSize: 'boolean',
	},
	actions: { reset: () => passwordBox.reset() },
});
