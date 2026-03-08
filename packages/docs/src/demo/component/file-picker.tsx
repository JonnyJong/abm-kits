import { $new, Button, FilePicker } from 'abm-ui';

const filePicker = $new(
	FilePicker,
	{
		$input: (color) => console.log('input:', color),
		$change: (color) => console.log('change:', color),
		multiple: true,
		style: { width: '80%', height: '80%' },
	},
	<div style="display: flex; align-items: center; justify-content: center; height: 100%;">
		Drag and drop here to add file
	</div>,
	<Button
		slot="after"
		style="margin: 16px 0; width: 100%;"
		$active={() => filePicker.openPicker()}
	>
		Add File
	</Button>,
);

body.append(filePicker);

//#region #Reg
__registerControl(filePicker, {
	events: ['input', 'change'],
	props: {
		readonly: 'boolean',
		previewImage: 'boolean',
		accept: {
			type: 'string',
			preset: ['image/*', 'video/*', 'audio/*'],
		},
		multiple: 'boolean',
	},
	actions: {
		openPicker: () => filePicker.openPicker(),
	},
});
