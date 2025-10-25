import { Signal } from '@lit-labs/signals';
import {
	$apply,
	$div,
	$ready,
	type ArrayOr,
	asArray,
	Color,
	type CSSProperty,
	callTask,
	Debounce,
	IterableWeakSet,
	normalizeCSSFourValue,
	type PromiseOr,
	type ProxyObjectOptions,
	proxyObject,
	type Rect,
	type RGB,
	type RGBA,
	range,
	runTask,
} from 'abm-utils';
import type { CSSResult } from 'lit';
import { DEFAULTS_ICONS } from './defaults';
import {
	type AliasItem,
	DEFAULT_ALIAS_MAP,
	DEFAULT_SHORTCUT_MAP,
	type KeyBindGroup,
	keyboard,
} from './keyboard';

//#region #Icon

export type UIIconCSS = CSSStyleSheet | CSSResult | string | URL;

export const DEFAULTS_ICONS_NAMES = Object.freeze([
	'increase',
	'decrease',
	'calculate',
	'selectExpand',
	'keyDisallow',
	'keyTab',
	'keyEnter',
	'keyShift',
	'keyNumpadAdd',
	'keyNumpadSubtract',
	'keyNumpadMultiply',
	'keyNumpadDivide',
	'keyArrowUp',
	'keyArrowRight',
	'keyArrowDown',
	'keyArrowLeft',
	'keySpace',
	'keyHome',
	'keyBackspace',
	'up',
	'right',
	'down',
	'left',
	'gamepadStart',
	'gamepadBack',
	'orderDesc',
	'file',
	'addFile',
	'removeFile',
	'pickFile',
	'clearFile',
] as const) satisfies readonly string[];
export type UIDefaultsIcons = (typeof DEFAULTS_ICONS_NAMES)[number];

