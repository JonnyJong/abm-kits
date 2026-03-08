import { $, $$, $new, Nav } from 'abm-ui';

export function initTabs() {
	for (const container of $$('.tabs')) {
		const tabs = $('.tab-nav', container)!;
		const content = $('.tab-content', container)!;
		const nav = $new(Nav<number>, { className: tabs.className });
		nav.setup([...tabs.children].map((content, value) => ({ value, content })));
		nav.value = 0;
		nav.on('change', (index) => {
			$(':scope>.active', content)?.classList.remove('active');
			content.children[index!].classList.add('active');
		});
		tabs.after(nav);
		tabs.remove();
	}
}
