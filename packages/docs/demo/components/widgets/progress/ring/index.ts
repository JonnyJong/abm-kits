import { configs, WidgetProgressRing } from 'abm-ui';
import { $ } from 'abm-utils';

const progress = $<WidgetProgressRing>('w-progress-ring')!;

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
		{
			id: 'thickness',
			type: 'number',
			min: 1,
			max: 24,
			value: progress.thickness,
			action(v) {
				progress.thickness = v;
			},
		},
	],
});
