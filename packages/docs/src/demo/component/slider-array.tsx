import { $new, Slider } from 'abm-ui';

const slider = $new(Slider<[number, number, number]>, {
	value: [0.1, 0.5, 0.8],
	tick: [0.1, 0.5, 0.8],
	style: { maxWidth: '90%', maxHeight: '90%' },
});

slider.on('input', (value) => console.log('input', value));
slider.on('change', (value) => console.log('change', value));

body.append(slider);

//#region #Register
__registerControl(slider, {
	events: ['input', 'change'],
	props: {
		start: 'number',
		end: 'number',
		step: 'number',
		vertical: 'boolean',
		disabled: 'boolean',
	},
});
