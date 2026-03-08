import { $new, Button, Icon, TextArea } from 'abm-ui';
import Upload from '../../../node_modules/@fluentui/svg-icons/icons/arrow_upload_20_regular.svg';

const submit = $new(
	Button,
	{
		slot: 'right',
		rounded: true,
		variant: 'primary',
		disabled: true,
		style: { padding: '.3em' },
	},
	Icon.svg(Upload),
);

const textArea = $new(TextArea, {}, submit);
textArea.on('input', (value) => console.log('input', { value }));
textArea.on('change', (value) => console.log('change', { value }));
textArea.on('submit', () => console.log('submit'));
textArea.on('autofill', (id) => console.log('autofill', { id }));

textArea.on('input', (value) => {
	submit.disabled = value.length === 0;
});
submit.on('active', () => {
	textArea.value = '';
	submit.disabled = true;
});

body.append(textArea);

//#region #Reg
__registerControl(textArea, {
	events: ['input', 'change', 'submit', 'autofill'],
	props: {
		enterMode: ['direct', 'ctrl', 'shift', 'alt', 'never'],
		value: 'string',
		default: 'string',
		disabled: 'boolean',
		invalid: 'boolean',
		readOnly: 'boolean',
		autoSize: 'boolean',
	},
	actions: { reset: () => textArea.reset() },
});
