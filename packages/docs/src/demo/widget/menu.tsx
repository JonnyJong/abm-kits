import { $new, Button, Icon, Menu, MenuItem } from 'abm-ui';
import Add from '../../../node_modules/@fluentui/svg-icons/icons/add_20_regular.svg';
import Info from '../../../node_modules/@fluentui/svg-icons/icons/info_20_regular.svg';
import Save from '../../../node_modules/@fluentui/svg-icons/icons/save_20_regular.svg';

const action = (item: MenuItem) => console.log(item.id);

const themeSwitch = (item: MenuItem) => {
	console.log(`Switch to ${item.id}`);
	for (const menu of themeMenu.getChildren()) {
		menu.checked = menu === item;
	}
};

const themeMenu = new MenuItem({
	id: 'theme',
	label: 'Theme',
	submenu: [
		{
			id: 'light',
			label: 'Light Theme',
			type: 'checkbox',
			checked: true,
			action: themeSwitch,
		},
		{
			id: 'dark',
			label: 'Dark Theme',
			type: 'checkbox',
			checked: false,
			action: themeSwitch,
		},
		{
			id: 'auto',
			label: 'Follow System',
			type: 'checkbox',
			checked: false,
			action: themeSwitch,
		},
	],
});

const menu = new Menu([
	{
		id: 'new',
		icon: Icon.svg(Add),
		label: 'New File',
		action,
	},
	{
		id: 'open',
		label: 'Open File',
		action,
	},
	{
		id: 'save',
		icon: Icon.svg(Save),
		label: 'Save',
		disabled: true,
	},
	{ type: 'separator' },
	{
		id: 'edit',
		label: 'Edit',
		submenu: [
			{ id: 'cut', label: 'Cut' },
			{ id: 'copy', label: 'Copy' },
			{ id: 'paste', label: 'Paste', disabled: true },
			{ type: 'separator' },
			{ id: 'select-all', label: 'Select All' },
		],
	},
	{ type: 'separator' },
	themeMenu,
]);

// 插入到 theme 前面
menu.append(
	{
		id: 'checkbox1',
		type: 'checkbox',
		label: 'Show Toolbar',
		checked: true,
		action: (item) => {
			console.log('Show Toolbar:', item.checked);
			return false;
		},
		before: 'theme',
	},
	{
		id: 'checkbox2',
		type: 'checkbox',
		icon: Icon.svg(Info),
		label: 'Show Status Bar',
		checked: false,
		before: 'theme',
	},
	{ type: 'separator', before: 'theme' },
);

// 追加到末尾
menu.append(
	{ type: 'separator' },
	{
		id: 'about',
		label: 'About',
		action: () => {
			console.log('About');
			return true;
		},
	},
	{
		id: 'exit',
		label: 'Exit',
		action,
	},
);

const openButton = $new(Button, {}, 'Open Menu');
openButton.on('active', () => menu.open(openButton));
body.append(openButton);
