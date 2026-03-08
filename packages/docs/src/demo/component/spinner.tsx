import { $new, Spinner } from 'abm-ui';

const spinner = $new(Spinner);

body.append(spinner);

//#region #Reg
__registerControl(spinner, {
	props: {
		value: {
			type: 'number',
			default: NaN,
			min: 0,
			max: 100,
		},
		size: { type: 'number', min: 0 },
	},
});
