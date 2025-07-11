import { UIDefaultsIcons } from './configs';
import { UIDefaultLocaleDict } from './locale';

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
		file: 'Document',
		addFile: 'Add',
		removeFile: 'Subtract',
		pickFile: 'DocumentArrowUp',
		clearFile: 'Dismiss',
	});

export const DEFAULT_LOCALE_DICTS = {
	zh: {
		ui: {
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
			file: {
				pick: '选取文件',
				add: '添加文件',
				clear: '移除所有文件',
			},
		},
	},
	en: {
		ui: {
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
			file: {
				pick: 'Pick Files',
				add: 'Add Files',
				clear: 'Remove All Files',
			},
		},
	},
} as const satisfies Record<string, UIDefaultLocaleDict>;
