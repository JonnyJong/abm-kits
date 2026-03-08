import { type ArrayOr, type Constructor, notNil } from 'abm-utils';
import { Component } from '../component/base';
import { tooltip } from '../widget/tooltip';
import { $color, type ThemeColor } from './color';
import { $once } from './event';
import { getElementProps } from './internal';
import { $style, type StyleDeclaration } from './style';

//#region Types

/** DOM 内容 */
export type DOMContents = ArrayOr<Node | string>;

/** 元素构造器 */
export type ElementConstructor = Constructor<HTMLElement> & typeof HTMLElement;
/** 组件构造器 */
export type ComponentConstructor = Constructor<Component> & typeof Component;

/** 定义元素属性 */
type Props<T> = Partial<T> & { [name: string]: any };
/** 定义闭合元素属性 */
type VoidProps<T> = Props<T> & { children?: never };

type Properties<T> = {
	[K in keyof T]: T[K] extends Function
		? never
		: K extends keyof HTMLElement | keyof GlobalAttributes
			? never
			: K;
}[keyof T & string];

/**
 * 从自定义元素类中提取适用于 JSX 的属性类型定义
 * @template T 自定义元素类，必须继承自 `HTMLElement`
 * @template I 要额外包含的属性键（`keyof T`），即使它们被默认规则排除
 * @template E 要额外排除的属性名（`keyof T`），即使它们被默认规则包含
 *
 * @returns 一个对象类型，包含：
 * 1. 从 `T` 中自动提取的可写、非函数的自有属性
 * 2. 排除 `HTMLElement` 和 `JSX.IntrinsicAttributes` 中的内置属性
 * 3. 加上 `I` 中指定的额外属性
 * 4. 减去 `E` 中指定的排除属性
 * 5. 合并 `JSX.Props` 中的通用属性和索引签名
 *
 * @example 基本用法
 * ```ts
 * class MyButton extends HTMLElement {
 *   label: string = "";
 *   onClick() {}                    // 自动排除方法
 * }
 *
 * type Props = ElementProps<MyButton>;
 * // 等效于 { label?: string } & JSX.Props<...>
 * ```
 *
 * @example 包含被默认排除的属性
 * ```ts
 * class MyElement extends HTMLElement {
 *   handler: () => void;           // 函数类型属性：默认被排除
 *   value: number = 0;
 * }
 *
 * // 显式包含 'handler'
 * type Props = ElementProps<MyElement, 'handler'>;
 * // 包含 handler?: () => void 和 value?: number
 * ```
 *
 * @example 排除特定属性
 * ```ts
 * class MyElement extends HTMLElement {
 *   a: number = 1;
 *   b: string = "test";
 *   c: boolean = false;
 * }
 *
 * // 排除 'b' 属性
 * type Props = ElementProps<MyElement, never, 'b'>;
 * // 包含 a?: number 和 c?: boolean，不含 b
 * ```
 *
 * @example 同时包含和排除
 * ```ts
 * class A extends HTMLElement {
 *   #a = 10;
 *   get a() { return this.#a; }
 *   set a(v) { this.#a = v; }
 *   readonly b = false;            // 只读属性
 *   c = () => {};                  // 函数类型属性
 * }
 *
 * // 包含 'c'，排除 'b'
 * export type PA = ElementProps<A, 'c', 'b'>;
 * // 结果: { a?: number; c?: (() => void) } & { [name: string]: any }
 * ```
 *
 * @see {@link Properties} 了解默认属性提取规则
 * @see {@link JSX.Props} 了解基础属性类型扩展
 */
export type ElementProps<
	T extends HTMLElement,
	I extends keyof T = never,
	E extends keyof T = never,
> = Props<
	{
		[K in keyof T]?: K extends keyof GlobalAttributes
			? GlobalAttributes[K]
			: K extends I
				? T[K]
				: K extends E
					? never
					: K extends Properties<T>
						? T[K]
						: never;
	} & { ref?: (current: T) => void }
