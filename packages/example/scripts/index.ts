import { configs } from 'abm-ui';
import * as UI from 'abm-ui';
import * as Utils from 'abm-utils';
import { $$, $ready } from 'abm-utils';
import { initDialog } from './components/dialog';
import { initTooltips } from './components/tooltips';
import { initBtn } from './components/widgets/btn';
import { initCheckbox } from './components/widgets/checkbox';
import { initColor } from './components/widgets/color';
import { initColorPicker } from './components/widgets/color-picker';
import { initFile } from './components/widgets/file';
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
import { initRange } from './components/widgets/range';
import { initSelect } from './components/widgets/select';
import { initSlider } from './components/widgets/slider';
import { initSlider2D } from './components/widgets/slider-2d';
import { initSwitch } from './components/widgets/switch';
import { initEvents } from './events';
import { initKeyboard } from './keyboard';
import { initLocale } from './locales';
import { initSettings } from './settings';

//#region Export
(window as any).UI = UI;
(window as any).Utils = Utils;

//#region Configs

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

initLocale();

//#region Components
//#region Widgets
$ready(() => {
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
	initFile();
	initRange();
});
