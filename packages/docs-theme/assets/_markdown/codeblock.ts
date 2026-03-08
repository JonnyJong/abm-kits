import { $, $$, $div, $new, Button, ico, Spinner } from 'abm-ui';
import { sleep } from 'abm-utils';

export function initCodeblock() {
	for (const container of $$('.code')) {
		const content = $(':scope>pre', container)!;
		const btn = $new(Button, {}, ico('copy'));
		$(':scope>figcaption', container)?.append($div({ className: 'flex' }), btn);
		btn.on('active', async () => {
			btn.replaceChildren($new(Spinner));
			try {
				await navigator.clipboard.writeText(content.textContent);
				btn.replaceChildren(ico('copied'));
			} catch {
				btn.replaceChildren(ico('copyFailed'));
			}
			await sleep(1000);
			btn.replaceChildren(ico('copy'));
		});
	}
}
