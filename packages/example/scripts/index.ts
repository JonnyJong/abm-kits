import {
	DEFAULT_LOCALE_DICTS,
	UIDefaultLocaleDict,
	configs,
	defaultLocale,
} from 'abm-ui';
import * as UI from 'abm-ui';
import * as Utils from 'abm-utils';
import { $$, LocaleDict, defineTranslation as dt } from 'abm-utils';
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
declare module 'abm-ui' {
	export interface UIDefaultLocaleDict extends LocaleDict {
		dev: {
			properties: string;
			events: string;
			ops: string;
			widget: { select: [string, { i?: Intl.NumberFormatOptions }] };
			empty: '';
			components: {
				tooltips: { content: string };
				dialog: {
					title: string;
					content: string;
					color: string;
					normal: string;
					confirm: string;
					alert: string;
				};
			};
		};
	}
}

const LOCALE_DICTS: Record<string, UIDefaultLocaleDict> = {
	zh: {
		...DEFAULT_LOCALE_DICTS.zh,
		dev: {
			properties: '属性',
			events: '事件',
			ops: '操作',
			widget: {
				select: dt('选项 {i}', {}),
			},
			empty: '',
			components: {
				tooltips: { content: '工具提示内容' },
				dialog: {
					title: '标题',
					content: '内容（HTML）',
					color: '主题色',
					normal: '创建普通对话框',
					confirm: '创建确认对话框',
					alert: '创建警告对话框',
				},
			},
		},
	},
	en: {
		...DEFAULT_LOCALE_DICTS.en,
		dev: {
			properties: 'Properties',
			events: 'Events',
			ops: 'Operations',
			widget: {
				select: dt('Option {i}', {}),
			},
			empty: '',
			components: {
				tooltips: { content: 'Tooltips content' },
				dialog: {
					title: 'Title',
					content: 'Content (HTML)',
					color: 'Theme color',
					normal: 'Create Normal Dialog',
					confirm: 'Create Confirm Dialog',
					alert: 'Create Alert Dialog',
				},
			},
		},
	},
};

configs.init({
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

defaultLocale.loader = (locale) => LOCALE_DICTS[locale] ?? null;

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
