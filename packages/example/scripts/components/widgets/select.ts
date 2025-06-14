import { $new, range } from 'abm-utils';
import { $panel } from '../../utils';

const select = $new('w-select', {
	prop: {
		placeholder: 'Pick one',
		options: range(10).map((i) => {
			return {
				value: i * i,
				label: $new('w-lang', {
					prop: {
						key: 'dev.widget.select',
						params: { i },
					},
				}),
			};
		}),
	},
});

export function initSelect() {
	$panel(
		'select',
		select,
		[
			{
				type: 'number',
				key: 'index',
			},
			{
				type: 'number',
				key: 'value',
			},
			{
				type: 'boolean',
				key: 'disabled',
			},
		],
		['change'],
	);
}
