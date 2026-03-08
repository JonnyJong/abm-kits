import { $new, Switch } from 'abm-ui';

const switchElement = $new(Switch);

body.append(switchElement);

//#region #Reg
__registerControl(switchElement, {
	events: ['change'],
	props: {
		checked: 'boolean',
	},
});
