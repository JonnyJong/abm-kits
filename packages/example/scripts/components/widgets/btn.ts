import { $new } from 'abm-utils';
import { $panel } from '../../utils';

const btn = $new('w-btn', {
	prop: {
		key: 'ui.confirm',
		icon: 'Home',
	},
});

export function initBtn() {
	$panel(
		'btn',
		btn,
		[
			{
				type: 'string',
				key: 'key',
				description: 'Locale Key',
				default: undefined,
			},
			{
				type: 'string',
				key: 'icon',
				description: 'Icon',
				default: undefined,
			},
			{
				type: 'number',
				key: 'delay',
				min: 0,
				description: 'Delay (default: 0ms)',
				default: 0,
			},
			{
				type: 'number',
				key: 'progress',
				min: 0,
				max: 100,
				description: 'Progress (default: 100)',
				default: 100,
			},
			{
				type: 'enum',
				options: ['', 'primary', 'danger', 'toggle'],
				key: 'state',
			},
			{
				type: 'color',
				key: 'color',
			},
			{
				type: 'boolean',
				key: 'flat',
			},
			{
				type: 'boolean',
				key: 'rounded',
			},
			{
				type: 'boolean',
				key: 'checked',
			},
			{
				type: 'boolean',
				key: 'disabled',
			},
		],
		['active'],
	);
}
