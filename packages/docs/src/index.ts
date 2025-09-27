import { $$, $new, $ready } from 'abm-utils';

$ready(() => {
	for (const link of $$<HTMLAnchorElement>('.doc-item a')) {
		const btn = $new('w-btn');
		btn.append(...link.childNodes);
		link.before(btn);
		link.remove();
		btn.on('active', () => {
			location.href = link.href;
		});
	}
});
