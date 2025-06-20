import { $new } from 'abm-utils';
import { $panel } from '../../utils';

const slider = $new('w-slider');

export function initSlider() {
	$panel(
		'slider',
		slider,
		[
			{
				type: 'number',
				key: 'value',
			},
			{
				type: 'number',
				key: 'from',
			},
			{
				type: 'number',
				key: 'to',
			},
			{
				type: 'number',
				key: 'step',
				min: 0,
			},
			{
				type: 'number',
				key: 'incrementStep',
				min: 0,
			},
			{
				type: 'boolean',
				key: 'disabled',
			},
		],
		['input', 'change'],
	);
}
