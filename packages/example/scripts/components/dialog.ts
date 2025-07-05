import { Dialog, WidgetBtn } from 'abm-ui';
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
	const maskAction = $new('w-text', { id: 'dev-dialog-mask' });

	const normal = $new<WidgetBtn, {}>('w-btn', {
		prop: { key: 'dev.components.dialog.normal' },
	});
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
			maskAction: maskAction.value === '' ? undefined : maskAction.value,
		}).show();
	});
	const confirm = $new<WidgetBtn, {}>('w-btn', {
		prop: { key: 'dev.components.dialog.confirm' },
	});
	confirm.on('active', () => {
		Dialog.confirm({
			title: title.value,
			content: $div({ html: content.value }),
			theme: color.value,
			maskAction: maskAction.value === '' ? undefined : (maskAction.value as any),
		});
	});
	const alert = $new<WidgetBtn, {}>('w-btn', {
		prop: { key: 'dev.components.dialog.alert' },
	});
	alert.on('active', () => {
		Dialog.alert({
			title: title.value,
			content: $div({ html: content.value }),
			theme: color.value,
			maskAction: maskAction.value === '' ? undefined : (maskAction.value as any),
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
		$new(
			'w-label',
			{ prop: { for: 'dev-dialog-mask' } },
			$new('w-lang', 'dev.components.dialog.mask_action'),
		),
		maskAction,
		$div({ attr: { 'ui-layout': 'flow' } }, normal, confirm, alert),
	);
}
