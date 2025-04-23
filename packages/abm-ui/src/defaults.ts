import { UIDefaultsIcons } from './configs';
import { UIDefaultDict } from './locale';

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
	});

export const DEFAULT_LOCALES: Readonly<
	Record<'zh' | 'en', Readonly<UIDefaultDict>>
> = Object.freeze({
	zh: Object.freeze({
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
	}),
	en: Object.freeze({
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
	}),
});
