import { DOMApplyOptions } from 'abm-utils';
import { WidgetBtn } from './components/widgets/btn';
import { WidgetCheckbox } from './components/widgets/checkbox';
import { WidgetColor } from './components/widgets/color';
import { WidgetColorPicker } from './components/widgets/color-picker';
import { WidgetGamepad } from './components/widgets/gamepad';
import { WidgetGridVirtual } from './components/widgets/grid-virtual';
import { WidgetHintGamepad } from './components/widgets/hint/gamepad';
import { WidgetHint } from './components/widgets/hint/index';
import { WidgetHintKey } from './components/widgets/hint/key';
import { WidgetHintMouse } from './components/widgets/hint/mouse';
import { WidgetHintPen } from './components/widgets/hint/pen';
import { WidgetHintTouch } from './components/widgets/hint/touch';
import { WidgetIcon } from './components/widgets/icon';
import { WidgetNumber } from './components/widgets/input/number';
import { WidgetPassword } from './components/widgets/input/password';
import { WidgetText } from './components/widgets/input/text';
import { WidgetTextField } from './components/widgets/input/text-field';
import { WidgetLang } from './components/widgets/lang';
import { WidgetList } from './components/widgets/list';
import { WidgetNav } from './components/widgets/nav';
import {
	WidgetProgressBar,
	WidgetProgressRing,
} from './components/widgets/progress';
import { WidgetSelect } from './components/widgets/select';
import { WidgetSlider } from './components/widgets/slider';
import { WidgetSlider2D } from './components/widgets/slider-2d';
import { WidgetSwitch } from './components/widgets/switch';

// Global
export * from './defaults';
export * from './configs';
export * from './locale';

// Event
export * from './events';
// Provided Event API
export * from './events/base';

// Control
export * from './keyboard';
export * from './game-controller';
export * from './navigate';

// Components
export * from './components/content';
export * from './components/tooltips';
export * from './components/dialog';
// Widgets
export * from './components/widgets/base';
export * from './components/widgets/lang';
export * from './components/widgets/icon';
export * from './components/widgets/progress';
export * from './components/widgets/btn';
export * from './components/widgets/list';
export {
	WidgetInput,
	WidgetInputProp,
	WidgetInputEvents,
	WidgetInputValue,
} from './components/widgets/input/base';
export { IWidgetInputAutoFillItem } from './components/widgets/input/autofill';
export { WidgetInputActionItem } from './components/widgets/input/actions';
export * from './components/widgets/input/text';
export * from './components/widgets/input/password';
export * from './components/widgets/input/text-field';
export * from './components/widgets/input/number';
export * from './components/widgets/select';
export * from './components/widgets/nav';
export * from './components/widgets/slider';
export * from './components/widgets/slider-2d';
export * from './components/widgets/switch';
export * from './components/widgets/checkbox';
export * from './components/widgets/color-picker';
export * from './components/widgets/color';
export * from './components/widgets/gamepad';
export * from './components/widgets/hint/key';
export * from './components/widgets/hint/mouse';
export * from './components/widgets/hint/gamepad';
export * from './components/widgets/hint/touch';
export * from './components/widgets/hint/pen';
export * from './components/widgets/hint/index';
export * from './components/widgets/grid-virtual';

// Utils
export interface WidgetsTagNameMap {
	'w-lang': WidgetLang;
	'w-icon': WidgetIcon;
	'w-progress-bar': WidgetProgressBar;
	'w-progress-ring': WidgetProgressRing;
	'w-btn': WidgetBtn;
	'w-list': WidgetList;
	'w-text': WidgetText;
	'w-password': WidgetPassword;
	'w-text-field': WidgetTextField;
	'w-number': WidgetNumber;
	'w-select': WidgetSelect;
	'w-nav': WidgetNav;
	'w-slider': WidgetSlider;
	'w-slider-2d': WidgetSlider2D;
	'w-switch': WidgetSwitch;
	'w-checkbox': WidgetCheckbox;
	'w-color-picker': WidgetColorPicker;
	'w-color': WidgetColor;
	'w-gamepad': WidgetGamepad;
	'w-hint-key': WidgetHintKey;
	'w-hint-mouse': WidgetHintMouse;
	'w-hint-gamepad': WidgetHintGamepad;
	'w-hint-touch': WidgetHintTouch;
	'w-hint-pen': WidgetHintPen;
	'w-hint': WidgetHint;
	'w-grid-virtual': WidgetGridVirtual;
}
declare module 'abm-utils' {
	export function $new<K extends keyof WidgetsTagNameMap>(
		tag: K,
	): WidgetsTagNameMap[K];
	export function $new<K extends keyof WidgetsTagNameMap>(
		tag: K,
		options: DOMApplyOptions<WidgetsTagNameMap[K]>,
	): WidgetsTagNameMap[K];
	export function $new<K extends keyof WidgetsTagNameMap>(
		tag: K,
		...content: (string | HTMLElement)[]
	): WidgetsTagNameMap[K];
	export function $new<K extends keyof WidgetsTagNameMap>(
		tag: K,
		options: DOMApplyOptions<WidgetsTagNameMap[K]>,
		...content: (string | HTMLElement)[]
	): WidgetsTagNameMap[K];
}

// TODO: （右键）菜单
window.addEventListener('contextmenu', (ev) => ev.preventDefault());
