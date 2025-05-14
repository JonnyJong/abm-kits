import { Dialog } from 'abm-ui';
import { $, $div, $new } from 'abm-utils';

export function initDialog() {
	const panel = $('#dev-dialog')!;

	const title = $new('w-text', { prop: { placeholder: 'Title' } });
	const content = $new('w-text-field', {
		prop: { placeholder: 'Content (HTML)', autoSize: true },
		style: { width: '100%', maxHeight: 'min(50vh, 300px)' },
	});

	const normal = $new('w-btn', 'Create Normal');
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
		}).show();
	});
	const confirm = $new('w-btn', 'Create Confirm');
	confirm.on('active', () => {
		Dialog.confirm({
			title: title.value,
			content: $div({ html: content.value }),
		});
	});
	const ok = $new('w-btn', 'Create Alert');
	ok.on('active', () => {
		Dialog.alert({
			title: title.value,
			content: $div({ html: content.value }),
		});
	});

	panel.append(
		title,
		content,
		$div({ attr: { 'ui-layout': 'flow' } }, normal, confirm, ok),
	);
}
