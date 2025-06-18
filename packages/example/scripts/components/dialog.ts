import { Dialog } from 'abm-ui';
import { $, $div, $new } from 'abm-utils';

export function initDialog() {
	const panel = $('#dev-dialog')!;

	const title = $new('w-text', { id: 'dev-dialog-title' });
	const content = $new('w-text-field', {
		id: 'dev-dialog-content',
		prop: { autoSize: true },
		style: { width: '100%', maxHeight: 'min(50vh, 300px)' },
	});
	const color = $new('w-color', { id: 'dev-dialog-color' });

	const normal = $new('w-btn', 'dev.components.dialog.normal');
	normal.on('active', () => {
		new Dialog({
			title: title.value,
			content: $div({ html: content.value }),
			actions: [
				Dialog.ACTION_DANGER_CONFIRM,
				Dialog.ACTION_OK,
				Dialog.ACTION_CONFIRM,
				Dialog.ACTION_CANCEL,
			],
			autoHide: true,
			theme: color.value,
		}).show();
	});
	const confirm = $new('w-btn', 'dev.components.dialog.confirm');
	confirm.on('active', () => {
		Dialog.confirm({
			title: title.value,
			content: $div({ html: content.value }),
			theme: color.value,
		});
	});
	const ok = $new('w-btn', 'dev.components.dialog.alert');
	ok.on('active', () => {
		Dialog.alert({
			title: title.value,
			content: $div({ html: content.value }),
			theme: color.value,
		});
	});

	panel.append(
		$new(
			'w-label',
			{ prop: { for: 'dev-dialog-title' } },
			$new('w-lang', 'dev.components.dialog.title'),
		),
		title,
		$new(
			'w-label',
			{ prop: { for: 'dev-dialog-content' } },
			$new('w-lang', 'dev.components.dialog.content'),
		),
		content,
		$new(
			'w-label',
			{ prop: { for: 'dev-dialog-color' } },
			$new('w-lang', 'dev.components.dialog.color'),
		),
		color,
		$div({ attr: { 'ui-layout': 'flow' } }, normal, confirm, ok),
	);
}
