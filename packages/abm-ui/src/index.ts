/** biome-ignore-all lint/performance/noBarrelFile: Required as the primary library entry point for exporting public API */
/** biome-ignore-all assist/source/organizeImports: There is a special sort */

import type {
	WidgetBtn,
	WidgetBtnEvents,
	WidgetBtnProp,
} from './components/widgets/btn';
import type {
	WidgetCheckbox,
	WidgetCheckboxEvents,
	WidgetCheckboxProp,
} from './components/widgets/checkbox';
import type {
	WidgetColor,
	WidgetColorEvents,
	WidgetColorProp,
} from './components/widgets/color';
import type {
	WidgetColorPicker,
	WidgetColorPickerEvents,
	WidgetColorPickerProp,
} from './components/widgets/color-picker';
import type {
	WidgetFile,
	WidgetFileEvents,
	WidgetFileProp,
} from './components/widgets/file';
import type {
	WidgetGamepad,
	WidgetGamepadProp,
} from './components/widgets/gamepad';
import type { WidgetGridData } from './components/widgets/grid-data';
import type {
	WidgetGridVirtual,
	WidgetGridVirtualProp,
} from './components/widgets/grid-virtual';
import type {
	WidgetHintGamepad,
	WidgetHintGamepadProp,
} from './components/widgets/hint/gamepad';
import type {
	WidgetHint,
	WidgetHintProp,
} from './components/widgets/hint/index';
import type {
	WidgetHintKey,
	WidgetHintKeyProp,
} from './components/widgets/hint/key';
import type {
	WidgetHintMouse,
	WidgetHintMouseProp,
} from './components/widgets/hint/mouse';
import type {
	WidgetHintPen,
	WidgetHintPenProp,
} from './components/widgets/hint/pen';
import type {
	WidgetHintTouch,
	WidgetHintTouchProp,
} from './components/widgets/hint/touch';
import type { WidgetIcon, WidgetIconProp } from './components/widgets/icon';
import type { WidgetInputEvents } from './components/widgets/input/base';
import type {
	WidgetNumber,
	WidgetNumberProp,
} from './components/widgets/input/number';
import type {
	WidgetPassword,
	WidgetPasswordProp,
} from './components/widgets/input/password';
import type {
	WidgetText,
	WidgetTextProp,
} from './components/widgets/input/text';
import type {
	WidgetTextField,
	WidgetTextFieldProp,
} from './components/widgets/input/text-field';
import type { WidgetLabel, WidgetLabelProp } from './components/widgets/label';
import type { WidgetLang, WidgetLangProp } from './components/widgets/lang';
import type {
	WidgetList,
	WidgetListEvents,
	WidgetListProp,
} from './components/widgets/list';
import type {
	WidgetListInfinite,
	WidgetListInfiniteProp,
} from './components/widgets/list-infinite';
import type {
	WidgetNav,
	WidgetNavEvents,
	WidgetNavProp,
} from './components/widgets/nav';
import type {
	WidgetProgressBar,
	WidgetProgressProp,
	WidgetProgressRing,
} from './components/widgets/progress';
import type {
	WidgetRange,
	WidgetRangeEvents,
	WidgetRangeProp,
} from './components/widgets/range';
import type {
	WidgetSelect,
	WidgetSelectEvents,
	WidgetSelectProp,
} from './components/widgets/select';
import type {
	WidgetSlider,
	WidgetSliderEvents,
	WidgetSliderProp,
} from './components/widgets/slider';
import type {
	WidgetSlider2D,
	WidgetSlider2DEvents,
	WidgetSlider2DProp,
} from './components/widgets/slider-2d';
import type {
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
export {
	KeysAllow,
	KEYS_ALLOW,
	KeyBindItem,
	KeyBindGroup,
	KeyBindMap,
	AliasItem,
	AliasMap,
	KeyBinderEvents,
	KeyboardEvents,
	keyboard,
} from './keyboard';
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
export * from './components/widgets/label';
export * from './components/widgets/file';
export * from './components/widgets/range';

// Prefabs
export * from './prefabs/base';
export * from './prefabs/slider-input';

// Utils
declare global {
	interface HTMLElementTagNameMap {
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
		'w-label': WidgetLabel;
		'w-file': WidgetFile;
		'w-range': WidgetRange;
	}
}
declare module 'abm-utils' {
	export interface HTMLElementProp {
		'w-lang': WidgetLangProp;
		'w-icon': WidgetIconProp;
		'w-progress-bar': WidgetProgressProp;
		'w-progress-ring': WidgetProgressProp;
		'w-btn': WidgetBtnProp;
		'w-list': WidgetListProp;
		'w-text': WidgetTextProp;
		'w-password': WidgetPasswordProp;
		'w-text-field': WidgetTextFieldProp;
		'w-number': WidgetNumberProp;
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
		'w-label': WidgetLabelProp;
		'w-file': WidgetFileProp;
		'w-range': WidgetRangeProp;
	}
	export interface HTMLElementEvents {
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
		'w-file': WidgetFileEvents;
		'w-range': WidgetRangeEvents;
	}
}

initContextMenu();
