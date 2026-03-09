import {
	type ArrayOr,
	asArray,
	EventEmitter,
	type EventHandler,
	IterableWeakSet,
	TwoKeyMap,
} from 'abm-utils';
import type { ComponentPropInit } from '../infra/decorator';
import type { ComponentConstructor } from '../infra/dom';
import type { Navigable } from '../navigate';
import { state } from '../state';

type ComponentProp = ComponentPropInit<any> & { key: string };

type AriaRole =
	| 'button'
	| 'checkbox'
	| 'gridcell'
	| 'link'
	| 'menuitem'
	| 'menuitemcheckbox'
	| 'option'
	| 'progressbar'
	| 'radio'
	| 'searchbox'
	| 'separator'
	| 'slider'
	| 'spinbutton'
	| 'switch'
	| 'tab'
	| 'tabpanel'
	| 'textbox'
	| 'treeitem'
	| 'img'
	| 'group'
	| (string & {});
export interface AriaConfig {
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Guides/Techniques) */
	role?: AriaRole;
	disabled?: boolean;
	hidden?: boolean;
	selected?: boolean;
	expanded?: boolean;
	checked?: boolean | 'mixed';
	pressed?: boolean;
	invalid?: boolean;
	hasPopup?: boolean | 'dialog' | (string & {});
	label?: string;
	valueMin?: string | boolean | number;
	valueMax?: string | boolean | number;
	valueNow?: string | boolean | number;
	valueText?: string | boolean | number;
}

interface ComponentConfig {
	hoverable?: boolean;
	activatable?: boolean;
	navigable?: boolean;
	aria?: AriaConfig;
}

//#region Helper

const ARIA_LITERAL = [
	'disabled',
	'hidden',
	'selected',
	'expanded',
	'checked',
	'pressed',
	'invalid',
	'hasPopup',
	'label',
	'valueMin',
	'valueMax',
	'valueNow',
	'valueText',
] as const;

const SUPPORT_TYPE = new Set<any>([String, Boolean, Number]);

const COMPONENT_PROPS = new TwoKeyMap<
	ComponentConstructor,
	string,
	ComponentProp
>();
const COMPONENT_ATTRS = new TwoKeyMap<
	ComponentConstructor,
	string,
	ComponentProp
>();
const COMPONENT_STYLE = new Map<
	ComponentConstructor['prototype'],
	CSSStyleSheet[]
>();

const navigableComponents = new Map<string, IterableWeakSet<Component>>();

function setComponent(component: Component<any, any>): void {
	let set = navigableComponents.get(component.id);
	if (!set) {
		set = new IterableWeakSet();
		navigableComponents.set(component.id, set);
	}
	set.add(component);
}

function removeComponent(component: Component<any, any>): void {
	navigableComponents.get(component.id)?.delete(component);
}

/** 获取对应 ID 的可导航组件 */
export function getNavigableComponents(id: string): Iterable<Component> {
	return navigableComponents.get(id) ?? [];
}

function isNavigable(self: Component<any, any>): boolean {
	let proto = Object.getPrototypeOf(self);
	while (proto && proto !== Component.prototype) {
		if ('navigable' in proto.constructor && proto.constructor.navigable)
			return true;
		if ('hoverable' in proto.constructor && proto.constructor.hoverable)
			return true;
		if ('handleLabelActive' in proto.constructor) return true;
		proto = Object.getPrototypeOf(proto);
	}
	return false;
}

/** 检查原型链 */
function checkProto(proto: ComponentConstructor): void {
	if (proto.prototype instanceof Component) return;
	throw new TypeError(
		`Expected a constructor that extends Widget, but got ${proto.name ?? 'anonymous function'}`,
	);
}

