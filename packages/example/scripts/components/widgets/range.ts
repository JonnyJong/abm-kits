import { $new } from 'abm-utils';
import { $panel } from '../../utils';

const range = $new('w-range');
range.value = [10, 20];

export function initRange() {
	$panel(
		'range',
		range,
		[
			{ type: 'number', key: 'start' },
			{ type: 'number', key: 'end' },
			{ type: 'number', key: 'from' },
			{ type: 'number', key: 'to' },
			{ type: 'number', key: 'step' },
			{ type: 'number', key: 'incrementStep' },
			{ type: 'boolean', key: 'disabled' },
		],
		['input', 'change'],
	);
}
