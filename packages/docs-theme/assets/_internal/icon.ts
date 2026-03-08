import type { IconDict, IconPackageDefine, PresetIcons } from 'abm-ui';
import Add from '../../node_modules/@fluentui/svg-icons/icons/add_20_regular.svg';
import ArrowDown from '../../node_modules/@fluentui/svg-icons/icons/arrow_down_20_regular.svg';
import ArrowEnterLeft from '../../node_modules/@fluentui/svg-icons/icons/arrow_enter_left_20_regular.svg';
import ArrowLeft from '../../node_modules/@fluentui/svg-icons/icons/arrow_left_20_regular.svg';
import ArrowRight from '../../node_modules/@fluentui/svg-icons/icons/arrow_right_20_regular.svg';
import ArrowUp from '../../node_modules/@fluentui/svg-icons/icons/arrow_up_20_regular.svg';
import Backspace from '../../node_modules/@fluentui/svg-icons/icons/backspace_20_regular.svg';
import Checkmark from '../../node_modules/@fluentui/svg-icons/icons/checkmark_20_regular.svg';
import CheckmarkCircle from '../../node_modules/@fluentui/svg-icons/icons/checkmark_circle_20_regular.svg';
import ChevronDown from '../../node_modules/@fluentui/svg-icons/icons/chevron_down_20_regular.svg';
import ChevronLeft from '../../node_modules/@fluentui/svg-icons/icons/chevron_left_20_regular.svg';
import ChevronRight from '../../node_modules/@fluentui/svg-icons/icons/chevron_right_20_regular.svg';
import ChevronUpDown from '../../node_modules/@fluentui/svg-icons/icons/chevron_up_down_20_regular.svg';
import ClipboardError from '../../node_modules/@fluentui/svg-icons/icons/clipboard_error_20_regular.svg';
import Code from '../../node_modules/@fluentui/svg-icons/icons/code_20_regular.svg';
import Color from '../../node_modules/@fluentui/svg-icons/icons/color_20_regular.svg';
import Copy from '../../node_modules/@fluentui/svg-icons/icons/copy_20_regular.svg';
import DarkTheme from '../../node_modules/@fluentui/svg-icons/icons/dark_theme_20_regular.svg';
import Dismiss from '../../node_modules/@fluentui/svg-icons/icons/dismiss_20_regular.svg';
import Document from '../../node_modules/@fluentui/svg-icons/icons/document_20_regular.svg';
import ErrorCircle from '../../node_modules/@fluentui/svg-icons/icons/error_circle_20_regular.svg';
import Home from '../../node_modules/@fluentui/svg-icons/icons/home_20_regular.svg';
import KeyboardShift from '../../node_modules/@fluentui/svg-icons/icons/keyboard_shift_20_regular.svg';
import KeyboardTab from '../../node_modules/@fluentui/svg-icons/icons/keyboard_tab_20_regular.svg';
import Navigation from '../../node_modules/@fluentui/svg-icons/icons/navigation_20_regular.svg';
import Settings from '../../node_modules/@fluentui/svg-icons/icons/settings_20_regular.svg';
import SlashForward from '../../node_modules/@fluentui/svg-icons/icons/slash_forward_20_regular.svg';
import Spacebar from '../../node_modules/@fluentui/svg-icons/icons/spacebar_20_regular.svg';
import Subtract from '../../node_modules/@fluentui/svg-icons/icons/subtract_20_regular.svg';
import TriangleLeft from '../../node_modules/@fluentui/svg-icons/icons/triangle_left_20_regular.svg';
import TriangleRight from '../../node_modules/@fluentui/svg-icons/icons/triangle_right_20_regular.svg';
import Warning from '../../node_modules/@fluentui/svg-icons/icons/warning_20_regular.svg';
import WeatherMoon from '../../node_modules/@fluentui/svg-icons/icons/weather_moon_20_regular.svg';
import WeatherSunny from '../../node_modules/@fluentui/svg-icons/icons/weather_sunny_20_regular.svg';

declare module 'abm-ui' {
	interface IconRegistry extends IconPackageDefine<typeof ICONS> {}
}

export const ICONS = {
	scheme: {
		auto: DarkTheme,
		light: WeatherSunny,
		dark: WeatherMoon,
	},
	color: Color,
	nav: Navigation,
	settings: Settings,
	copy: Copy,
	copied: Checkmark,
	copyFailed: ClipboardError,
	collapse: ChevronRight,
	code: Code,
} as const satisfies IconDict;

/** 预设图标 */
export const PRESET_ICONS: PresetIcons = {
	selectExpand: ChevronUpDown,
	increase: Add,
	decrease: Subtract,
	success: CheckmarkCircle,
	warn: Warning,
	error: ErrorCircle,
	increasing: ChevronDown,
	file: Document,
	removeFile: Dismiss,
	keyInvalid: ErrorCircle,
	keyTab: KeyboardTab,
	keyEnter: ArrowEnterLeft,
	keyNumpadAdd: Add,
	keyNumpadSubtract: Subtract,
	keyNumpadMultiply: Dismiss,
	keyNumpadDivide: SlashForward,
	keyArrowUp: ArrowUp,
	keyArrowRight: ArrowRight,
	keyArrowDown: ArrowDown,
	keyArrowLeft: ArrowLeft,
	keySpace: Spacebar,
	keyHome: Home,
	keyBackspace: Backspace,
	keyShift: KeyboardShift,
	keyBack: TriangleLeft,
	keyStart: TriangleRight,
	menuEnter: ChevronRight,
	menuBack: ChevronLeft,
	menuCheckmark: Checkmark,
	dialogClose: Dismiss,
};