/** 继承父元素属性 */
function extend(
	map: TwoKeyMap<ComponentConstructor, string, ComponentPropInit<any>>,
	target: ComponentConstructor,
) {
	if (map.hasInnerMap(target)) return;
	const items: [string, ComponentPropInit<any>][] = [];
	let proto = Object.getPrototypeOf(target);
	while (proto && proto !== Component) {
		const inner = map.getInnerMap(proto);
		if (inner) items.push(...inner.entries());
		proto = Object.getPrototypeOf(proto);
	}
	items.reverse();
	map.setInnerMap(target, new Map(items));
}

/** 获取属性配置 */
function getProp(
	self: Component<any, any>,
	key: string,
): ComponentProp | undefined {
	const proto = Object.getPrototypeOf(self).constructor;
	return COMPONENT_PROPS.get(proto, key);
}
function getAttr(
	self: Component<any, any>,
	name: string,
): ComponentProp | undefined {
	const proto = Object.getPrototypeOf(self).constructor;
	return COMPONENT_ATTRS.get(proto, name);
}

/** 过滤属性值 */
export function filter(prop: ComponentPropInit<any>, value: any, current: any) {
	if (!prop.filter) return value;
	if (typeof prop.filter === 'function') return prop.filter(value, current);
	if (Array.isArray(prop.filter)) {
		return prop.filter.includes(value) ? value : current;
	}
	return prop.filter.has(value) ? value : current;
}

/** 属性转换为值 */
function convertToValue(
	prop: ComponentPropInit<any>,
	str: string | null,
	current: any,
) {
	let toValue = prop.toValue;
	if (!toValue) toValue = String;
	if (toValue === Boolean) {
		return filter(prop, str !== null && str !== 'false', current);
	}
	let value = toValue(str, current);
	if (SUPPORT_TYPE.has(toValue)) value = filter(prop, value, current);
	return value;
}

/** 值转换为属性 */
function valueToAttr(prop: ComponentPropInit<any>, value: any): string | null {
	if (prop.toAttr) return prop.toAttr(value);
	if (prop.toValue === Boolean) return value ? '' : null;
	return value ? String(value) : null;
}

/** 获取组件样式 */
function getStyle(self: Component<any, any>): CSSStyleSheet[] {
	const target = Object.getPrototypeOf(self);
	let sheets = COMPONENT_STYLE.get(target);
	if (sheets) return sheets;
	sheets = [];
	let proto = target.constructor;
	while (proto && proto !== Component.prototype) {
		sheets.push(
			...asArray(proto.style).filter((v) => v instanceof CSSStyleSheet),
		);
		proto = Object.getPrototypeOf(proto);
	}
	COMPONENT_STYLE.set(target, sheets);
	return sheets;
}

function collect(node: Node): ComponentConfig {
	let hoverable: undefined | boolean;
	let activatable: undefined | boolean;
	let navigable: undefined | boolean;
	let aria: undefined | AriaConfig;
	let proto = Object.getPrototypeOf(node);
	while (proto && proto !== Component.prototype) {
		if ('hoverable' in proto.constructor)
			hoverable ??= proto.constructor.hoverable;
		if ('activatable' in proto.constructor)
			activatable ??= proto.constructor.activatable;
		if ('navigable' in proto.constructor)
			navigable ??= proto.constructor.navigable;
		if ('aria' in proto.constructor)
			aria = Object.assign(proto.constructor.aria ?? {}, aria);
		proto = Object.getPrototypeOf(proto);
	}
	return { hoverable, activatable, navigable, aria };
}

function setupState(
	{ hoverable, activatable, navigable }: ComponentConfig,
	node: Node & Navigable,
) {
	if (hoverable) state.hover.add(node);
	if (activatable) state.active.add(node);
	if (navigable) {
		node.setAttribute('nav', '');
		node.tabIndex = -1;
	}
	node.toggleAttribute('nav-group', !!node.navChildren);
}

