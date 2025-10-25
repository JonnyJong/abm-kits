import type { WidgetCheckbox } from 'abm-ui';
import { $ } from 'abm-utils';

const checkbox = $<WidgetCheckbox>('w-checkbox')!;

checkbox.on('change', (event) => {
	console.log(event);
	emit('change');
	update('checked', checkbox.checked);
	update('indeterminate', checkbox.indeterminate);
});

const { emit, update } = window.register({
	events: ['change'],
	attrs: [
		{
			id: 'checked',
			type: 'boolean',
			value: false,
			action(v) {
				checkbox.checked = v;
			},
		},
		{
			id: 'indeterminate',
			type: 'boolean',
			value: false,
			action(v) {
				checkbox.indeterminate = v;
			},
		},
		{
			id: 'disabled',
			type: 'boolean',
			value: false,
			action(v) {
				checkbox.disabled = v;
			},
		},
	],
});
