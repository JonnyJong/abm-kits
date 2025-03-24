import { $new } from 'abm-utils';
import { $panel } from '../../utils';

const colorPicker = $new('w-color-picker');

export function initColorPicker() {
	$panel(
		'color-picker',
		colorPicker,
		[
			{
				type: 'color',
				key: 'value',
			},
			{
				type: 'boolean',
				key: 'disabled',
			},
			{
				type: 'boolean',
				key: 'enableAlpha',
			},
		],
		['input', 'change'],
	);
}
