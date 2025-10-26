import { $lang, type WidgetSelect } from 'abm-ui';
import { $, $new, type DOMContents, range } from 'abm-utils';

const select = $<WidgetSelect<number>>('w-select')!;
select.placeholder = 'Pick one';
select.options = range(-10, 20).map<{ value: number; label: DOMContents }>(
	(i) => {
		if (i < -5) return { value: i } as any;
		if (i < 0) return { value: i, label: '' };
		if (i < 10) {
			return {
				value: i,
				label: $lang({
					prop: {
						key: 'dev.widget.select',
						params: { i },
					},
				}),
			};
		}
		return {
			value: i,
			label: [
				$lang({
					prop: {
						key: 'dev.widget.select',
						params: { i },
					},
				}),
				$new({ tag: 'br' }),
				$lang({
					prop: {
						key: 'dev.widget.select',
						params: { i },
					},
				}),
			],
		};
	},
);

select.on('change', (event) => {
	console.log(event);
	emit('change');
	update('index', select.index);
	update('value', select.value);
});

const { emit, update } = window.register({
	events: ['change'],
	attrs: [
		{
			id: 'index',
			type: 'number',
			value: select.index,
			action(v) {
				select.index = v;
				update('value', select.value);
			},
		},
		{
			id: 'value',
			type: 'number',
			value: select.value ?? NaN,
			action(v) {
				select.value = v;
				update('index', select.index);
			},
		},
		{
			id: 'disabled',
			type: 'boolean',
			value: select.disabled,
			action(v) {
				select.disabled = v;
			},
		},
	],
});
