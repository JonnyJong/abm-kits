import { ArrayOr, asArray, range } from './collection';
import { Color } from './color';

//#region #Define
type HTMLElementTagForType<E> = {
	[K in keyof HTMLElementTagNameMap]: HTMLElementTagNameMap[K] extends E
		? K
		: never;
}[keyof HTMLElementTagNameMap];
export interface HTMLElementProp {
	a: {
		download?: string;
		href?: string;
		hrefLang?: string;
		ping?: string;
		referrerPolicy?: string;
		rel?: string;
		target?: '_self' | '_blank' | '_parent' | '_top';
		type?: string;
	};
	area: {
		alt?: string;
		coords?: string;
		download?: string;
		href?: string;
		hrefLang?: string;
		media?: string;
		rel?: string;
		shape?: 'rect' | 'circle' | 'polygon';
		target?: '_self' | '_blank' | '_parent' | '_top';
		type?: string;
	};
	audio: {
		autoplay?: boolean;
		controls?: boolean;
		crossorigin?: 'anonymous' | 'use-credentials';
		currentTime?: number;
		loop?: boolean;
		muted?: boolean;
		preload?: 'none' | 'metadata' | 'auto' | '';
		src?: string;
	};
	base: {
		href?: string;
		target?: '_self' | '_blank' | '_parent' | '_top';
	};
	bdo: {
		dir?: 'ltr' | 'trl';
	};
	blockquote: {
		cite?: string;
	};
	button: {
		autofocus?: boolean;
		disabled?: boolean;
		form?: string;
		formAction?: string;
		formEnctype?:
			| 'application/x-www-form-urlencoded'
			| 'multipart/form-data'
			| 'text/plain';
		formMethod?: 'post' | 'get';
		formNoValidate?: boolean;
		formTarget?: '_self' | '_blank' | '_parent' | '_top';
		name?: string;
		type?: 'submit' | 'reset' | 'button';
		value?: string;
	};
	canvas: {
		height?: number;
		width?: number;
	};
	col: {
		span?: number;
	};
	colgroup: {
		span?: number;
	};
	data: {
		value?: string;
	};
	del: {
		cite?: string;
		datetime?: string;
	};
	details: {
		open?: boolean;
	};
	dfn: {
		title?: string;
	};
	dialog: {
		open?: boolean;
	};
	embed: {
		height?: number;
		width?: number;
		src?: string;
		type?: string;
	};
	fieldset: {
		disabled?: boolean;
		form?: string;
		name?: string;
	};
	form: {
		acceptCharset?: string;
		autocomplete?: 'on' | 'off';
		name?: string;
		rel?: string;
		action?: string;
		enctype?:
			| 'application/x-www-form-urlencoded'
			| 'multipart/form-data'
			| 'text/plain';
		method?: 'post' | 'get' | 'dialog';
		noValidate?: boolean;
		target?: '_self' | '_blank' | '_parent' | '_top';
	};
	html: {
		xmlns?: string;
	};
	iframe: {
		allow?: string;
		allowFullscreen?: boolean;
		height?: number;
		width?: number;
		loading?: 'eager' | 'lazy';
		name?: string;
		referrerPolicy?:
			| ''
			| 'no-referrer'
			| 'no-referrer-when-downgrade'
			| 'origin'
			| 'origin-when-cross-origin'
			| 'same-origin'
			| 'strict-origin'
			| 'strict-origin-when-cross-origin'
			| 'unsafe-url';
		sandbox?: string;
		src?: string;
		srcdoc?: string;
	};
	img: {
		src?: string;
		crossOrigin?: 'anonymous' | 'use-credentials';
		decoding?: 'sync' | 'async' | 'auto';
		height?: number;
		width?: number;
		isMap?: boolean;
		loading?: 'eager' | 'lazy';
		referrerPolicy?:
			| ''
			| 'no-referrer'
			| 'no-referrer-when-downgrade'
			| 'origin'
			| 'origin-when-cross-origin'
			| 'same-origin'
			| 'strict-origin'
			| 'strict-origin-when-cross-origin'
			| 'unsafe-url';
		size?: string;
		srcset?: string;
		usemap?: string;
	};
	input: {
		type?:
			| 'button'
			| 'checkbox'
			| 'color'
			| 'date'
			| 'datetime-local'
			| 'email'
			| 'file'
			| 'hidden'
			| 'image'
			| 'month'
			| 'number'
			| 'password'
			| 'radio'
			| 'range'
			| 'reset'
			| 'search'
			| 'submit'
			| 'tel'
			| 'text'
			| 'time'
			| 'url'
			| 'week';
		accept?: string;
		alt?: string;
		autocomplete?: boolean;
		capture?: string;
		checked?: boolean;
		dirname?: string;
		disabled?: boolean;
		form?: string;
		formAction?: string;
		formEnctype?:
			| 'application/x-www-form-urlencoded'
			| 'multipart/form-data'
			| 'text/plain';
		formMethod?: 'post' | 'get';
		formNoValidate?: boolean;
		formTarget?: '_self' | '_blank' | '_parent' | '_top';
		height?: number;
		list?: string;
		max?: string;
		maxLength?: number;
		min?: string;
		minlength?: number;
		multiple?: boolean;
		name?: string;
		pattern?: string;
		placeholder?: string;
		readOnly?: boolean;
		required?: boolean;
		size?: string;
		src?: string;
		step?: string;
		value?: string;
		width?: number;
	};
	ins: {
		cite?: string;
		datetime?: string;
	};
	label: {
		for?: string;
		form?: string;
	};
	li: {
		value?: number;
	};
	link: {
		as?:
			| 'audio'
			| 'document'
			| 'embed'
			| 'fetch'
			| 'font'
			| 'image'
			| 'object'
			| 'script'
			| 'style'
			| 'track'
			| 'video'
			| 'worker';
		crossOrigin?: 'anonymous' | 'use-credentials';
		disabled?: boolean;
		fetchPriority?: 'high' | 'low' | 'auto';
		href?: string;
		hrefLang?: string;
		imageSizes?: string;
		imageSrcset?: string;
		integrity?: string;
		media?: string;
		referrerPolicy?: string;
		rel?: string;
		sizes?: string;
		title?: string;
		type?: string;
	};
	map: {
		name?: string;
	};
	meta: {
		charset?: string;
		content?: string;
		httpEquiv?: string;
		name?: string;
	};
	meter: {
		value?: number;
		min?: number;
		max?: number;
		low?: number;
		high?: number;
		optimum?: number;
		form?: string;
	};
	object: {
		data?: string;
		form?: string;
		height?: number;
		width?: number;
		name?: string;
		type?: string;
		useMap?: string;
	};
	ol: {
		reversed?: boolean;
		start?: number;
		type?: 'a' | 'A' | 'i' | 'I' | '1';
	};
	optgroup: {
		disabled?: boolean;
		label?: string;
	};
	option: {
		disabled?: boolean;
		label?: string;
		selected?: boolean;
		value?: string;
	};
	output: {
		for?: string;
		form?: string;
		name?: string;
	};
	progress: {
		max?: number;
		value?: number;
	};
	q: {
		cite?: string;
	};
	script: {
		async?: boolean;
		crossOrigin?: 'anonymous' | 'use-credentials';
		defer?: boolean;
		integrity?: string;
		noModule?: boolean;
		nonce?: string;
		referrerPolicy?:
			| ''
			| 'no-referrer'
			| 'no-referrer-when-downgrade'
			| 'origin'
			| 'origin-when-cross-origin'
			| 'same-origin'
			| 'strict-origin'
			| 'strict-origin-when-cross-origin'
			| 'unsafe-url';
		src?: string;
		type?: '' | 'module' | 'importmap';
	};
	select: {
		autoComplete?: boolean;
		autoFocus?: boolean;
		disabled?: boolean;
		form?: string;
		multiple?: boolean;
		name?: string;
		required?: boolean;
		size?: number;
	};
	slot: {
		name?: string;
	};
	source: {
		type?: string;
		src?: string;
		srcset?: string;
		sizes?: string;
		media?: string;
		height?: number;
		width?: number;
	};
	style: {
		blocking?: string;
		media?: string;
		nonce?: string;
		title?: string;
	};
	td: {
		colSpan?: number;
		headers?: string;
		rowSpan?: number;
	};
	textarea: {
		autocapitalize?: boolean;
		autocomplete?: 'on' | 'off';
		autofocus?: boolean;
		cols?: number;
		dirname?: string;
		disabled?: boolean;
		form?: string;
		maxLength?: number;
		minLength?: number;
		name?: string;
		placeholder?: string;
		readOnly?: boolean;
		required?: boolean;
		rows?: number;
		spellcheck?: string;
		wrap?: string;
	};
	th: {
		abbr?: string;
		colSpan?: number;
		headers?: string;
		rowSpan?: number;
		scope?: 'row' | 'col' | 'rowgroup' | 'colgroup';
	};
	time: {
		dateTime?: string;
	};
	track: {
		default?: boolean;
		kind?: 'subtitles' | 'captions' | 'chapters' | 'metadata';
		label?: string;
		src?: string;
		srclang?: string;
	};
	video: {
		autoplay?: boolean;
		controls?: boolean;
		crossOrigin?: 'anonymous' | 'use-credentials';
		disablePictureInPicture?: boolean;
		height?: number;
		width?: number;
		loop?: boolean;
		muted?: boolean;
		playsInline?: boolean;
		poster?: string;
		preload?: 'none' | 'metadata' | 'auto' | '';
		src?: string;
	};
}
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
for (const i of range(1, 16)) {
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
export function $new<
	K extends keyof HTMLElementTagNameMap,
	E extends HTMLElementTagNameMap[K] = HTMLElementTagNameMap[K],
>(
	tag: K,
	options?: DOMApplyOptions<
		E,
		K extends keyof HTMLElementProp ? HTMLElementProp[K] : {},
		{}
	>,
	...content: (HTMLElement | string)[]
): E;
export function $new<
	E extends HTMLElementTagNameMap[keyof HTMLElementTagNameMap],
	K extends HTMLElementTagForType<E> = HTMLElementTagForType<E>,
>(
	tag: K,
	options?: DOMApplyOptions<
		E,
		K extends keyof HTMLElementProp ? HTMLElementProp[K] : {},
		{}
	>,
	...content: (HTMLElement | string)[]
): E;
export function $new<
	K extends keyof HTMLElementTagNameMap,
	E extends HTMLElementTagNameMap[K] = HTMLElementTagNameMap[K],
>(
	tag: K,
	options?: HTMLElement | string,
	...content: (HTMLElement | string)[]
): E;
export function $new<
	E extends HTMLElementTagNameMap[keyof HTMLElementTagNameMap],
	K extends HTMLElementTagForType<E> = HTMLElementTagForType<E>,
>(
	tag: K,
	options?: HTMLElement | string,
	...content: (HTMLElement | string)[]
): E;
export function $new(
	tag: string,
	options?: DOMApplyOptions<HTMLElement, {}, {}> | HTMLElement | string,
	...content: (HTMLElement | string)[]
): HTMLElement {
	const element = document.createElement(tag) as HTMLElement;
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
