import { $new, Button } from 'abm-ui';

const button = $new(Button, { $active: console.log }, 'Hello world');

body.append(button);

//#region #Reg
__registerControl(button, {
	events: ['active'],
	props: {
		variant: ['', 'primary', 'secondary', 'danger', 'critical'],
		flat: 'boolean',
		rounded: 'boolean',
		repeat: 'boolean',
		disabled: 'boolean',
	},
});
