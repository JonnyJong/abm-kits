import {
	type ColorScheme,
	configs,
	defaultLocale,
	tooltips,
	type WidgetColor,
	type WidgetSelect,
} from 'abm-ui';
import { $, $$, $new, $ready } from 'abm-utils';

const channel = new BroadcastChannel('abm_demo');
const languages = (window as any).__LANGUAGES as string[];

configs.init({
	icon: (() => {
		const css = [...$<HTMLLinkElement>('#assets-icon')!.sheet!.cssRules]
			.map((rule) => rule.cssText)
			.join('');
		const sheet = new CSSStyleSheet();
		sheet.replaceSync(css);
		return sheet;
	})(),
});

function switchLanguage(lang: string) {
	const current = document.documentElement.lang;
	if (current === lang) return;
	if (!languages.includes(lang)) return;
	const path = location.pathname.slice(10 + current.length);
	location.href = `/abm-kits/${lang}${path}`;
}

function nav() {
	const lang = localStorage.getItem('language');
	if (lang) switchLanguage(lang);
	const colorPicker = $<WidgetColor>('#nav-theme')!;
	const colorSchema = $<WidgetSelect<ColorScheme>>('#nav-schema')!;
	const langSelect = $<WidgetSelect<string>>('#nav-lang')!;
	colorSchema.options = [
		{ value: 'system', label: $new('w-lang', 'schema.system') },
		{ value: 'light', label: $new('w-lang', 'schema.light') },
		{ value: 'dark', label: $new('w-lang', 'schema.dark') },
	];
	colorSchema.value = 'system';
	langSelect.options = languages.map((v) => ({ value: v, label: v }));
	langSelect.value = document.documentElement.lang;
	const color = localStorage.getItem('theme-color');
	if (color) {
		try {
			configs.theme.color = color;
			colorPicker.value = configs.theme.color;
		} catch {}
	}
	const schema = localStorage.getItem('theme-schema');
	if (schema) {
		try {
			configs.theme.colorScheme = schema as any;
			colorSchema.value = configs.theme.colorScheme;
		} catch {}
	}
	colorPicker.on('change', () => {
		const color = colorPicker.value;
		configs.theme.color = color;
		localStorage.setItem('theme-color', color.hex());
		channel.postMessage({ color: color.hex() });
	});
	colorSchema.on('change', () => {
		const value = colorSchema.value;
		if (!value) return;
		configs.theme.colorScheme = value;
		localStorage.setItem('theme-schema', value);
		channel.postMessage({ schema: value });
	});
	langSelect.on('change', () => {
		const value = langSelect.value;
		if (!value) return;
		localStorage.setItem('language', value);
		switchLanguage(value);
	});
	tooltips.set(colorPicker, $new('w-lang', 'nav.color'));
	tooltips.set(colorSchema, $new('w-lang', 'nav.schema'));
	tooltips.set(langSelect, $new('w-lang', 'nav.lang'));
}

function toc() {
	let path = location.pathname;
	if (path.length > 1 && path.at(-1) === '/') path = path.slice(0, -1);
	let target: HTMLElement | null | undefined = $$<HTMLAnchorElement>(
		'aside a',
	).find((a) => new URL(a.href).pathname === path);
	while (target) {
		if (target instanceof HTMLDetailsElement) target.open = true;
		target = target.parentElement;
	}
}

function link() {
	const lang = document.documentElement.lang;
	for (const link of $$<HTMLAnchorElement>('a')) {
		const url = new URL(link.href);
		if (!url.pathname.startsWith('/@')) continue;
		url.pathname = `/abm-kits/${lang}${url.pathname.slice(2)}`;
		link.href = url.href;
	}
}

$ready(() => {
	Promise.all([nav, toc, link].map((fn) => fn()));
	defaultLocale.loader = () => (window as any).__LOCALE;
	defaultLocale.reload();
});
