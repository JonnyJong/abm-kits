import { configs, WidgetProgressBar } from 'abm-ui';
import { $ } from 'abm-utils';

const progress = $<WidgetProgressBar>('w-progress-bar')!;

window.register({
	attrs: [
		{
			id: 'value',
			type: 'number',
			min: 0,
			max: 100,
			value: progress.value,
			default: NaN,
			action(v) {
				progress.value = v;
			},
		},
		{
			id: 'color',
			type: 'color',
			value: configs.theme.color,
			action(v) {
				progress.color = v;
			},
		},
	],
});