>;

/**
 * 从自定义的自闭合元素类中提取适用于 JSX 的属性类型定义
 * @see {@link ElementProps}
 */
export type VoidElementProps<
	T extends HTMLElement,
	I extends keyof T = never,
	E extends keyof T = never,
> = VoidProps<
	Pick<T, Exclude<Properties<T>, E> | I> & { ref?: (current: T) => void }
>;

/** 全局属性 */
type BasicAttributesKeys =
	| 'title'
	| 'lang'
	| 'dir'
	| 'tabIndex'
	| 'accessKey'
	| 'hidden'
	| 'contentEditable'
	| 'spellcheck'
	| 'draggable'
	| 'role'
	| 'part'
	| 'slot'
	| 'nonce'
	| 'translate';
type BasicAttributes = {
	[K in keyof HTMLElement &
		BasicAttributesKeys]?: HTMLElement[K] extends DOMTokenList
		? HTMLElement[K] | string
		: HTMLElement[K];
};

/** 原始全局事件属性 */
type RawEventAttributes = {
	[K in keyof HTMLElement & `on${string}`]?: HTMLElement[K];
};
/** 全局事件属性 */
type EventAttributes<T, K extends keyof T = keyof T> = {
	[E in K extends `on${infer N extends string}`
		? `on${Capitalize<N>}`
		: K]?: T[K];
};

/** ARIA 属性 */
type AriaAttributes = {
	[K in keyof HTMLElement & `aria${string}`]?: HTMLElement[K];
};

export interface GlobalAttributes
	extends BasicAttributes,
		EventAttributes<RawEventAttributes>,
		AriaAttributes {
	/** 子元素 */
	children?: ArrayOr<any>;
	/** 类名 */
	className?: ArrayOr<any> | Record<string, any>;
	/** ID */
	id?: string;
	/** 样式 @see {@link $style} */
	style?: StyleDeclaration | string;
	/** 主题配色 */
	color?: ThemeColor;
	/**
	 * 数据属性
	 * @description
	 * 当值为 `null` 或 `undefined` 时不会被设置
	 */
	[name: `data-${string}`]: string | undefined | null;
	/** UI 组件事件监听器 */
	[event: `$${string}`]: ((...args: any) => any) | undefined | null;
	/**
	 * 获取 DOM 引用
	 * @description
	 * 在元素创建并设置后调用
	 */
	ref?: (current: HTMLElement) => void;
	/**
	 * 属性
	 * @description
	 * 当值为 `null` 或 `undefined` 时不会被设置
	 */
	attr?: Record<string, any>;
	/**
	 * 成员
	 * @description
	 * 当值为 `null` 或 `undefined` 时不会被设置
	 */
	props?: Record<string, any>;
	/**
	 * 设置 `innerHTML`
	 * @description
	 * 当包含子元素时，该选项失效
	 */
	dangerouslySetInnerHTML?: { __html?: string };
	/** 工具提示 */
	tooltip?: DOMContents;
	/** 标签命名空间 */
	xmlns?: string;
}

/** 自闭合元素标签名 */
type VoidHTMLTagNames =
	| 'area'
	| 'base'
	| 'br'
	| 'col'
	| 'embed'
	| 'hr'
	| 'img'
	| 'input'
	| 'link'
	| 'meta'
	| 'source'
	| 'track'
	| 'wbr';

/** 一般 HTML 元素 */
type GeneralHTMLElementPropMap = {
	[Name in keyof HTMLElementTagNameMap]: Name extends VoidHTMLTagNames
		? VoidElementProps<HTMLElementTagNameMap[Name]>
		: ElementProps<HTMLElementTagNameMap[Name]>;
};

// biome-ignore lint/suspicious/noEmptyInterface: Empty By Default
export interface CustomElementTagNameMap {}

// biome-ignore lint/suspicious/noEmptyInterface: Empty By Default
export interface CustomElementPropMap {}

