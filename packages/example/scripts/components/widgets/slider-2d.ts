import { $new } from 'abm-utils';
import { $panel } from '../../utils';

const slider = $new('w-slider-2d');

export function initSlider2D() {
	$panel(
		'slider-2d',
		slider,
		[
			{ type: 'number', key: 'x' },
			{ type: 'number', key: 'y' },
			{ type: 'number', key: 'minX' },
			{ type: 'number', key: 'maxX' },
			{ type: 'number', key: 'stepX' },
			{
				type: 'number',
				key: 'incrementStepX',
				min: 0,
			},
			{ type: 'number', key: 'minY' },
			{ type: 'number', key: 'maxY' },
			{ type: 'number', key: 'stepY' },
			{
				type: 'number',
				key: 'incrementStepY',
				min: 0,
			},
			{ type: 'boolean', key: 'disabled' },
		],
		['input', 'change'],
	);
}
