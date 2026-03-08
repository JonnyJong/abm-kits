import { $new, ColorPicker } from 'abm-ui';

const colorPicker = $new(ColorPicker, {
	$input: (color) => console.log('input:', color),
	$change: (color) => console.log('change:', color),
});

body.append(colorPicker);

//#region #Reg
__registerControl(colorPicker, {
	events: ['input', 'change'],
	props: {
		value: 'color',
		enableAlpha: 'boolean',
	},
});
