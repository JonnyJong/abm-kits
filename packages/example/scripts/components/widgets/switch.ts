import { $new } from 'abm-utils';
import { $panel } from '../../utils';

const switchToggle = $new('w-switch');

export function initSwitch() {
	$panel(
		'switch',
		switchToggle,
		[
			{
				type: 'boolean',
				key: 'checked',
			},
			{
				type: 'boolean',
				key: 'disabled',
			},
		],
		['change'],
	);
}
