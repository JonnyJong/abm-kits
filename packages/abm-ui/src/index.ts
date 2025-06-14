import { DOMApplyOptions } from 'abm-utils';
import { Widget } from './components/widgets/base';
import {
	WidgetBtn,
	WidgetBtnEvents,
	WidgetBtnProp,
} from './components/widgets/btn';
import {
	WidgetCheckbox,
	WidgetCheckboxEvents,
	WidgetCheckboxProp,
} from './components/widgets/checkbox';
import {
	WidgetColor,
	WidgetColorEvents,
	WidgetColorProp,
} from './components/widgets/color';
import {
	WidgetColorPicker,
	WidgetColorPickerEvents,
	WidgetColorPickerProp,
} from './components/widgets/color-picker';
import { WidgetGamepad, WidgetGamepadProp } from './components/widgets/gamepad';
import { WidgetGridData } from './components/widgets/grid-data';
import {
	WidgetGridVirtual,
	WidgetGridVirtualProp,
} from './components/widgets/grid-virtual';
import {
	WidgetHintGamepad,
	WidgetHintGamepadProp,
} from './components/widgets/hint/gamepad';
import { WidgetHint, WidgetHintProp } from './components/widgets/hint/index';
import {
	WidgetHintKey,
	WidgetHintKeyProp,
} from './components/widgets/hint/key';
import {
	WidgetHintMouse,
	WidgetHintMouseProp,
} from './components/widgets/hint/mouse';
import {
	WidgetHintPen,
	WidgetHintPenProp,
} from './components/widgets/hint/pen';
import {
	WidgetHintTouch,
	WidgetHintTouchProp,
} from './components/widgets/hint/touch';
import { WidgetIcon, WidgetIconProp } from './components/widgets/icon';
import {
	WidgetInputEvents,
	WidgetInputProp,
} from './components/widgets/input/base';
import {
	WidgetNumber,
	WidgetNumberProp,
} from './components/widgets/input/number';
import {
	WidgetPassword,
	WidgetPasswordProp,
} from './components/widgets/input/password';
import { WidgetText, WidgetTextProp } from './components/widgets/input/text';
import { WidgetTextField } from './components/widgets/input/text-field';
import { WidgetLang, WidgetLangProp } from './components/widgets/lang';
import {
	WidgetList,
	WidgetListEvents,
	WidgetListProp,
} from './components/widgets/list';
import {
	WidgetListInfinite,
	WidgetListInfiniteProp,
} from './components/widgets/list-infinite';
import {
	WidgetNav,
	WidgetNavEvents,
	WidgetNavProp,
} from './components/widgets/nav';
import {
	WidgetProgressBar,
	WidgetProgressProp,
	WidgetProgressRing,
} from './components/widgets/progress';
import {
	WidgetSelect,
	WidgetSelectEvents,
	WidgetSelectProp,
} from './components/widgets/select';
import {
	WidgetSlider,
	WidgetSliderEvents,
	WidgetSliderProp,
} from './components/widgets/slider';
import {
	WidgetSlider2D,
	WidgetSlider2DEvents,
	WidgetSlider2DProp,
} from './components/widgets/slider-2d';
import {
	WidgetSwitch,
	WidgetSwitchEvents,
	WidgetSwitchProp,
} from './components/widgets/switch';
import { initContextMenu } from './context-menu';

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
export * from './components/widgets/list-infinite';
export * from './components/widgets/grid-data';

// Utils
export interface WidgetTagNameMap {
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
	'w-list-infinite': WidgetListInfinite;
	'w-grid-data': WidgetGridData;
}
export type WidgetTagForType<E> = {
	[K in keyof WidgetTagNameMap]: E extends WidgetTagNameMap[K] ? K : never;
}[keyof WidgetTagNameMap];
export interface WidgetsPropMap {
	'w-lang': WidgetLangProp;
	'w-icon': WidgetIconProp;
	'w-progress-bar': WidgetProgressProp;
	'w-progress-ring': WidgetProgressProp;
	'w-btn': WidgetBtnProp;
	'w-list': WidgetListProp;
	'w-text': WidgetInputProp<string> & WidgetTextProp;
	'w-password': WidgetInputProp<string> & WidgetPasswordProp;
	'w-text-field': WidgetInputProp<string>;
	'w-number': WidgetInputProp<number> & WidgetNumberProp;
	'w-select': WidgetSelectProp;
	'w-nav': WidgetNavProp;
	'w-slider': WidgetSliderProp;
	'w-slider-2d': WidgetSlider2DProp;
	'w-switch': WidgetSwitchProp;
	'w-checkbox': WidgetCheckboxProp;
	'w-color-picker': WidgetColorPickerProp;
	'w-color': WidgetColorProp;
	'w-gamepad': WidgetGamepadProp;
	'w-hint-key': WidgetHintKeyProp;
	'w-hint-mouse': WidgetHintMouseProp;
	'w-hint-gamepad': WidgetHintGamepadProp;
	'w-hint-touch': WidgetHintTouchProp;
	'w-hint-pen': WidgetHintPenProp;
	'w-hint': WidgetHintProp;
	'w-grid-virtual': WidgetGridVirtualProp;
	'w-list-infinite': WidgetListInfiniteProp;
}
export interface WidgetsEventsMap {
	'w-btn': WidgetBtnEvents;
	'w-list': WidgetListEvents;
	'w-text': WidgetInputEvents<string, WidgetText>;
	'w-password': WidgetInputEvents<string, WidgetPassword>;
	'w-text-field': WidgetInputEvents<string, WidgetTextField>;
	'w-number': WidgetInputEvents<number, WidgetNumber>;
	'w-select': WidgetSelectEvents;
	'w-nav': WidgetNavEvents;
	'w-slider': WidgetSliderEvents;
	'w-slider-2d': WidgetSlider2DEvents;
	'w-switch': WidgetSwitchEvents;
	'w-checkbox': WidgetCheckboxEvents;
	'w-color-picker': WidgetColorPickerEvents;
	'w-color': WidgetColorEvents;
}
declare module 'abm-utils' {
	type PropForType<E extends Widget> =
		WidgetTagForType<E> extends keyof WidgetsPropMap
			? WidgetsPropMap[WidgetTagForType<E>]
			: Record<string, any>;
	type EventForType<E extends Widget> =
		WidgetTagForType<E> extends keyof WidgetsEventsMap
			? WidgetsEventsMap[WidgetTagForType<E>]
			: {};
	/**
	 * 应用配置到 DOM 元素
	 * @param target - 目标 DOM 元素
	 * @param options - 配置
	 */
	export function $apply<E extends Widget = Widget>(
		target: E,
		options: DOMApplyOptions<E, PropForType<E>, EventForType<E>>,
	): E;
	/**
	 * 创建 DOM 元素并应用配置
	 * @param tag 标签名
	 * @param options 选项
	 * @param content 内容
	 */
	export function $new<
		E extends WidgetTagNameMap[K],
		O,
		K extends keyof WidgetTagNameMap = keyof WidgetTagNameMap,
	>(
		tag: K,
		options?: O extends HTMLElement | string
			? O
			: DOMApplyOptions<
					E,
					K extends keyof WidgetsPropMap ? WidgetsPropMap[K] : {},
					K extends keyof WidgetsEventsMap ? WidgetsEventsMap[K] : {}
				>,
		...content: (HTMLElement | string)[]
	): E;
}

initContextMenu();
