import { configs, WidgetColor } from 'abm-ui';
import { $ } from 'abm-utils';

const color = $<WidgetColor>('w-color')!;

color.on('change', (event) => {
	console.log(event);
	emit('change');
	update('value', color.value);
});

const { emit, update } = window.register({
	events: ['change'],
	attrs: [
		{
			id: 'value',
			type: 'color',
			value: configs.theme.color,
			action(v) {
				color.value = v;
			},
		},
		{
			id: 'readOnly',
			type: 'boolean',
			value: false,
			action(v) {
				color.readOnly = v;
			},
		},
		{
			id: 'enableAlpha',
			type: 'boolean',
			value: false,
			action(v) {
				color.enableAlpha = v;
			},
		},
	],
});
