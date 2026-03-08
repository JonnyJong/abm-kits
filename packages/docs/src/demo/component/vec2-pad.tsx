import { $new, Vec2Pad } from 'abm-ui';

const pad = $new(Vec2Pad, { style: 'width: 90%; height: 90%;' });

pad.on('input', (value) => console.log('input', value));
pad.on('change', (value) => console.log('change', value));

body.append(pad);

//#region #Reg
__registerControl(pad, {
	events: ['input', 'change'],
	props: {
		disabled: 'boolean',
		invalid: 'boolean',
	},
});
