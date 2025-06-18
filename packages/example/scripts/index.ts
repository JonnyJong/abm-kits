import { DEFAULT_LOCALES_FLAT, configs } from 'abm-ui';
import * as UI from 'abm-ui';
import * as Utils from 'abm-utils';
import { $$, FlatLocaleSource, createSimpleLocaleDriver } from 'abm-utils';
import { initDialog } from './components/dialog';
import { initTooltips } from './components/tooltips';
import { initBtn } from './components/widgets/btn';
import { initCheckbox } from './components/widgets/checkbox';
import { initColor } from './components/widgets/color';
import { initColorPicker } from './components/widgets/color-picker';
import { initGridData } from './components/widgets/grid-data';
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
		'dev.empty': '',
		'dev.components.tooltips.content': '工具提示内容',
		'dev.components.dialog.title': '标题',
		'dev.components.dialog.content': '内容（HTML）',
		'dev.components.dialog.color': '主题色',
		'dev.components.dialog.normal': '创建普通对话框',
		'dev.components.dialog.confirm': '创建确认对话框',
		'dev.components.dialog.alert': '创建警告对话框',
	},
	en: {
		// Basic
		...DEFAULT_LOCALES_FLAT.en,
		// Other
		'dev.properties': 'Properties',
		'dev.events': 'Events',
		'dev.ops': 'Operations',
		'dev.widget.select': 'Option ${i}',
		'dev.empty': '',
		'dev.components.tooltips.content': 'Tooltips content',
		'dev.components.dialog.title': 'Title',
		'dev.components.dialog.content': 'Content (HTML)',
		'dev.components.dialog.color': 'Theme color',
		'dev.components.dialog.normal': 'Create Normal Dialog',
		'dev.components.dialog.confirm': 'Create Confirm Dialog',
		'dev.components.dialog.alert': 'Create Alert Dialog',
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
	keyAlias: {
		'ui.up': new Set(['ArrowUp', 'KeyW']),
		'ui.right': new Set(['ArrowRight', 'KeyD']),
		'ui.down': new Set(['ArrowDown', 'KeyS']),
		'ui.left': new Set(['ArrowLeft', 'KeyA']),
	},
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
	initGridData();
});
