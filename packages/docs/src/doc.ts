import type { WidgetBtn, WidgetNav } from 'abm-ui';
import { $, $$, $apply, $div, $new, $ready, sleep } from 'abm-utils';

function hashChangeHandler() {
	const hash = decodeURIComponent(location.hash);
	const target = $(hash);
	if (!target) return;
	target.classList.add('highlight');
	target.addEventListener(
		'animationend',
		() => target.classList.remove('highlight'),
		{ once: true },
	);
}

function initDemo(root: HTMLElement) {
	const nav = $<WidgetNav>('w-nav', root)!;
	nav.display = 'text';
	const codes = $$('.demo-files pre', root);
	nav.items = codes.map((code, i) => {
		const name = code.getAttribute('name')!;
		return { id: String(i), content: name };
	});
	nav.value = '0';
	codes[0].classList.add('demo-file-show');
	nav.on('change', () => {
		const i = Number(nav.value);
		if (Number.isNaN(i)) return;
		$('.demo-files pre.demo-file-show', root)?.classList.remove('demo-file-show');
		codes[i].classList.add('demo-file-show');
	});
}

const LANG_COLOR: Record<string, string> = {
	typescript: '#3178c6',
	pug: '#a86454',
	stylus: '#b3d107',
};

function initCodeblock(root: HTMLElement) {
	const figure = $new({ tag: 'figure', class: 'codeblock' });
	const caption = $new({ tag: 'figcaption', class: 'codeblock-caption' });
	const code = root.children[0];
	const copyBtn = $new<WidgetBtn>({
		tag: 'w-btn',
		class: 'codeblock-copy',
		attr: { icon: 'Copy' },
	});
	root.before(figure);
	figure.append(caption, root);
	root.classList.add('codeblock-code');
	code.classList.remove('codeblock');
	const langName = code.className.slice(5);
	code.className = '';
	const color: string | undefined = LANG_COLOR[langName.toLowerCase()];
	if (color) $apply(figure, { style: { $codeColor: `${color}40` } });
	caption.append(
		$div({
			class: 'codeblock-name',
			content: langName,
		}),
		copyBtn,
	);
	copyBtn.on('active', async () => {
		await navigator.clipboard.writeText(code.textContent);
		copyBtn.icon = 'Checkmark';
		await sleep(1000);
		copyBtn.icon = 'Copy';
	});
}

function initSourceList(div: HTMLElement) {
	const list = JSON.parse(div.dataset.list ?? '[]');
	if (list.length === 0) {
		div.remove();
		return;
	}
	const btn = $new({ tag: 'w-btn', attr: { icon: 'Code', key: 'source' } });
	btn.on('active', () => {
		window.open(`https://github.com/JonnyJong/abm-kits/tree/main/${list[0]}`);
	});
	div.before(btn);
	div.remove();
}

$ready(() => {
	window.addEventListener('hashchange', hashChangeHandler);
	for (const demo of $$('figure.demo')) {
		try {
			initDemo(demo);
		} catch (error) {
			console.error(error);
		}
	}
	for (const code of $$('pre>code.codeblock')) {
		try {
			initCodeblock(code.parentElement!);
		} catch (error) {
			console.error(error);
		}
	}
	initSourceList($('#source')!);
});
