import { $new, range } from 'abm-utils';
import { $panel } from '../../utils';

const select = $new('w-select', {
	prop: {
		placeholder: 'Pick one',
		options: range(-10, 20).map((i) => {
			if (i < -5) return { value: i };
			if (i < 0) return { value: i, label: '' };
			if (i < 10)
				return {
					value: i,
					label: $new('w-lang', {
						prop: {
							key: 'dev.widget.select',
							params: { i },
						},
					}),
				};
			return {
				value: i,
				label: [
					$new('w-lang', {
						prop: {
							key: 'dev.widget.select',
							params: { i },
						},
					}),
					$new('br'),
					$new('w-lang', {
						prop: {
							key: 'dev.widget.select',
							params: { i },
						},
					}),
				],
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
