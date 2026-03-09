import { $new, Button, Collapsible } from 'abm-ui';

const collapsible = $new(
	Collapsible,
	{},
	<Collapsible.Head>
		<Collapsible.Trigger>
			<Button flat>Click Me</Button>
		</Collapsible.Trigger>
	</Collapsible.Head>,
	'Hello world',
);

body.append(collapsible);

//#region #Reg
__registerControl(collapsible, {
	props: {
		expanded: 'boolean',
		disabled: 'boolean',
	},
});
