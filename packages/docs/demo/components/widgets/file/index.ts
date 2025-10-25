import type { WidgetFile } from 'abm-ui';
import { $ } from 'abm-utils';

const picker = $<WidgetFile>('w-file')!;

picker.on('change', (event) => {
	console.log(event);
	emit('change');
});

const { emit } = window.register({
	events: ['change'],
	attrs: [
		{
			id: 'accept',
			type: 'string',
			value: '',
			action(v) {
				picker.accept = v;
			},
		},
		{
			id: 'display',
			type: 'enum',
			options: ['row', 'block'],
			value: picker.display,
			action(v) {
				picker.display = v;
			},
		},
		{
			id: 'multiple',
			type: 'boolean',
			value: false,
			action(v) {
				picker.multiple = v;
			},
		},
		{
			id: 'previewImage',
			type: 'boolean',
			value: false,
			action(v) {
				picker.previewImage = v;
			},
		},
		{
			id: 'readonly',
			type: 'boolean',
			value: false,
			action(v) {
				picker.readonly = v;
			},
		},
	],
});
