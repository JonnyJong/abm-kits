import { $new } from 'abm-utils';
import { $panel } from '../../utils';

const checkbox = $new('w-checkbox');

export function initCheckbox() {
	$panel(
		'checkbox',
		checkbox,
		[
			{
				type: 'boolean',
				key: 'checked',
			},
			{
				type: 'boolean',
				key: 'indeterminate',
			},
			{
				type: 'boolean',
				key: 'disabled',
			},
		],
		['change'],
	);
}
