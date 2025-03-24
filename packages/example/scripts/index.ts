import { UIDefaultDict, configs, locale } from 'abm-ui';
import * as UI from 'abm-ui';
import * as Utils from 'abm-utils';
import { $$, createLocaleDict } from 'abm-utils';
import { initDialog } from './components/dialog';
import { initTooltips } from './components/tooltips';
import { initBtn } from './components/widgets/btn';
import { initCheckbox } from './components/widgets/checkbox';
import { initColor } from './components/widgets/color';
import { initColorPicker } from './components/widgets/color-picker';
import { initHintKey } from './components/widgets/hint-key';
import { initIcon } from './components/widgets/icon';
import { initInput } from './components/widgets/input';
import { initLang } from './components/widgets/lang';
import { initList } from './components/widgets/list';
import { initNav } from './components/widgets/nav';
import { initProg } from './components/widgets/progress';
import { initSelect } from './components/widgets/select';
import { initSlider } from './components/widgets/slider';
import { initSlider2D } from './components/widgets/slider-2d';
import { initSwitch } from './components/widgets/switch';
import { initSettings } from './settings';

//#region Export
(window as any).UI = UI;
(window as any).Utils = Utils;

//#region Configs
const LOCALES: Record<string, UIDefaultDict> &
	Record<string, Record<string, string>> = {
	zh: {
		// Basic
		'ui.confirm': '确定',
		'ui.cancel': '取消',
		'ui.ok': '好',
		'ui.color_picker': '颜色选择器',
		'ui.alpha': '不透明度',
		'ui.red': '红',
		'ui.green': '绿',
		'ui.blue': '蓝',
		'ui.hue': '色相',
		'ui.saturation': '饱和度',
		'ui.lightness': '亮度',
		// Other
		'dev.properties': '属性',
		'dev.events': '事件',
		'dev.ops': '操作',
	},
	en: {
		// Basic
		'ui.confirm': 'Confirm',
		'ui.cancel': 'Cancel',
		'ui.ok': 'OK',
		'ui.color_picker': 'Color Picker',
		'ui.alpha': 'Alpha',
		'ui.red': 'Red',
		'ui.green': 'Green',
		'ui.blue': 'Blue',
		'ui.hue': 'Hue',
		'ui.saturation': 'Saturation',
		'ui.lightness': 'Lightness',
		// Other
		'dev.properties': 'Properties',
		'dev.events': 'Events',
		'dev.ops': 'Operations',
	},
};

configs.init({
	locale: {
		'': createLocaleDict(
			locale.prefers[0].split('-')[0] === 'zh' ? LOCALES.zh : LOCALES.en,
		),
	},
	icon: $$<HTMLLinkElement>('#link-icon')
		.map((e) => [...e.sheet!.cssRules].map((rule) => rule.cssText).join(''))
		.map((css) => {
			const sheet = new CSSStyleSheet();
			sheet.replaceSync(css);
			return sheet;
		}),
	defaults: {
		increase: 'Add',
		decrease: 'Subtract',
		calculate: 'Calculator',
		selectExpand: 'ChevronUpDown',
		keyDisallow: 'ErrorCircle',
		keyTab: 'KeyboardTab',
		keyEnter: 'KeyboardTab',
		keyShift: 'KeyboardShiftUppercase',
		keyNumpadAdd: 'Add',
		keyNumpadSubtract: 'Subtract',
		keyNumpadMultiply: 'Dismiss',
		keyNumpadDivide: 'SlashForward',
		keyArrowUp: 'ArrowUp',
		keyArrowRight: 'ArrowRight',
		keyArrowDown: 'ArrowDown',
		keyArrowLeft: 'ArrowLeft',
		keySpace: 'Spacebar',
		keyHome: 'Home',
		keyBackspace: 'Backspace',
		up: 'ChevronUp',
		right: 'ChevronRight',
		down: 'ChevronDown',
		left: 'ChevronLeft',
		gamepadStart: 'Navigation',
		gamepadBack: 'SquareMultiple',
	},
});

//#region Components
//#region Widgets
document.addEventListener('DOMContentLoaded', () => {
	initSettings();
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
});
