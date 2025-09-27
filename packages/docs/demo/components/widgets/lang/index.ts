import { WidgetLang } from 'abm-ui';
import { $ } from 'abm-utils';

const lang = $<WidgetLang>('w-lang')!;

window.register({
	attrs: [
		{
			id: 'namespace',
			type: 'string',
			value: lang.namespace,
			action(v) {
				lang.namespace = v;
			},
		},
		{
			id: 'key',
			type: 'string',
			value: lang.key,
			action(v) {
				lang.key = v;
			},
		},
	],
});
