import { $new, Slider } from 'abm-ui';

const slider = $new(Slider<number>, {
	tick: 0.1,
	style: { maxWidth: '90%', maxHeight: '90%' },
});

slider.on('input', (value) => console.log('input', value));
slider.on('change', (value) => console.log('change', value));

body.append(slider);

//#region #Register
__registerControl(slider, {
	events: ['input', 'change'],
	props: {
		value: 'number',
		start: 'number',
		end: 'number',
		step: 'number',
		vertical: 'boolean',
		disabled: 'boolean',
	},
});
