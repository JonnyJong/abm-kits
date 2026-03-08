import { $new, Checkbox } from 'abm-ui';

const checkbox = $new(Checkbox, { $change: console.log });

body.append(checkbox);

//#region #Reg
__registerControl(checkbox, {
	events: ['change'],
	props: {
		checked: 'boolean',
		indeterminate: 'boolean',
		value: 'boolean',
		default: 'boolean',
		invalid: 'boolean',
		disabled: 'boolean',
	},
});
