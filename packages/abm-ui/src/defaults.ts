import { FlatLocaleSource } from 'abm-utils';
import { UIDefaultsIcons } from './configs';
import { UIDefaultFlatLocaleKeys, UIDefaultLocaleKeys } from './locale';

function flat(
	locale: Readonly<{ [key in UIDefaultLocaleKeys]: string }>,
): Readonly<FlatLocaleSource<string, UIDefaultFlatLocaleKeys>> {
	const result: FlatLocaleSource<string, UIDefaultFlatLocaleKeys> = {} as any;
	for (const [key, value] of Object.entries(locale)) {
		result[`ui.${key as UIDefaultLocaleKeys}`] = value;
	}
	return Object.freeze(result);
}

export const DEFAULTS_ICONS: Readonly<Record<UIDefaultsIcons, string>> =
	Object.freeze({
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
		orderDesc: 'ChevronDown',
	});

export const DEFAULT_LOCALES_NESTED: Readonly<
	Record<
		'zh' | 'en',
		Readonly<{ ui: Readonly<{ [key in UIDefaultLocaleKeys]: string }> }>
	>
> = Object.freeze({
	zh: Object.freeze({
		ui: Object.freeze({
			confirm: '确定',
			cancel: '取消',
			ok: '好',
			color_picker: '颜色选择器',
			alpha: '不透明度',
			red: '红',
			green: '绿',
			blue: '蓝',
			hue: '色相',
			saturation: '饱和度',
			lightness: '亮度',
		}),
	}),
	en: Object.freeze({
		ui: Object.freeze({
			confirm: 'Confirm',
			cancel: 'Cancel',
			ok: 'OK',
			color_picker: 'Color Picker',
			alpha: 'Alpha',
			red: 'Red',
			green: 'Green',
			blue: 'Blue',
			hue: 'Hue',
			saturation: 'Saturation',
			lightness: 'Lightness',
		}),
	}),
});

export const DEFAULT_LOCALES_FLAT: Readonly<
	Record<
		'zh' | 'en',
		Readonly<FlatLocaleSource<string, UIDefaultFlatLocaleKeys>>
	>
> = Object.freeze({
	zh: flat(DEFAULT_LOCALES_NESTED.zh.ui),
	en: flat(DEFAULT_LOCALES_NESTED.en.ui),
});
