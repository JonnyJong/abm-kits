import { WidgetPassword } from 'abm-ui';
import { $new } from 'abm-utils';
import { $panel } from '../../utils';

const AUTO_FILL = [
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

const AUTO_FILL_NUM = [
	{ id: 'test', value: 123456, label: 'Hello world' },
	1,
	2,
	3,
];

export function initInput() {
	//#region Text
	const text = $new('w-text', {
		prop: {
			autoFill: AUTO_FILL,
			actionsLeft: [{ id: 'search', content: { icon: 'Search' } }],
			actionsRight: [{ id: 'clear', content: { icon: 'Dismiss' }, hidden: true }],
		},
	});
	text.on('input', () => {
		text.actionsRight[0].hidden = !text.value;
	});
	text.on('action', ({ value }) => {
		if (value !== 'clear') return;
		text.value = '';
		text.actionsRight[0].hidden = true;
	});
	$panel(
		'text',
		text,
		[
			{
				type: 'string',
				key: 'value',
				default: '',
			},
			{
				type: 'string',
				key: 'placeholder',
				default: '',
			},
			{
				type: 'boolean',
				key: 'invalid',
			},
			{
				type: 'boolean',
				key: 'disabled',
			},
			{
				type: 'boolean',
				key: 'readOnly',
			},
			{
				type: 'boolean',
				key: 'autoSize',
			},
		],
		['input', 'confirm', 'autofill', 'action'],
	);
	//#region Psw
	const psw = $new<WidgetPassword, {}>('w-password', {
		prop: {
			autoFill: AUTO_FILL,
			actionsLeft: [{ id: '', content: { icon: 'Password' } }],
			actionsRight: [
				{ id: 'clear', content: { icon: 'Dismiss' }, hidden: true },
				{ id: 'visible', content: { icon: 'EyeOff' }, toggle: true },
			],
		},
	});
	psw.on('input', () => {
		psw.actionsRight[0].hidden = !psw.value;
	});
	psw.on('action', ({ value }) => {
		if (value === 'clear') {
			psw.value = '';
			psw.actionsRight[0].hidden = true;
			return;
		}
		if (value !== 'visible') return;
		psw.passwordVisible = !!psw.actionsRight[1].checked;
		psw.actionsRight[1].content = {
			icon: psw.passwordVisible ? 'Eye' : 'EyeOff',
		};
	});
	$panel(
		'psw',
		psw,
		[
			{
				type: 'string',
				key: 'value',
				default: '',
			},
			{
				type: 'string',
				key: 'placeholder',
				default: '',
			},
			{
				type: 'boolean',
				key: 'invalid',
			},
			{
				type: 'boolean',
				key: 'disabled',
			},
			{
				type: 'boolean',
				key: 'readOnly',
			},
			{
				type: 'boolean',
				key: 'passwordVisible',
			},
			{
				type: 'boolean',
				key: 'autoSize',
			},
		],
		['input', 'confirm', 'autofill', 'action'],
	);
	//#region Number
	const number = $new('w-number', {
		prop: {
			autoFill: AUTO_FILL_NUM,
		},
	});
	$panel(
		'number',
		number,
		[
			{
				type: 'number',
				key: 'value',
			},
			{
				type: 'string',
				key: 'placeholder',
				default: '',
			},
			{
				type: 'number',
				key: 'default',
			},
			{
				type: 'number',
				key: 'min',
				default: -Infinity,
			},
			{
				type: 'number',
				key: 'max',
				default: Infinity,
			},
			{
				type: 'number',
				key: 'step',
				min: 0,
			},
			{
				type: 'boolean',
				key: 'invalid',
			},
			{
				type: 'boolean',
				key: 'disabled',
			},
			{
				type: 'boolean',
				key: 'readOnly',
			},
			{
				type: 'boolean',
				key: 'autoSize',
			},
		],
		['input', 'confirm', 'autofill', 'action'],
	);
	// Text field
	const field = $new('w-text-field');
	$panel(
		'text-field',
		field,
		[
			{
				type: 'string',
				key: 'value',
				default: '',
			},
			{
				type: 'string',
				key: 'placeholder',
				default: '',
			},
			{
				type: 'boolean',
				key: 'invalid',
			},
			{
				type: 'boolean',
				key: 'disabled',
			},
			{
				type: 'boolean',
				key: 'readOnly',
			},
			{
				type: 'boolean',
				key: 'autoSize',
			},
		],
		['input', 'confirm', 'autofill', 'action'],
	);
}
