import { $new, ColorBox } from 'abm-ui';

const colorBox = $new(ColorBox, { $change: console.log });

body.append(colorBox);

//#region #Reg
__registerControl(colorBox, {
	events: ['change'],
	props: {
		value: 'color',
		enableAlpha: 'boolean',
		picker: ['auto', 'dialog', 'flyout'],
	},
});
