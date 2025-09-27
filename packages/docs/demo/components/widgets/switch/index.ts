import { WidgetSwitch } from 'abm-ui';
import { $ } from 'abm-utils';

const sw = $<WidgetSwitch>('w-switch')!;

sw.on('change', (event) => {
	console.log(event);
	emit('change');
	update('checked', sw.checked);
});

const { emit, update } = window.register({
	events: ['change'],
	attrs: [
		{
			id: 'checked',
			type: 'boolean',
			value: sw.checked,
			action(v) {
				sw.checked = v;
			},
		},
		{
			id: 'disabled',
			type: 'boolean',
			value: sw.disabled,
			action(v) {
				sw.disabled = v;
			},
		},
	],
});
