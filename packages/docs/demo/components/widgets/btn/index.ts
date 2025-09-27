import { configs, WidgetBtn } from 'abm-ui';
import { $ } from 'abm-utils';

const btn = $<WidgetBtn>('w-btn')!;

btn.on('active', (event) => {
	emit('active');
	update('checked', btn.checked);
	console.log(event);
});

const { emit, update } = window.register({
	events: ['active'],
	attrs: [
		{
			id: 'key',
			type: 'string',
			value: btn.key ?? '',
			action(v) {
				btn.key = v ? v : undefined;
			},
		},
		{
			id: 'icon',
			type: 'string',
			value: btn.icon ?? '',
			action(v) {
				btn.icon = v ? v : undefined;
			},
		},
		{
			id: 'delay',
			type: 'number',
			value: 0,
			action(v) {
				btn.delay = v;
			},
			min: 0,
			default: 0,
		},
		{
			id: 'progress',
			type: 'number',
			value: 0,
			min: 0,
			max: 100,
			default: 0,
			action(v) {
				btn.progress = v;
			},
		},
		{
			id: 'state',
			type: 'enum',
			value: '',
			options: ['', 'primary', 'danger', 'toggle'],
			action(v) {
				btn.state = v;
			},
		},
		{
			id: 'checked',
			type: 'boolean',
			value: false,
			action(v) {
				btn.checked = v;
			},
		},
		{
			id: 'flat',
			type: 'boolean',
			value: false,
			action(v) {
				btn.flat = v;
			},
		},
		{
			id: 'rounded',
			type: 'boolean',
			value: false,
			action(v) {
				btn.rounded = v;
			},
		},
		{
			id: 'disabled',
			type: 'boolean',
			value: false,
			action(v) {
				btn.disabled = v;
			},
		},
		{
			id: 'color',
			type: 'color',
			value: configs.theme.color,
			action(v) {
				btn.color = v;
			},
		},
	],
});
