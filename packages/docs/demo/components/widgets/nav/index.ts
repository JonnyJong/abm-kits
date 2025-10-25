import type { WidgetNav } from 'abm-ui';
import { $ } from 'abm-utils';

const nav = $<WidgetNav<'home' | 'settings'>>('w-nav')!;
nav.items = [
	{ id: 'home', content: { icon: 'Home', text: 'Home' } },
	{ id: 'home', content: { icon: 'Home', text: 'Home' } },
	{ type: 'flex' },
	{ id: 'settings', content: { icon: 'Settings', text: 'Settings' } },
];

nav.on('change', (event) => {
	console.log(event);
	emit('change');
	update('value', nav.value);
});

const { emit, update } = window.register({
	events: ['change'],
	attrs: [
		{
			id: 'value',
			type: 'string',
			value: nav.value!,
			action(v) {
				nav.value = v as any;
			},
		},
		{
			id: 'disabled',
			type: 'boolean',
			value: nav.disabled,
			action(v) {
				nav.disabled = v;
			},
		},
		{
			id: 'vertical',
			type: 'boolean',
			value: nav.vertical,
			action(v) {
				nav.vertical = v;
			},
		},
		{
			id: 'verticalDisplay',
			type: 'boolean',
			value: nav.verticalDisplay,
			action(v) {
				nav.verticalDisplay = v;
			},
		},
		{
			id: 'display',
			type: 'enum',
			options: ['all', 'icon', 'text'],
			value: nav.display,
			action(v) {
				nav.display = v;
			},
		},
	],
});
