import type { WidgetLabel } from 'abm-ui';
import { $ } from 'abm-utils';

const label = $<WidgetLabel>('w-label')!;

window.register({
	attrs: [
		{
			id: 'for',
			type: 'string',
			value: label.for ?? '',
			action(v) {
				label.for = v;
			},
		},
	],
});
