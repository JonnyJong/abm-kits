import { $new, Collapsible } from 'abm-ui';

const collapsible = $new(
	Collapsible,
	{ $expand: console.log },
	<div slot="head">Click Me</div>,
	'Hello world',
);

body.append(collapsible);

//#region #Reg
__registerControl(collapsible, {
	events: ['expand', 'collapse'],
	props: {
		expanded: 'boolean',
		disabled: 'boolean',
	},
});