const rawCloneNode = HTMLElement.prototype.cloneNode;
HTMLElement.prototype.cloneNode = function cloneNode(
	this: Node,
	subtree?: boolean,
): Node {
	const node = rawCloneNode.call(this, subtree);
	if (!subtree) {
		if (node instanceof Component) (node as any).clone?.(this);
		return node;
	}
	const walker = document.createTreeWalker(this, NodeFilter.SHOW_ELEMENT);
	const cloneWalker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT);
	while (walker.lastChild());
	while (cloneWalker.lastChild());
	let next: any = true;
	while (next) {
		const from = walker.currentNode;
		const clone = cloneWalker.currentNode;
		next = walker.previousNode() && cloneWalker.previousNode();
		if (!(from instanceof Component)) continue;
		if (!(clone instanceof Component)) continue;
		(clone as any).clone(from);
	}
	return node;
};

function isBool(input: unknown): input is boolean {
	return typeof input === 'boolean';
}

function isStr(input: unknown): input is string {
	return typeof input === 'string';
}

function isNum(input: unknown): input is number {
	return typeof input === 'number';
}

function cap<T extends string>(input: T): Capitalize<T> {
	return (input[0].toUpperCase() + input.slice(1)) as Capitalize<T>;
}

//#region Main

/**
 * UI 组件
 * @description
 * 基础组件，提供事件机制、`nonNavigable` 接口
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/base)
 */