class UIIconConfigs {
	//#region Default Namespace
	#defaultNamespace = 'icon';
	/** 默认命名空间 */
	get defaultNamespace() {
		return this.#defaultNamespace;
	}
	set defaultNamespace(value: string) {
		this.#defaultNamespace = value;
	}
	//#region Icon Packs
	#styles = new Set<CSSStyleSheet>();
	#signal = new Signal.State(0);
	#computed = new Signal.Computed(() => {
		this.#signal.get();
		return [...this.#styles];
	});
	#update() {
		this.#signal.set(this.#signal.get() + 1);
	}
	#addFromString(text: string) {
		const sheet = new CSSStyleSheet();
		sheet.replaceSync(text);
		this.#add(sheet);
	}
	#addFromURL(url: URL) {
		console.log(url);

		fetch(url)
			.then((res) => res.text())
			.then((text) => this.#addFromString(text))
			.then(() => this.#update());
	}
	#add(style: CSSStyleSheet | CSSResult) {
		if ((style as CSSResult)?.styleSheet instanceof CSSStyleSheet)
			style = (style as CSSResult).styleSheet as CSSStyleSheet;
		if (!(style instanceof CSSStyleSheet)) return;
		this.#styles.add(style);
		return;
	}
	/** 添加图标样式表 */
	add(...styles: UIIconCSS[]) {
		for (const style of styles) {
			if (typeof style === 'string') {
				this.#addFromString(style);
				continue;
			}
			if (style instanceof URL) {
				this.#addFromURL(style);
				continue;
			}
			this.#add(style);
		}
		this.#update();
	}
	/** 删除图标样式表 */
	delete(style: CSSStyleSheet) {
		this.#styles.delete(style);
		this.#update();
	}
	/** 遍历图标样式表 */
	entries() {
		return this.#styles.values();
	}
	/** 获取图标样式表 */
	get() {
		return this.#computed.get();
	}
	/** 获取图标样式表信号 */
	get signal() {
		return this.#computed;
	}
	//#region Defaults Icons
	#defaultsIconUpdateHandler: ProxyObjectOptions<
		Record<UIDefaultsIcons, string>
	>['update'] = (_, p, value) => {
		if (!value) return;
		if (!DEFAULTS_ICONS_NAMES.includes(p as any)) return;

		for (const handler of this.#subscriptions[p as UIDefaultsIcons]) {
			runTask(handler);
		}
	};
	#defaults = proxyObject<Record<UIDefaultsIcons, string>>(
		{
			update: this.#defaultsIconUpdateHandler,
			handler: {
				deleteProperty() {
					return false;
				},
				set: (target, p, newValue, receiver) => {
					if (typeof newValue !== 'string') return false;
					if (!DEFAULTS_ICONS_NAMES.includes(p as any)) return false;
					const result = Reflect.set(target, p, newValue, receiver);
					for (const handler of this.#defaultSubscriptions.get(p as any) ?? []) {
						callTask(handler);
					}
					return result;
				},
			},
		},
		{ ...DEFAULTS_ICONS },
	);
	/** 默认图标 */
	get defaults(): Record<UIDefaultsIcons, string> {
		return this.#defaults;
	}
	set defaults(value: {
		[Key in UIDefaultsIcons]?: string;
	}) {
		if (typeof value !== 'object') return;

		for (const key of DEFAULTS_ICONS_NAMES) {
			if (typeof value[key] !== 'string') continue;
			this.#defaults[key] = value[key];
		}
	}
	#subscriptions: Record<UIDefaultsIcons, IterableWeakSet<Function>> = (() => {
		const defaults = {} as Record<UIDefaultsIcons, IterableWeakSet<Function>>;
		for (const key of DEFAULTS_ICONS_NAMES) {
			defaults[key] = new IterableWeakSet();
		}
		return defaults;
	})();
	/** 监听命名空间更新 */
	on(name: UIDefaultsIcons, handler: Function) {
		if (!this.#subscriptions[name]) return;
		if (typeof handler !== 'function') return;
		this.#subscriptions[name].add(handler);
	}
	/** 移除命名空间更新监听器 */
	off(name: UIDefaultsIcons, handler: Function) {
		if (!this.#subscriptions[name]) return;
		if (typeof handler !== 'function') return;
		this.#subscriptions[name].delete(handler);
	}
	#defaultSubscriptions = new Map<UIDefaultsIcons, Set<Function>>();
	onDefaultChange(name: UIDefaultsIcons, handler: Function) {
		if (!DEFAULTS_ICONS_NAMES.includes(name)) return;
		let handlers = this.#defaultSubscriptions.get(name);
		if (!handlers) {
			handlers = new Set();
			this.#defaultSubscriptions.set(name, handlers);
		}
		handlers.add(handler);
	}
	offDefaultChange(name: UIDefaultsIcons, handler: Function) {
		if (!DEFAULTS_ICONS_NAMES.includes(name)) return;
		this.#defaultSubscriptions.get(name)?.delete(handler);
	}
}

//#region #Theme

/**
 * 颜色方案
 * @description
 * - `system`：系统默认
 * - `light`：亮色
 * - `dark`：暗色
 */
export type ColorScheme = 'system' | 'light' | 'dark';

const SCHEME_LIST: ColorScheme[] = ['system', 'light', 'dark'];

class UIThemeConfigs {
	#color = Color.rgb([0, 0xaa, 0]);
	constructor() {
		$ready(() => this.#updateCSSProperty());
	}
	#updateCSSProperty() {
		$apply(document.body, {
			style: this.#color.getTokens(),
		});
	}
	/**
	 * 颜色方案
	 * @description
	 * - `system`：系统默认
	 * - `light`：亮色
	 * - `dark`：暗色
	 */
	get colorScheme() {
		let scheme = document.body.getAttribute('ui-scheme') as any;
		if (!SCHEME_LIST.includes(scheme as any)) {
			scheme = SCHEME_LIST[0];
		}
		return scheme;
	}
	set colorScheme(value: ColorScheme) {
		if (!SCHEME_LIST.includes(value)) {
			value = SCHEME_LIST[0];
		}
		document.body.setAttribute('ui-scheme', value);
	}
	/** 主题色 */
	get color(): Color {
		return this.#color.clone();
	}
	set color(value: Color | RGB | RGBA | string) {
		if (value instanceof Color) {
			this.#color = value.clone();
		} else if (typeof value === 'string') {
			this.#color.hex(value);
		} else {
			this.#color.rgb(value as RGB);
		}
		this.#updateCSSProperty();
	}
}

//#region #Screen
export type UIScreenSafeAreaInset = [
	top: number,
	right: number,
	bottom: number,
	left: number,
];
const SAFE_AREA_DETECTER_STYLE: CSSProperty = {
	position: 'fixed',
	pointerEvents: 'none',
	visibility: 'none',
};
const POSITIONS = ['top', 'right', 'bottom', 'left'];
class UIScreenConfigs {
	#enableAutoSafeArea = true;
	#autoSafeArea: UIScreenSafeAreaInset = [0, 0, 0, 0];
	#detecters: Element[] = [];
	#safeAreaObserver = new ResizeObserver((entries) => {
		for (const entry of entries) {
			const index = this.#detecters.indexOf(entry.target);
			if (index === -1) continue;
			this.#autoSafeArea[index] = entry.borderBoxSize[0].blockSize;
		}
		this.#updateSafeRect();
	});
	constructor() {
		for (const position of POSITIONS) {
			const div = $div({
				style: {
					...SAFE_AREA_DETECTER_STYLE,
					height: `env(safe-area-inset-${position})`,
				},
			});
			this.#detecters.push(div);
			this.#safeAreaObserver.observe(div, { box: 'border-box' });
		}
		$ready(() => document.body.append(...this.#detecters));

		window.addEventListener('resize', () => this.#updateSafeRect());

		this.#updateSafeRect();
	}
	#safeArea: UIScreenSafeAreaInset = new Proxy([0, 0, 0, 0], {
		set: (target, p, newValue, receiver) => {
			if (!['0', '1', '2', '3'].includes(p as any)) return false;
			if (
				typeof newValue !== 'number' ||
				newValue < 0 ||
				!Number.isFinite(newValue)
			)
				return false;
			const result = Reflect.set(target, p, newValue, receiver);
			this.#update();
			return result;
		},
	});
	#update = Debounce.new(() => {
		if (this.#enableAutoSafeArea) {
			for (const position of POSITIONS) {
				document.body.style.removeProperty(`--ui-safe-${position}`);
			}
			return;
		}
		for (const i of range(4)) {
			document.body.style.setProperty(
				`--ui-safe-${POSITIONS[i]}`,
				`${this.#safeArea[i]}px`,
			);
		}
	}, 10);
	#safeRect: Rect = { top: 0, right: 0, bottom: 0, left: 0 };
	#updateSafeRect() {
		this.#safeRect = {
			top: this.safeTop,
			right: innerWidth - this.safeRight,
			bottom: innerHeight - this.safeBottom,
			left: this.safeLeft,
		};
	}
	/**
	 * 安全区域
	 * @param value - 安全区域值，设置为null时启用自动检测
	 */
	get safeArea() {
		if (this.#enableAutoSafeArea) return null;
		return this.#safeArea;
	}
	set safeArea(value: UIScreenSafeAreaInset | null | number | number[]) {
		// Auto
		if (value === null) {
			this.#enableAutoSafeArea = true;
			this.#update();
			return;
		}
		// Manual
		value = normalizeCSSFourValue(value);
		if (!value) return;
		if (value.some((v) => v < 0 || !Number.isFinite(v))) return;
		this.#enableAutoSafeArea = false;
		this.#safeArea[0] = value[0];
		this.#safeArea[1] = value[1];
		this.#safeArea[2] = value[2];
		this.#safeArea[3] = value[3];
		this.#updateSafeRect();
	}
	get safeTop() {
		if (this.#enableAutoSafeArea) return this.#autoSafeArea[0];
		return this.#safeArea[0];
	}
	get safeRight() {
		if (this.#enableAutoSafeArea) return this.#autoSafeArea[1];
		return this.#safeArea[1];
	}
	get safeBottom() {
		if (this.#enableAutoSafeArea) return this.#autoSafeArea[2];
		return this.#safeArea[2];
	}
	get safeLeft() {
		if (this.#enableAutoSafeArea) return this.#autoSafeArea[3];
		return this.#safeArea[3];
	}
	get safeRect(): Rect {
		return { ...this.#safeRect };
	}
}

class UITouchConfigs {
	#swipeThreshold = 0.1;
	/**
	 * 滑动判定阈值（像素/毫秒）
	 * @default 0.5
	 */
	get swipeThreshold() {
		return this.#swipeThreshold;
	}
	set swipeThreshold(value) {
		if (!Number.isFinite(value)) return;
		if (value < 0) return;
		this.#swipeThreshold = value;
	}
	#holdDurationThreshold = 200;
	/**
	 * 触摸开始到首次移动的最大允许时间（毫秒）
	 * @default 200
	 */
	get holdDurationThreshold() {
		return this.#holdDurationThreshold;
	}
	set holdDurationThreshold(value) {
		if (!Number.isFinite(value)) return;
		if (value < 0) return;
		this.#holdDurationThreshold = value;
	}
}

class UIMediaRules {
	#reduceMotion: boolean;
	constructor() {
		const reduceMotionMatch = matchMedia('(prefers-reduced-motion: reduce)');
		this.#reduceMotion = reduceMotionMatch.matches;
		reduceMotionMatch.onchange = ({ matches }) => {
			this.#reduceMotion = matches;
		};
	}
	/** 动画减弱 */
	get reduceMotion() {
		return this.#reduceMotion;
	}
}

//#region #ALL

export interface UIConfigsInit {
	/** 图标 */
	icon?: PromiseOr<ArrayOr<UIIconCSS>>;
	/** 主题色 */
	theme?: PromiseOr<Color | RGB | RGBA | string>;
	/** 颜色方案 */
	scheme?: PromiseOr<ColorScheme>;
	/** 默认图标 */
	defaultIcons?: PromiseOr<Partial<Record<UIDefaultsIcons, string>>>;
	/** 屏幕安全区 */
	safeArea?: PromiseOr<UIScreenSafeAreaInset>;
	/** 滑动判定阈值 */
	swipeThreshold?: number;
	/** 触摸开始到首次移动的最大允许时间 */
	holdDurationThreshold?: number;
	/** 圆角 */
	borderRadius?: number | string;
	/** 快捷键 */
	keyShortcut?: {
		[Key in 'ui.navNext' | 'ui.navPrev' | (string & {})]?: KeyBindGroup;
	};
	/** 按键别名 */
	keyAlias?: {
		[Key in
			| 'ui.confirm'
			| 'ui.cancel'
			| 'ui.up'
			| 'ui.right'
			| 'ui.down'
			| 'ui.left'
			| 'ui.selectMulti'
			| 'ui.selectRange'
			| (string & {})]?: AliasItem;
	};
}

class UIConfigs {
	#icon = new UIIconConfigs();
	#theme = new UIThemeConfigs();
	#screen = new UIScreenConfigs();
	#touch = new UITouchConfigs();
	#mediaRules = new UIMediaRules();
	/** 初始化配置 */
	async init(options: UIConfigsInit) {
		if (options.icon) this.#icon.add(...asArray(await options.icon));
		if (options.theme) this.#theme.color = await options.theme;
		if (options.scheme) this.#theme.colorScheme = await options.scheme;
		if (options.defaultIcons) this.#icon.defaults = await options.defaultIcons;
		if (options.safeArea) this.#screen.safeArea = await options.safeArea;
		if (options.swipeThreshold)
			this.#touch.swipeThreshold = options.swipeThreshold;
		if (options.holdDurationThreshold)
			this.#touch.holdDurationThreshold = options.holdDurationThreshold;
		if (options.borderRadius !== undefined)
			$apply(document.body, {
				style: {
					$uiBorderRadius: options.borderRadius,
				},
			});
		if (options.keyShortcut)
			keyboard.bindMap = {
				...DEFAULT_SHORTCUT_MAP,
				...options.keyShortcut,
			};
		if (options.keyAlias)
			keyboard.aliasMap = {
				...DEFAULT_ALIAS_MAP,
				...options.keyAlias,
			};
	}
	/** 图标配置 */
	get icon(): UIIconConfigs {
		return this.#icon;
	}
	set icon(value: ArrayOr<UIIconCSS>) {
		this.#icon.add(...asArray(value));
	}
	/** 主题配置 */
	get theme(): UIThemeConfigs {
		return this.#theme;
	}
	set theme(value: Color | ColorScheme) {
		if (typeof value === 'string') this.#theme.colorScheme = value;
		else if (value instanceof Color) this.#theme.color = value;
	}
	/** 屏幕配置 */
	get screen(): UIScreenConfigs {
		return this.#screen;
	}
	set screen(value: UIScreenSafeAreaInset | null | number | number[]) {
		this.#screen.safeArea = value;
	}
	/** 触摸设置 */
	get touch() {
		return this.#touch;
	}
	/** 媒体特性 */
	get mediaRules() {
		return this.#mediaRules;
	}
}

/** 全局配置 */
export const configs = new UIConfigs();
