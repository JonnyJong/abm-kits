import { Nav, NavFlex, NavItem } from 'abm-ui';

const nav = (
	<Nav>
		<NavItem value={1}>导航项1</NavItem>
		<NavItem value={2}>导航项2</NavItem>
		<NavItem value={3}>导航项3</NavItem>
		<NavFlex />
		<NavItem value={4}>导航项4</NavItem>
	</Nav>
);

body.append(nav);

//#region #Reg
__registerControl(nav, {
	events: ['change'],
	props: {
		value: [undefined, 1, 2, 3, 4],
		disabled: 'boolean',
		vertical: 'boolean',
	},
});
