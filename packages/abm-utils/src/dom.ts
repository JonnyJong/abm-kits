import { ArrayOr, asArray, range } from './collection';
import { Color } from './color';

//#region #Define
export type CSSProperty = {
	[Key in keyof CSSStyleDeclaration]?: any;
};
export type CSSVariable = {
	[key: `--${string}` | `$${string}`]: any;
};
export type DOMContents = ArrayOr<HTMLElement | string>;
export type DOMEventMap<E extends HTMLElement = HTMLElement> = {
	[K in keyof HTMLElementEventMap]?: (
		this: E,
		ev: HTMLElementEventMap[K],
	) => any;
};

export interface DOMApplyOptions<
	E extends HTMLElement = HTMLElement,
	Prop extends Record<string, any> = {},
	Events extends Record<string, any> = {},
> {
	/** 类名 */
	class?: ArrayOr<string>;
	/** ID */
	id?: string;
	/** 属性 */
	attr?: { [key: string]: any };
	/** 自定义数据属性 */
	data?: { [key: string]: any };
	/** 样式 */
	style?: CSSProperty & CSSVariable;
	/**
	 * 内容
	 * @description
	 * 若 html 存在，则忽略 content
	 */
	content?: DOMContents;
	/**
	 * HTML 值
	 * @description
	 * 若 html 存在，则忽略 content
	 */
	html?: string;
	/** 事件 */
	event?: DOMEventMap<E>;
	/** 颜色 */
	color?: Color | null;
	/** 元素属性 */
	prop?: Prop;
	/** 事件 */
	on?: {
		[T in keyof Events]?: (event: Events[T]) => void;
	};
	/** 一次性事件 */
	once?: {
		[T in keyof Events]?: (event: Events[T]) => void;
	};
}

const PATTERN_CSS_VAR = /^\$/;
const PATTERN_CSS_UPPER = /[A-Z]/g;

//#region #Apply
function applyBasic<E extends HTMLElement = HTMLElement>(
	target: E,
	options: DOMApplyOptions<E>,
) {
	if (options.class !== undefined) {
		target.className = '';
		target.classList.add(...asArray(options.class));
	}
	if (options.id !== undefined) {
		target.id = options.id;
	}
	if (options.attr !== undefined) {
		for (const [key, value] of Object.entries(options.attr)) {
			if (value === undefined) {
				target.removeAttribute(key);
				continue;
			}
			target.setAttribute(key, String(value));
		}
	}
	if (options.data !== undefined) {
		for (const [key, value] of Object.entries(options.data)) {
			if (value === undefined) {
				delete target.dataset[key];
				continue;
			}
			target.dataset[key] = String(value);
		}
	}
}
function applyStyle<E extends HTMLElement = HTMLElement>(
	target: E,
	options: DOMApplyOptions<E>,
) {
	if (options.style !== undefined) {
		for (let [key, value] of Object.entries(options.style)) {
			key = key
				.replace(PATTERN_CSS_VAR, '--')
				.replace(PATTERN_CSS_UPPER, (ch) => `-${ch.toLowerCase()}`);
			if (typeof value === 'number') {
				target.style.setProperty(key, `${value}px`);
				continue;
			}
			if ([undefined, null].includes(value)) {
				target.style.removeProperty(key);
				return;
			}
			target.style.setProperty(key, String(value));
		}
	}
}
function applyContent<E extends HTMLElement = HTMLElement>(
	target: E,
	options: DOMApplyOptions<E>,
) {
	if (typeof options.html === 'string') {
		target.innerHTML = options.html;
	} else if (options.content !== undefined) {
		target.replaceChildren(...asArray(options.content));
	}
}
function applyProp<
	E extends HTMLElement = HTMLElement,
	Prop extends Record<string, any> = {},
>(target: E, options: DOMApplyOptions<E, Prop>) {
	if (!options.prop) return;
	for (const [key, value] of Object.entries(options.prop)) {
		(target as any)[key] = value;
	}
}
function applyEvent<E extends HTMLElement = HTMLElement>(
	target: E,
	options: DOMApplyOptions<E>,
) {
	if (options.event !== undefined) {
		for (const [key, value] of Object.entries(options.event)) {
			target.addEventListener(
				key as keyof HTMLElementEventMap,
				value as EventListenerOrEventListenerObject,
			);
		}
	}
	if (options.on && typeof (target as any).on === 'function') {
		for (const [type, handler] of Object.entries(options.on)) {
			(target as any).on(type, handler);
		}
	}
	if (options.once && typeof (target as any).once === 'function') {
		for (const [type, handler] of Object.entries(options.once)) {
			(target as any).once(type, handler);
		}
	}
}

const colorTokens = ['text'];
for (const i of range(1, 15)) {
	colorTokens.push(i.toString(16));
}

/** 应用颜色到 DOM 元素 */
export function $applyColor(target: HTMLElement, color?: Color) {
	if (!color) {
		target.style.removeProperty('--theme');
		for (const token of colorTokens) {
			target.style.removeProperty(`--theme-${token}`);
		}
		return;
	}
	for (const [key, value] of Object.entries(color.getTokens())) {
		target.style.setProperty(key, value);
	}
}

