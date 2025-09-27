import { configs, WidgetColorPicker } from 'abm-ui';
import { $ } from 'abm-utils';

const picker = $<WidgetColorPicker>('w-color-picker')!;

picker.on('input', (event) => {
	console.log(event);
	emit('input');
});

picker.on('change', (event) => {
	console.log(event);
	emit('change');
	update('value', picker.value);
});

const { emit, update } = window.register({
	events: ['input', 'change'],
	attrs: [
		{
			id: 'value',
			type: 'color',
			value: configs.theme.color,
			action(v) {
				picker.value = v;
			},
		},
		{
			id: 'disabled',
			type: 'boolean',
			value: false,
			action(v) {
				picker.disabled = v;
			},
		},
		{
			id: 'enableAlpha',
			type: 'boolean',
			value: false,
			action(v) {
				picker.enableAlpha = v;
			},
		},
	],
});