type PatchedCustomElementPropMap = {
	[K in keyof CustomElementTagNameMap]: K extends keyof CustomElementPropMap
		? CustomElementPropMap[K]
		: ElementProps<CustomElementTagNameMap[K]>;
};

export interface ElementPropMap
	extends GeneralHTMLElementPropMap,
		PatchedCustomElementPropMap {
	[name: string]: Props<{}>;
}

//#region Modify
type BaseDOMOptions<K> = K extends keyof ElementPropMap
	? ElementPropMap[K]
	: {};
type PropsDOMOptions<K> = K extends (props?: infer T extends {}) => any
	? Partial<T>
	: K extends Constructor<any, [infer T extends {} | undefined]>
		? Partial<Exclude<T, undefined>>
		: {};
type RefDOMOptions<T> = { ref?: (current: T) => any };
export type DOMApplyOptions<K, T> = Omit<GlobalAttributes, 'ref'> &
	BaseDOMOptions<K> &
	PropsDOMOptions<K> &
	RefDOMOptions<T>;

const SPECIAL_KEYS = new Set([
	'children',
	'className',
	'id',
	'style',
	'color',
	'ref',
	'attr',
	'props',
	'dangerouslySetInnerHTML',
	'tooltip',
]);

/** 标准化类名列表 */
function normalizeClassList(input: GlobalAttributes['className']): string[] {
	if (!input) return [];
	let result: any[];
	if (Array.isArray(input)) {
		result = input.flat(Number.POSITIVE_INFINITY);
	} else if (typeof input === 'object') {
		result = Object.entries(input)
			.filter(([_, check]) => check)
			.map(([name]) => name);
	} else {
		result = input.split(' ');
	}
	return result.map(String);
}

/** 安全设置属性 */
function setProp(target: any, key: string, value: unknown): void {
	try {
		target[key] = value;
	} catch (error) {
		console.error(error);
	}
}

function flat(content: any): (string | Node)[] {
	if (!Array.isArray(content)) return [content];
	return content.flat(3);
}

/** 修改 DOM 元素 */
export function $apply<T extends Element & ElementCSSInlineStyle>(
	target: T,
	options?: DOMApplyOptions<T, T> | null,
	...children: any[]
): T {
	if (children.length > 0) {
		target.append(...flat(children));
	} else if (notNil(options?.children)) {
		target.append(...flat(options!.children));
	} else if (typeof options?.dangerouslySetInnerHTML?.__html === 'string') {
		target.innerHTML = options.dangerouslySetInnerHTML.__html;
	}

	if (!options) return target;

	if (options.className) {
		target.className = '';
		target.classList.add(...normalizeClassList(options.className));
	}
	if (notNil(options.id)) target.id = String(options.id);
	$style(target, options?.style);
	$color(target, options.color);

	const props = getElementProps(target, target.tagName);
	for (const [name, value] of Object.entries(options)) {
		if (SPECIAL_KEYS.has(name)) continue;
		if (name[0] === '$') {
			if (!(target instanceof Component)) continue;
			if (typeof value !== 'function') continue;
			target.on(name.slice(1), value);
			continue;
		}
		if (name.startsWith('on')) {
			const event = name.slice(2).toLowerCase();
			target.addEventListener(event, value);
			continue;
		}
		if (name.startsWith('data-')) {
			if (value === undefined || value === null) continue;
			if (!('dataset' in target)) continue;
			if (!(target.dataset instanceof DOMStringMap)) continue;
			target.dataset[name] = String(value);
			continue;
		}
		if (props.has(name)) setProp(target, name, value);
		else target.setAttribute(name, String(value));
	}

	if (options.attr) {
		for (const [name, value] of Object.entries(options.attr)) {
			if (value === undefined || value === null) continue;
			target.setAttribute(name, String(value));
		}
	}

	if (options.props) {
		for (const [name, value] of Object.entries(options.props)) {
			if (value === undefined || value === null) continue;
			setProp(target, name, value);
		}
	}

	if (options.tooltip) tooltip.set(target as any, options.tooltip);

	return target;
}

