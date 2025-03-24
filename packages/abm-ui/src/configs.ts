import { Signal } from '@lit-labs/signals';
import {
	$apply,
	$div,
	$ready,
	ArrayOr,
	CSSProperty,
	Color,
	Debounce,
	IterableWeakSet,
	ProxyObjectOptions,
	RGB,
	RGBA,
	Rect,
	asArray,
	normalizeCSSFourValue,
	proxyObject,
	range,
	runTask,
} from 'abm-utils';
import { CSSResult } from 'lit';
import { LocaleDict, locale } from './locale';

//#region #Icon

export type UIIconCSS = CSSStyleSheet | CSSResult | string | URL;
export type UIDefaultsIcons =
	| 'increase'
	| 'decrease'
	| 'calculate'
	| 'selectExpand'
	| 'keyDisallow'
	| 'keyTab'
	| 'keyEnter'
	| 'keyShift'
	| 'keyNumpadAdd'
	| 'keyNumpadSubtract'
	| 'keyNumpadMultiply'
	| 'keyNumpadDivide'
	| 'keyArrowUp'
	| 'keyArrowRight'
	| 'keyArrowDown'
	| 'keyArrowLeft'
	| 'keySpace'
	| 'keyHome'
	| 'keyBackspace'
	| 'up'
	| 'right'
	| 'down'
	| 'left'
	| 'gamepadStart'
	| 'gamepadBack';

const DEFAULTS_ICONS: UIDefaultsIcons[] = [
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
];

class UIIconConfigs {
	//#region Default Namespace
	#defaultNamespace = 'icon';
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
			.then((text) => {
				return this.#addFromString(text);
			})
			.then(() => this.#update());
	}
	#add(style: CSSStyleSheet | CSSResult) {
		if ((style as CSSResult)?.styleSheet instanceof CSSStyleSheet)
			style = (style as CSSResult).styleSheet as CSSStyleSheet;
		if (!(style instanceof CSSStyleSheet)) return;
		this.#styles.add(style);
		return;
	}
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
	delete(style: CSSStyleSheet) {
		this.#styles.delete(style);
		this.#update();
	}
	entries() {
		return this.#styles.values();
	}
	get() {
		return this.#computed.get();
	}
	get signal() {
		return this.#computed;
	}
	//#region Defaults Icons
	#defaultsIconUpdateHandler: ProxyObjectOptions<
		Record<UIDefaultsIcons, string>
	>['update'] = (_, p, value) => {
		if (!value) return;
		if (!DEFAULTS_ICONS.includes(p as any)) return;

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
				set(target, p, newValue, receiver) {
					if (typeof newValue !== 'string') return false;
					if (!DEFAULTS_ICONS.includes(p as any)) return false;
					return Reflect.set(target, p, newValue, receiver);
				},
			},
		},
		(() => {
			const defaults = {} as Record<UIDefaultsIcons, string>;
			for (const key of DEFAULTS_ICONS) {
				defaults[key] = '';
			}
			return defaults;
		})(),
	);
	get defaults(): Record<UIDefaultsIcons, string> {
		return this.#defaults;
	}
	set defaults(value: {
		[key in UIDefaultsIcons]?: string;
	}) {
		if (typeof value !== 'object') return;

		for (const key of DEFAULTS_ICONS) {
			if (typeof value[key] !== 'string') continue;
			this.#defaults[key] = value[key];
		}
	}
	#subscriptions: Record<UIDefaultsIcons, IterableWeakSet<Function>> = (() => {
		const defaults = {} as Record<UIDefaultsIcons, IterableWeakSet<Function>>;
		for (const key of DEFAULTS_ICONS) {
			defaults[key] = new IterableWeakSet();
		}
		return defaults;
	})();
	on(name: UIDefaultsIcons, handler: Function) {
		if (!this.#subscriptions[name]) return;
		if (typeof handler !== 'function') return;
		this.#subscriptions[name].add(handler);
	}
	off(name: UIDefaultsIcons, handler: Function) {
		if (!this.#subscriptions[name]) return;
		if (typeof handler !== 'function') return;
		this.#subscriptions[name].delete(handler);
	}
}

//#region #Theme

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
		document.body.append(...this.#detecters);

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

//#region #ALL

export interface UIConfigsInit {
	locale?: Record<string, LocaleDict>;
	icon?: ArrayOr<UIIconCSS>;
	theme?: Color | RGB | RGBA | string;
	scheme?: ColorScheme;
	defaults?: Partial<Record<UIDefaultsIcons, string>>;
	safeArea?: UIScreenSafeAreaInset;
}

class UIConfigs {
	#icon = new UIIconConfigs();
	#theme = new UIThemeConfigs();
	#screen = new UIScreenConfigs();
	init(options: UIConfigsInit) {
		if (options.icon) this.#icon.add(...asArray(options.icon));
		if (options.theme) this.#theme.color = options.theme;
		if (options.scheme) this.#theme.colorScheme = options.scheme;
		if (options.defaults) this.#icon.defaults = options.defaults;
		if (options.safeArea) this.#screen.safeArea = options.safeArea;
		if (!options.locale) return;
		for (const [key, dict] of Object.entries(options.locale)) {
			locale.set(key, dict);
		}
	}
	get icon(): UIIconConfigs {
		return this.#icon;
	}
	set icon(value: ArrayOr<UIIconCSS>) {
		this.#icon.add(...asArray(value));
	}
	get theme(): UIThemeConfigs {
		return this.#theme;
	}
	set theme(value: Color | ColorScheme) {
		if (typeof value === 'string') this.#theme.colorScheme = value;
		else if (value instanceof Color) this.#theme.color = value;
	}
	get screen(): UIScreenConfigs {
		return this.#screen;
	}
	set screen(value: UIScreenSafeAreaInset | null | number | number[]) {
		this.#screen.safeArea = value;
	}
}

export const configs = new UIConfigs();
