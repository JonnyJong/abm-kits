import { WidgetIcon } from 'abm-ui';
import { $ } from 'abm-utils';

const icon = $<WidgetIcon>('w-icon')!;

window.register({
	attrs: [
		{
			id: 'namespace',
			type: 'string',
			value: icon.namespace,
			action(v) {
				icon.namespace = v;
			},
		},
		{
			id: 'key',
			type: 'string',
			value: icon.key,
			action(v) {
				icon.key = v;
			},
		},
	],
});
