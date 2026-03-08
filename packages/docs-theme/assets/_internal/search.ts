import type * as PageFind from '@pagefind';
import {
	$,
	$div,
	$new,
	type AutofillItem,
	Button,
	Icon,
	keyboard,
	type Navigable,
	navigate,
	Progress,
	state,
	TextBox,
	t,
} from 'abm-ui';
import { sleep } from 'abm-utils';
import Search from '../../node_modules/@fluentui/svg-icons/icons/search_20_regular.svg';

let pagefind: typeof PageFind;
let backdrop: HTMLElement;
let container: HTMLElement & Navigable;
let input: TextBox;
const results: string[] = [];

async function loadPagefind() {
	if (pagefind) return;
	const url = `${location.origin}${location.pathname.split('/').slice(0, 3).join('/')}/pagefind.js`;
	pagefind = (await import(url)) as typeof PageFind;
	pagefind.init();
	$('#search-loading')?.remove();
	search();
}

function render(
	{ url, meta, excerpt }: PageFind.PagefindSearchFragment,
	root: HTMLElement,
	i: number,
): void {
	const e = $div();
	e.innerHTML = excerpt;
	root.replaceChildren($div({ style: { fontSize: 20 } }, meta.title), e);
	results[i] = url;
}

async function autoRender(
	i: number,
	label: HTMLElement,
	data: PageFind.PagefindSearchResult['data'],
) {
	const exe = async () => render(await data(), label, i);
	if (i < 10) {
		await sleep(i * 20);
		exe();
		return;
	}
	const observer = new IntersectionObserver(() => {
		observer.disconnect();
		exe();
	});
	observer.observe(label);
}

function toItem(
	{ data }: PageFind.PagefindSearchResult,
	i: number,
): AutofillItem<string> {
	const label = $div({}, '...');
	autoRender(i, label, data);
	return { id: `${i}`, label };
}

async function search() {
	if (!pagefind) return;
	const result = await pagefind.debouncedSearch(input.value);
	if (!result) return;
	input.autofill = result.results.map(toItem);
}

function openDialog() {
	if (container.isConnected) return;
	document.body.append(backdrop, container);
	navigate.addLayer(container, input);
	input.focus();
	loadPagefind();
}

function closeDialog() {
	navigate.rmLayer(container);
	container.remove();
	backdrop.remove();
}

export function initSearch() {
	input = $new(TextBox, { className: 'search-input' }, t('search'));
	backdrop = $div({ className: 'backdrop-dim' });
	container = $div(
		{ className: 'overlay safe-inset search' },
		input,
		$new(Progress, { id: 'search-loading' }),
	);
	state.active.on(backdrop, (active, cancel) => {
		if (active || cancel) return;
		closeDialog();
	});
	container.navCallback = (state) => {
		if (state.type !== 'back') return;
		closeDialog();
	};
	input.on('input', search);
	input.on('autofill', (id) => {
		const result = results?.[id as any];
		if (!result) return;
		location.pathname = `/abm-kits${result}`;
	});
	$('nav')?.append(
		$new(
			Button,
			{ $active: openDialog },
			Icon.svg(Search),
			$new('span', { style: { opacity: 0.5 } }, 'Ctrl K'),
		),
	);
	keyboard.shortcut.add('search', ['ControlLeft', 'KeyK']);
	keyboard.shortcut.add('search', ['ControlRight', 'KeyK']);
	keyboard.on('shortcut', (id) => {
		if (id === 'search') openDialog();
	});
}
