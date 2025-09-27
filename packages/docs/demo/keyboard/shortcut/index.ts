import { keyboard } from "abm-ui";
import { $, $apply, $div, $new } from "abm-utils";

function normalize(input: string): string {
	return input.replaceAll('.', '-');
}

const container = $('#main')!;

container.append(
	...Object.entries(keyboard.bindMap).map(([id, group])=>$div(
		{ attr: { 'ui-layout': 'flow' }, style: { alignItems: 'center' } },
		$div({ id: normalize(id) }, id),
		...group.map((keys)=>$div(
			{ attr: { 'ui-layout': 'flow', 'ui-panel': 'middle' } },
			...[...keys].map((key) => $new('w-hint-key', { prop: { key } })),
		)),
	)),
);

keyboard.on('shortcutTrigger', (event)=>{
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