/**
 * 应用配置到 DOM 元素
 * @param target - 目标 DOM 元素
 * @param options - 配置
 */
export function $apply<
	E extends HTMLElement = HTMLElement,
	Prop extends Record<string, any> = {},
>(target: E, options: DOMApplyOptions<E, Prop>) {
	applyBasic(target, options);
	applyStyle(target, options);
	applyContent(target, options);
	applyProp(target, options);
	applyEvent(target, options);
	if (options.color === null) $applyColor(target);
	else if (options.color instanceof Color) $applyColor(target, options.color);
}

//#region Query
/** Element.querySelector 别名 */
export function $<E extends HTMLElement = HTMLElement>(
	selector: string,
): E | null;
export function $<E extends HTMLElement = HTMLElement>(
	selector: string,
	scope: ParentNode,
): E | null;
export function $<E extends HTMLElement = HTMLElement>(
	selector: string,
	scope: ParentNode = document,
): E | null {
	return scope.querySelector<E>(selector);
}

/** Element.querySelectorAll 别名 */
export function $$<E extends HTMLElement = HTMLElement>(selector: string): E[];
export function $$<E extends HTMLElement = HTMLElement>(
	selector: string,
	scope: ParentNode,
): E[];
export function $$<E extends HTMLElement = HTMLElement>(
	selector: string,
	scope: ParentNode = document,
): E[] {
	return [...scope.querySelectorAll<E>(selector)];
}

//#region #Create
/** 创建 DOM 元素并应用配置 */
export function $new<K extends keyof HTMLElementTagNameMap>(
	tag: K,
): HTMLElementTagNameMap[K];
export function $new<
	K extends keyof HTMLElementTagNameMap,
	Prop extends Record<string, any> = {},
	Events extends Record<string, any> = {},
>(
	tag: K,
	options: DOMApplyOptions<HTMLElementTagNameMap[K], Prop, Events>,
): HTMLElementTagNameMap[K];
export function $new<K extends keyof HTMLElementTagNameMap>(
	tag: K,
	...content: (string | HTMLElement)[]
): HTMLElementTagNameMap[K];
export function $new<
	K extends keyof HTMLElementTagNameMap,
	Prop extends Record<string, any> = {},
	Events extends Record<string, any> = {},
>(
	tag: K,
	options: DOMApplyOptions<HTMLElementTagNameMap[K], Prop, Events>,
	...content: (string | HTMLElement)[]
): HTMLElementTagNameMap[K];
export function $new<E extends HTMLElement = HTMLElement>(tag: string): E;
export function $new<
	E extends HTMLElement = HTMLElement,
	Prop extends Record<string, any> = {},
	Events extends Record<string, any> = {},
>(tag: string, options: DOMApplyOptions<E, Prop, Events>): E;
export function $new<E extends HTMLElement = HTMLElement>(
	tag: string,
	...content: (string | HTMLElement)[]
): E;
export function $new<
	E extends HTMLElement = HTMLElement,
	Prop extends Record<string, any> = {},
	Events extends Record<string, any> = {},
>(
	tag: string,
	options: DOMApplyOptions<E, Prop, Events>,
	...content: (string | HTMLElement)[]
): E;
export function $new<
	E extends HTMLElement = HTMLElement,
	Prop extends Record<string, any> = {},
	Events extends Record<string, any> = {},
>(
	tag: string,
	options?: DOMApplyOptions<E, Prop, Events> | string | HTMLElement,
	...content: (string | HTMLElement)[]
): E {
	const element = document.createElement(tag) as E;
	if (typeof options === 'object' && !(options instanceof HTMLElement)) {
		$apply(element, options);
	} else if (options !== undefined) {
		element.append(options);
	}
	element.append(...content);
	return element;
}

/** 创建 <div> 元素并应用配置 */
export function $div(): HTMLDivElement;
export function $div(options: DOMApplyOptions<HTMLDivElement>): HTMLDivElement;
export function $div(...content: (string | HTMLElement)[]): HTMLDivElement;
export function $div(
	options: DOMApplyOptions<HTMLDivElement>,
	...content: (string | HTMLElement)[]
): HTMLDivElement;
export function $div(
	options?: DOMApplyOptions<HTMLDivElement> | string | HTMLElement,
	...content: (string | HTMLElement)[]
): HTMLDivElement {
	return $new<HTMLDivElement>('div', options as string, ...content);
}

//#region #Other
/** 获取元素路径 */
export function $path(from: HTMLElement): HTMLElement[] {
	const path = [from];
	let current = from.parentElement;
	while (current) {
		path.push(current);
		current = current.parentElement;
	}
	return path;
}

/**
 * `document.addEventListener('DOMContentLoaded', ()=>{})` 别名
 */
export function $ready(handler: (this: Document, ev: Event) => any) {
	document.addEventListener('DOMContentLoaded', handler);
}