export abstract class Component<P extends {} = {}, E extends {} = {}>
	extends HTMLElement
	implements EventEmitter<E>, Navigable
{
	/**
	 * @description
	 * 仅用于属性声明，请勿覆盖、实现
	 */
	declare _props: P;
	/**
	 * @description
	 * 仅用于属性声明，请勿覆盖、实现
	 */
	declare _eventMap: E;
	_eventHandlers = new TwoKeyMap<keyof E, EventHandler<any>, AbortController>();
	#shadowRoot?: ShadowRoot;
	#style?: CSSStyleSheet[];
	/** 已初始化 */
	#initialized = false;
	/** 正在更新的属性值名称 */
	#updatingAttributes = new Set<string>();
	constructor(_props?: P) {
		super();
		setComponent(this);
	}
	/** 定义元素 */
	static define(proto: ComponentConstructor) {
		if (!(proto.prototype instanceof Component)) return;
		extend(COMPONENT_PROPS, proto);
		extend(COMPONENT_ATTRS, proto);
	}
	/**
	 * 定义属性
	 * @param proto 构造函数
	 * @param key 键值
	 * @param init 初始化参数
	 */
	static defineProperty(
		proto: ComponentConstructor,
		key: string,
		init: ComponentPropInit<any>,
	): void {
		checkProto(proto);
		extend(COMPONENT_PROPS, proto);
		extend(COMPONENT_ATTRS, proto);
		const prop: ComponentProp = { ...init, key };
		COMPONENT_PROPS.set(proto, key, prop);
		COMPONENT_ATTRS.set(proto, init.name ?? key, prop);
		if (!Array.isArray(proto.observedAttributes)) {
			proto.observedAttributes = [];
		}
		proto.observedAttributes.push(key);
	}
	/**
	 * 预定义样式
	 * @description
	 * 只在调用 `this.attachShadow()` 后生效
	 */
	protected static style?: ArrayOr<CSSStyleSheet>;
	/** 可悬停 */
	protected static hoverable?: boolean;
	/** 可激活 */
	protected static activatable?: boolean;
	/** 可导航 */
	protected static navigable?: boolean;
	/** ARIA */
	protected static aria?: AriaConfig;
	/** 待观察的属性名列表 */
	protected static observedAttributes?: string[];
	/**
	 * 元素初始化回调
	 * @description
	 * 该回调会在首次连接到文档时触发
	 */
	protected init?(): void;
	/** 元素连接到文档回调 */
	protected connectedCallback(): void {
		if (this.#initialized) return;
		this.#initialized = true;
		const config = collect(this);
		setupState(config, this);
		this.updateAria(config.aria);
		this.init?.();
	}
	/** 元素从文档断开连接回调 */
	protected disconnectedCallback(): void {
		state.hover.set(this, false);
		state.active.set(this, false, true);
	}
	/** 元素移动到新文档回调 */
	protected adoptedCallback?(): void;
	/**
	 * 属性变化回调
	 * @param name 属性名
	 * @param oldValue 旧值
	 * @param newValue 新值
	 */
	protected attributeChangedCallback(
		name: string,
		oldValue: string | null,
		newValue: string | null,
	) {
		if (newValue === oldValue) return;
		if (this.#updatingAttributes.has(name)) return;
		const attr = getAttr(this, name);
		if (!attr) return;
		const value = convertToValue(attr, newValue, (this as any)[attr.key]);
		(this as any)[attr.key] = value;
	}
	/**
	 * 克隆节点数据
	 * @param from 源节点
	 */
	protected clone?(from: this): void;
	/** 对应标签激活回调 */
	handleLabelActive?(active: boolean, cancel: boolean): void;
	attachShadow(
		init: Partial<ShadowRootInit> = {},
		...template: (Node | string)[]
	): ShadowRoot {
		this.#shadowRoot = super.attachShadow({ mode: 'closed', ...init });
		this.#style = getStyle(this);
		this.#shadowRoot.adoptedStyleSheets = this.#style;
		this.#shadowRoot.append(...template);
		return this.#shadowRoot;
	}
	/**
	 * 更新独立样式
	 * @description
	 * 仅当设置 ShadowRoot 后生效
	 */
	protected updateStyles(...sheets: (CSSStyleSheet | string)[]) {
		if (!this.#shadowRoot) return;
		if (!this.#style) return;
		this.#shadowRoot.adoptedStyleSheets = [
			...this.#style,
			...sheets.map((css) => {
				if (css instanceof CSSStyleSheet) return css;
				const sheet = new CSSStyleSheet();
				sheet.replaceSync(css);
				return sheet;
			}),
		];
	}
	/** 更新 ARIA 配置 */
	protected updateAria(config?: AriaConfig): void {
		if (!config) return;
		const { role } = config;
		if (role) this.role = role;
		for (const key of ARIA_LITERAL) {
			const aria: `aria${Capitalize<(typeof ARIA_LITERAL)[number]>}` = `aria${cap(key)}`;
			const value = config[key];
			if (isBool(value)) this[aria] = String(value);
			else if (isNum(value)) this[aria] = String(value);
			else if (isStr(value)) this[aria] = value;
		}
	}
	/**
	 * 更新属性
	 * @param key 名称
	 */
	updateProperty(key: string): void {
		const prop = getProp(this, key);
		if (!prop) return;
		const value = (this as any)[key];
		const str = valueToAttr(prop, value);
		const name = prop.name ?? key;
		this.#updatingAttributes.add(name);
		if (str === null) this.removeAttribute(name);
		else this.setAttribute(name, String(str));
		this.#updatingAttributes.delete(name);
	}
	on<K extends keyof E & string>(
		event: K,
		handler: EventHandler<E[K] extends any[] ? E[K] : [E[K]]>,
	): void {
		EventEmitter.prototype.on.call(this, event, handler);
	}
	once<K extends keyof E & string>(
		event: K,
		handler: EventHandler<E[K] extends any[] ? E[K] : [E[K]]>,
	): void {
		EventEmitter.prototype.once.call(this, event, handler);
	}
	off<K extends keyof E & string>(
		event: K,
		handler: EventHandler<E[K] extends any[] ? E[K] : [E[K]]>,
	): void {
		EventEmitter.prototype.off.call(this, event, handler);
	}
	emit<K extends keyof E & string>(
		event: K,
		...args: E[K] extends any[] ? E[K] : [E[K]]
	): void {
		EventEmitter.prototype.emit.call(this, event, ...args);
	}
	get id() {
		return super.id;
	}
	set id(value: string) {
		value = String(value);
		if (super.id === value) return;
		const navigable = isNavigable(this);
		if (navigable) removeComponent(this);
		super.id = value;
		if (navigable) setComponent(this);
	}
	cloneNode(subtree?: boolean): this {
		return super.cloneNode(subtree) as this;
	}
}
