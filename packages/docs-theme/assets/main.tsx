import {
	$,
	$$,
	$on,
	$path,
	Button,
	Collapsible,
	ico,
	type Navigable,
	setup,
	state,
} from 'abm-ui';
import { locale } from 'abm-utils';
import { $get } from './_internal/config';
import { ICONS, PRESET_ICONS } from './_internal/icon';
import { LOCALES } from './_internal/locale';
import { initSearch } from './_internal/search';
import { initCodeblock } from './_markdown/codeblock';
import { initFolds } from './_markdown/fold';
import { initLinks } from './_markdown/link';
import { initTabs } from './_markdown/tabs';
import { ThemeColorSetter } from './_nav/color';
import { DirectionSetter, setDirection } from './_nav/direction';
import LanguageSetter, { changeLanguage } from './_nav/lang';
import { setSchema, ThemeSchemaSetter } from './_nav/schema';

changeLanguage($get('lang') ?? '');
setSchema($get('scheme') ?? 'system');
const dire = $get('dire');
if (dire) setDirection(dire);

function highlight(noScroll?: boolean) {
	const id = decodeURIComponent(location.hash.slice(1));
	const target = document.getElementById(id);
	if (!target) return;
	if (!noScroll) target.scrollIntoView({ behavior: 'smooth' });
	target.animate([{}, { background: '#ff04' }, {}], {
		duration: 500,
		iterations: 3,
	});
}

setup({
	icons: { ui: PRESET_ICONS, ...ICONS },
	color: $get('theme') ?? undefined,
	locales: locale.patch(document.documentElement.lang, navigator.languages),
	localeLoader: (locale) => (LOCALES as any)[locale.toUpperCase()],
}).then(() => {
	initSearch();

	const nav = $('nav')!;
	const aside = $('aside')!;
	nav.prepend(
		<Button
			className="aside-toggle"
			flat
			$active={() => aside.classList.toggle('aside-open')}
		>
			{ico('nav')}
		</Button>,
	);
	nav.append(
		<Button
			className="cfg-toggle"
			flat
			$active={() => nav.classList.toggle('nav-open')}
		>
			{ico('settings')}
		</Button>,
		<div className="cfg">
			<DirectionSetter />
			<ThemeColorSetter />
			<ThemeSchemaSetter />
			<LanguageSetter />
		</div>,
	);

	initTabs();
	initCodeblock();
	initLinks();
	initFolds();

	const item = $(`a[href="${location.pathname}"]`);
	if (item) {
		for (const element of $path(item)) {
			if (!(element instanceof Collapsible)) continue;
			element.expanded = true;
		}
	}
	function nonNavigable(this: Navigable) {
		for (const item of $path(this)) {
			if (!(item instanceof Collapsible)) continue;
			if (item === this.parentNode?.parentNode) continue;
			if (!item.expanded) return true;
		}
		return false;
	}
	for (const item of $$<Navigable>('aside [nav]')) {
		state.hover.add(item);
		state.active.add(item);
		Object.defineProperty(item, 'nonNavigable', { get: nonNavigable });
	}

	highlight(true);
	$on(window, 'hashchange', () => highlight());
});
