import { $new } from 'abm-utils';
import { $panel } from '../../utils';

const nav = $new('w-nav');
nav.items = [
	{ id: 'home', content: { icon: 'Home', text: 'Home' } },
	{ id: 'home', content: { icon: 'Home', text: 'Home' } },
	{ type: 'flex' },
	{ id: 'settings', content: { icon: 'Settings', text: 'Settings' } },
];

export function initNav() {
	$panel(
		'nav',
		nav,
		[
			{
				type: 'string',
				key: 'value',
				default: undefined,
			},
			{
				type: 'boolean',
				key: 'disabled',
			},
			{
				type: 'boolean',
				key: 'vertical',
			},
			{
				type: 'boolean',
				key: 'verticalDisplay',
			},
			{
				type: 'enum',
				key: 'display',
				options: ['all', 'icon', 'text'],
			},
		],
		['change'],
	);
}
