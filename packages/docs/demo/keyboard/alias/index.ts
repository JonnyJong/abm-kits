import { keyboard } from 'abm-ui';
import { $, $apply, $div, $new } from 'abm-utils';

function normalize(input: string): string {
	return input.replaceAll('.', '-');
}

const container = $('#main')!;

container.append(
	...Object.entries(keyboard.aliasMap).map(([id, keys]) =>
		$div(
			{ attr: { 'ui-layout': 'flow' }, style: { alignItems: 'center' } },
			$div({ id: normalize(id) }, id),
			...[...keys].map((key) => $new('w-hint-key', { prop: { key } })),
		),
	),
);

keyboard.on('aliasTrigger', (event) => {
	console.log(event);
	const item = $(`#${normalize(event.key)}`, container);
	if (!item) return;
	$apply(item, {
		style: {
			color: '$themeText',
			background: '$theme',
		},
	});
	setTimeout(() => {
		$apply(item, {
			style: {
				color: '',
				background: '',
			},
		});
	}, 100);
});