//#region Create

const ERR_NO_REG = `Failed to create element: The provided constructor is not a registered custom element. Did you forget to call 'defineElement()'?`;
const SVG_TAGS = new Set([
	'svg',
	'animate',
	'animateMotion',
	'animateTransform',
	'set',
	'circle',
	'ellipse',
	'rect',
	'defs',
	'g',
	'symbol',
	'use',
	'path',
	'polygon',
	'polyline',
	'line',
	'clipPath',
	'mask',
	'marker',
	'switch',
	'foreignObject',
	'text',
	'textPath',
	'tspan',
	'desc',
	'metadata',
	'mpath',
	'linearGradient',
	'radialGradient',
	'pattern',
	'stop',
	'feBlend',
	'feColorMatrix',
	'feComponentTransfer',
	'feComposite',
	'feConvolveMatrix',
	'feDiffuseLighting',
	'feDisplacementMap',
	'feDistantLight',
	'feDropShadow',
	'feFlood',
	'feFuncA',
	'feFuncB',
	'feFuncG',
	'feFuncR',
	'feGaussianBlur',
	'feImage',
	'feMerge',
	'feMergeNode',
	'feMorphology',
	'feOffset',
	'fePointLight',
	'feSpecularLighting',
	'feSpotLight',
	'feTile',
	'feTurbulence',
	'filter',
	'view',
	'image',
]);
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

function isFragment(type: unknown): type is typeof DocumentFragment {
	return type === DocumentFragment;
}

function isDOMFactory(
	type: unknown,
): type is (options?: GlobalAttributes) => any {
	if (typeof type !== 'function') return false;
	if (type.prototype instanceof HTMLElement) return false;
	// if (type.prototype instanceof DocumentFragment) return false;
	return true;
}

/** `document.createDocumentFragment` 别名 */
export function $fragment(...nodes: (Node | string)[]): DocumentFragment {
	const fragment = document.createDocumentFragment();
	fragment.append(...nodes);
	return fragment;
}

/** 创建并设置元素 */
export function $new<
	T extends K extends Constructor<infer E extends HTMLElement>
		? E
		: K extends keyof HTMLElementTagNameMap
			? HTMLElementTagNameMap[K]
			: K extends keyof CustomElementTagNameMap
				? CustomElementTagNameMap[K]
				: K extends DocumentFragment
					? DocumentFragment
					: K extends (options?: GlobalAttributes | null) => infer R
						? R
						: HTMLElement,
	K extends
		| keyof HTMLElementTagNameMap
		| keyof CustomElementTagNameMap
		| (string & {})
		| ElementConstructor
		| typeof DocumentFragment
		| ((options?: GlobalAttributes | null) => any),
>(type: K, options?: DOMApplyOptions<K, T> | null, ...children: any[]): T {
	// Fragment
	if (isFragment(type)) return $fragment(...(options?.children ?? [])) as T;
	// Factory
	if (isDOMFactory(type)) return type(options as any);
	// Normal
	let name: string | null;
	if (typeof type === 'string') name = type;
	else name = customElements.getName(type);
	if (name === null) throw new Error(ERR_NO_REG);

	let element: T;
	if (typeof options?.xmlns === 'string') {
		element = document.createElementNS(options.xmlns, name) as T;
	} else if (SVG_TAGS.has(name)) {
		element = document.createElementNS(SVG_NAMESPACE, name) as T;
	} else {
		element = document.createElement(name) as T;
	}
	$apply(element, options, ...children);

	if (!options) return element;

	if (typeof options.ref === 'function') {
		try {
			options.ref(element);
		} catch (err) {
			console.error(err);
		}
	}
	return element;
}

/** 创建并设置 `<div>` 元素 */
export function $div<T>(
	options?: DOMApplyOptions<'div', HTMLDivElement & T> | null,
	...children: any[]
): HTMLDivElement & T {
	return $new('div', options, ...children);
}

