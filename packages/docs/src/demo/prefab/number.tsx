import { createNumberInputPrefab } from 'abm-ui';

const prefab = createNumberInputPrefab({
	$input: (value) => console.log('input', value),
	$change: (value) => console.log('change', value),
});

body.append(prefab.slider, prefab.numberBox);

//#region #Reg
__registerControl(prefab as any, {
	props: {
		start: 'number',
		end: 'number',
		step: 'number',
		default: 'number',
		value: 'number',
	},
});
