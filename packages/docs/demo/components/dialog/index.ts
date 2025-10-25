import { Dialog, type WidgetBtn } from 'abm-ui';
import { $ } from 'abm-utils';

const btn = $<WidgetBtn>('w-btn')!;

btn.on('active', async () => {
	console.log('Opening dialog');
	await Dialog.alert({
		title: 'dialog.title',
		content: [],
	});
	console.log('Dialog closed');
});
