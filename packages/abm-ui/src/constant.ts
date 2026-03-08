import type { LocaleDict, LocalePackage, LocaleVariant } from 'abm-utils';
import type { KeyCode } from './input/keyboard';

declare module 'abm-utils' {
	interface LocaleRegistry extends LocalePackage<typeof LOCALE_ZH> {}
}

export const CONSTANTS = {
	NAV_ACTIVE: 'ui.nav.active',
	NAV_CANCEL: 'ui.nav.cancel',
	NAV_UP: 'ui.nav.up',
	NAV_RIGHT: 'ui.nav.right',
	NAV_DOWN: 'ui.nav.down',
	NAV_LEFT: 'ui.nav.left',
} as const;

const SHORTCUT: Record<string, KeyCode[]> = {
	'ui.nav.prev': ['ShiftLeft', 'Tab'],
	'ui.nav.next': ['Tab'],
	// 'ui.nav.up': ['ArrowUp'],
	// 'ui.nav.right-up': ['ArrowUp', 'ArrowRight'],
	// 'ui.nav.right': ['ArrowRight'],
	// 'ui.nav.right-down': ['ArrowDown', 'ArrowRight'],
	// 'ui.nav.down': ['ArrowDown'],
	// 'ui.nav.left-down': ['ArrowDown', 'ArrowLeft'],
	// 'ui.nav.left': ['ArrowLeft'],
	// 'ui.nav.left-up': ['ArrowUp', 'ArrowLeft'],
};

const ALIAS: Record<string, KeyCode[]> = {
	[CONSTANTS.NAV_ACTIVE]: ['Enter', 'Space'],
	[CONSTANTS.NAV_CANCEL]: ['Escape'],
	[CONSTANTS.NAV_UP]: ['ArrowUp'],
	[CONSTANTS.NAV_RIGHT]: ['ArrowRight'],
	[CONSTANTS.NAV_DOWN]: ['ArrowDown'],
	[CONSTANTS.NAV_LEFT]: ['ArrowLeft'],
	'ui.select.multi': ['ControlLeft', 'ControlRight'],
	'ui.select.range': ['ShiftLeft', 'ShiftRight'],
};

const LOCALE_ZH = Object.freeze({
	ui: {
		confirm: '确定',
		cancel: '取消',
		ok: '好的',
		colorPicker: '颜色选择器',
		alpha: '不透明度',
		red: '红',
		green: '绿',
		blue: '蓝',
		hue: '色相',
		saturation: '饱和度',
		lightness: '亮度',
		chroma: '色度',
		file: {
			pick: '选取文件',
			add: '添加文件',
			clear: '移除所有文件',
		},
	},
} as const satisfies LocaleDict);

const LOCALE_EN: LocaleVariant<typeof LOCALE_ZH> = Object.freeze({
	ui: {
		confirm: 'Confirm',
		cancel: 'Cancel',
		ok: 'OK',
		colorPicker: 'Color Picker',
		alpha: 'Alpha',
		red: 'Red',
		green: 'Green',
		blue: 'Blue',
		hue: 'Hue',
		saturation: 'Saturation',
		lightness: 'Lightness',
		chroma: 'Chroma',
		file: {
			pick: 'Pick Files',
			add: 'Add Files',
			clear: 'Remove All Files',
		},
	},
});

export const DEFAULT = { SHORTCUT, ALIAS, LOCALE_ZH, LOCALE_EN };

/** 本地化语言 */
export const LOCALES = Object.freeze({
	/** 简体中文 */
	ZH: DEFAULT.LOCALE_ZH,
	/** English */
	EN: DEFAULT.LOCALE_EN,
});
