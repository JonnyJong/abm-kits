import { $new } from 'abm-utils';
import { $panel } from '../../utils';

const color = $new('w-color');

export function initColor() {
	$panel(
		'color',
		color,
		[
			{
				type: 'color',
				key: 'value',
			},
			{
				type: 'boolean',
				key: 'readOnly',
			},
			{
				type: 'boolean',
				key: 'enableAlpha',
			},
		],
		['change'],
	);
}
