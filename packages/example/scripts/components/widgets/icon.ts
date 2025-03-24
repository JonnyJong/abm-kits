import { $new } from 'abm-utils';
import { $panel } from '../../utils';

export function initIcon() {
	$panel(
		'icon',
		$new('w-icon', 'Home'),
		[
			{
				type: 'string',
				key: 'namespace',
			},
			{
				type: 'string',
				key: 'key',
			},
		],
		[],
	);
}
