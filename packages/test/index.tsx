import {
	Nav,
	NavItem,
	NumberBox,
	PasswordBox,
	TextArea,
	TextBox,
} from 'abm-ui';
import { setup } from 'abm-ui/setup';

setup().then(() => {
	document.body.append(
		<>
			<TextBox />
			<NumberBox />
			<PasswordBox />
			<TextArea />
			<Nav>
				<NavItem value={0}>A</NavItem>
				<NavItem value={1}>B</NavItem>
				<NavItem value={2}>C</NavItem>
			</Nav>
		</>,
	);
});