/** 创建 `<slot>` 元素 */
export function $slot(name?: string): HTMLSlotElement {
	const slot = $new('slot');
	if (name) slot.name = name;
	return slot;
}

/** `document.createComment` 别名 */
export function $comment(data: string) {
	return document.createComment(data);
}

export function $svg<T extends keyof SVGElementTagNameMap>(
	name: T,
	options?: Omit<GlobalAttributes, 'ref'> & {
		[K in keyof SVGElementTagNameMap[T]]?: SVGElementTagNameMap[T][K] extends Function
			? never
			: SVGElementTagNameMap[T][K];
	},
	...children: any[]
): SVGElementTagNameMap[T] {
	const element = document.createElementNS(SVG_NAMESPACE, name);
	return $apply(element, options as any, ...children);
}

//#region Query

/** Element.querySelector 别名 */
export function $<K extends keyof HTMLElementTagNameMap>(
	selector: K,
	scope?: ParentNode,
): HTMLElementTagNameMap[K] | null;
export function $<K extends keyof SVGElementTagNameMap>(
	selector: K,
	scope?: ParentNode,
): SVGElementTagNameMap[K] | null;
export function $<K extends keyof MathMLElementTagNameMap>(
	selector: K,
	scope?: ParentNode,
): MathMLElementTagNameMap[K] | null;
export function $<E extends Element = HTMLElement>(
	selector: string,
	scope?: ParentNode,
): E | null;
export function $<E extends Element = HTMLElement>(
	selector: string,
	scope: ParentNode = document,
): E | null {
	return scope.querySelector<E>(selector);
}

/** Element.querySelectorAll 别名 */
export function $$<K extends keyof HTMLElementTagNameMap>(
	selector: K,
	scope?: ParentNode,
): HTMLElementTagNameMap[K][];
export function $$<K extends keyof SVGElementTagNameMap>(
	selector: K,
	scope?: ParentNode,
): SVGElementTagNameMap[K][];
export function $$<K extends keyof MathMLElementTagNameMap>(
	selector: K,
	scope?: ParentNode,
): MathMLElementTagNameMap[K][];
export function $$<E extends Element = HTMLElement>(
	selector: string,
	scope?: ParentNode,
): E[];
export function $$<E extends Element = HTMLElement>(
	selector: string,
	scope: ParentNode = document,
): E[] {
	return [...scope.querySelectorAll<E>(selector)];
}

//#region Other

export function $content(target: ParentNode): (Node | string)[] {
	return [...target.childNodes].map((node) =>
		node instanceof Text ? node.textContent : node,
	);
}

export function $clone<T extends DOMContents>(target: T): T {
	if (typeof target === 'string') return target;
	if (target instanceof Node) return target.cloneNode(true) as T;
	return target.map((node) =>
		node instanceof Node ? node.cloneNode(true) : node,
	) as T;
}

function parent(target: Element): Element | undefined {
	const parent = target.parentNode;
	if (parent instanceof Element) return parent;
	if (parent instanceof ShadowRoot) return parent.host as Element;
	return;
}

/** 获取元素路径 */
export function $path(from: Element): Element[] {
	const path = [from];
	let current = parent(from);
	while (current) {
		path.push(current);
		current = parent(current);
	}
	return path;
}

/** `Element.getBoundingClientRect()` 别名 */
export function $rect(target?: Element): DOMRect {
	return target?.getBoundingClientRect() ?? new DOMRect();
}

/**
 * 在 DOM 内容加载完毕后调用处理器并兑现 Promise；
 * 当 DOM 内容已加载完成时立即调用并兑现
 */
export function $ready(handler?: () => any): Promise<void> {
	return new Promise((resolve) => {
		const ready = () => {
			if (handler) queueMicrotask(() => handler!());
			resolve();
		};
		if (document.readyState !== 'loading') return ready();
		$once(document, 'DOMContentLoaded', ready);
	});
}
