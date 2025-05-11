import { WidgetHintKey, keyboard } from 'abm-ui';
import { $, $apply, $div, $new } from 'abm-utils';

function normalize(input: string): string {
	return input.replaceAll('.', '-');
}

export function initKeyboard() {
	// Pressing
	const pressing = $('#keyboard-pressing')!;
	const pressingUpHandler = () => {
		pressing.replaceChildren(
			...keyboard.pressing.map((key) =>
				$new<WidgetHintKey>('w-hint-key', { prop: { key } }),
			),
		);
	};
	keyboard.on('down', pressingUpHandler);
	keyboard.on('up', pressingUpHandler);
	// Shortcuts
	const shortcuts = $('#keyboard-shortcuts')!;
	shortcuts.append(
		...Object.entries(keyboard.bindMap).map(([id, group]) =>
			$div(
				{ attr: { 'ui-layout': 'flow' }, style: { alignItems: 'center' } },
				$div({ id: `keyboard-shortcut-${normalize(id)}` }, id),
				...group.map((keys) =>
					$div(
						{ attr: { 'ui-layout': 'flow', 'ui-panel': 'middle' } },
						...[...keys].map((key) => $new('w-hint-key', { prop: { key } })),
					),
				),
			),
		),
	);
	keyboard.on('shortcutTrigger', ({ key }) => {
		const item = $(`#keyboard-shortcut-${normalize(key)}`);
		if (!item) return;
		$apply(item, {
			style: {
				color: 'var(--theme-text)',
				background: 'var(--theme)',
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
	// Alias
	const alias = $('#keyboard-alias')!;
	alias.append(
		...Object.entries(keyboard.aliasMap).map(([id, keys]) =>
			$div(
				{ attr: { 'ui-layout': 'flow' }, style: { alignItems: 'center' } },
				$div({ id: `keyboard-alias-${normalize(id)}` }, id),
				...[...keys].map((key) => $new('w-hint-key', { prop: { key } })),
			),
		),
	);
	keyboard.on('aliasTrigger', ({ key }) => {
		const item = $(`#keyboard-alias-${normalize(key)}`);
		if (!item) return;
		$apply(item, {
			style: {
				color: 'var(--theme-text)',
				background: 'var(--theme)',
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
}
