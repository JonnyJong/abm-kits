import { WidgetBtn } from 'abm-ui';
import { $new } from 'abm-utils';
import { $panel } from '../../utils';

const btn = $new<WidgetBtn>('w-btn', {
	prop: {
		content: {
			key: 'ui.confirm',
			icon: 'Accept',
		},
	},
});

export function initBtn() {
	$panel(
		'btn',
		btn,
		[
			{
				type: 'string',
				key: 'content.key',
				description: 'Locale Key',
				default: undefined,
			},
			{
				type: 'string',
				key: 'content.icon',
				description: 'Icon',
				default: undefined,
			},
			{
				type: 'string',
				key: 'content.text',
				description: 'Text',
				default: undefined,
			},
			{
				type: 'number',
				key: 'content.progress',
				description: 'Progress',
				default: NaN,
			},
			{
				type: 'number',
				key: 'delay',
				min: 0,
				description: 'Delay (default: 0ms)',
				default: 0,
			},
			{
				type: 'number',
				key: 'progress',
				min: 0,
				max: 100,
				description: 'Progress (default: 100)',
				default: 100,
			},
			{
				type: 'enum',
				options: ['', 'primary', 'danger', 'toggle'],
				key: 'state',
			},
			{
				type: 'color',
				key: 'color',
			},
			{
				type: 'boolean',
				key: 'flat',
			},
			{
				type: 'boolean',
				key: 'rounded',
			},
			{
				type: 'boolean',
				key: 'checked',
			},
			{
				type: 'boolean',
				key: 'disabled',
			},
		],
		['active'],
	);
}
