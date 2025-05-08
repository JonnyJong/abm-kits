import { DEFAULTS_ICONS, DEFAULT_LOCALES_FLAT, configs } from 'abm-ui';
import * as UI from 'abm-ui';
import * as Utils from 'abm-utils';
import { $$, FlatLocaleSource, createSimpleLocaleDriver } from 'abm-utils';
import { initDialog } from './components/dialog';
import { initTooltips } from './components/tooltips';
import { initBtn } from './components/widgets/btn';
import { initCheckbox } from './components/widgets/checkbox';
import { initColor } from './components/widgets/color';
import { initColorPicker } from './components/widgets/color-picker';
import { initGridVirtual } from './components/widgets/grid-virtual';
import { initHintKey } from './components/widgets/hint-key';
import { initIcon } from './components/widgets/icon';
import { initInput } from './components/widgets/input';
import { initLang } from './components/widgets/lang';
import { initList } from './components/widgets/list';
import { initListInfinite } from './components/widgets/list-infinite';
import { initNav } from './components/widgets/nav';
import { initProg } from './components/widgets/progress';
import { initSelect } from './components/widgets/select';
import { initSlider } from './components/widgets/slider';
import { initSlider2D } from './components/widgets/slider-2d';
import { initSwitch } from './components/widgets/switch';
import { initEvents } from './events';
import { initKeyboard } from './keyboard';
import { initSettings } from './settings';

//#region Export
(window as any).UI = UI;
(window as any).Utils = Utils;

//#region Configs
const LOCALES: Record<string, FlatLocaleSource<string>> = {
	zh: {
		// Basic
		...DEFAULT_LOCALES_FLAT.zh,
		// Other
		'dev.properties': '属性',
		'dev.events': '事件',
		'dev.ops': '操作',
		'dev.widget.select': '选项 ${i}',
	},
	en: {
		// Basic
		...DEFAULT_LOCALES_FLAT.en,
		// Other
		'dev.properties': 'Properties',
		'dev.events': 'Events',
		'dev.ops': 'Operations',
		'dev.widget.select': 'Option ${i}',
	},
};

configs.init({
	locale: createSimpleLocaleDriver((_namespace, locale) => {
		if (locale in LOCALES) return LOCALES[locale];
		return null;
	}),
	icon: $$<HTMLLinkElement>('link[rel="stylesheet"]')
		.map((e) => [...e.sheet!.cssRules].map((rule) => rule.cssText).join(''))
		.map((css) => {
			const sheet = new CSSStyleSheet();
			sheet.replaceSync(css);
			return sheet;
		}),
	defaults: DEFAULTS_ICONS,
});

//#region Components
//#region Widgets
document.addEventListener('DOMContentLoaded', () => {
	initSettings();
	initEvents();
	initKeyboard();
	initTooltips();
	initDialog();
	// Widget
	initLang();
	initIcon();
	initProg();
	initBtn();
	initList();
	initInput();
	initSelect();
	initNav();
	initSlider();
	initSlider2D();
	initSwitch();
	initCheckbox();
	initColorPicker();
	initColor();
	initHintKey();
	initGridVirtual();
	initListInfinite();
});
