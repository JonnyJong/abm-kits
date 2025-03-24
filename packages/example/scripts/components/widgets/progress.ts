import { $new } from 'abm-utils';
import { $panel } from '../../utils';

export function initProg() {
	$panel(
		'progress-bar',
		$new('w-progress-bar'),
		[
			{
				type: 'number',
				key: 'value',
				default: NaN,
			},
			{
				type: 'color',
				key: 'color',
			},
		],
		[],
	);
	$panel(
		'progress-ring',
		$new('w-progress-ring'),
		[
			{
				type: 'number',
				key: 'value',
				default: NaN,
			},
			{
				type: 'color',
				key: 'color',
			},
			{
				type: 'number',
				key: 'thickness',
				default: 5,
				min: 1,
				max: 24,
			},
		],
		[],
	);
}
