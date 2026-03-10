import { BiMap, type Constructor, clamp, typeCheck } from 'abm-utils';
import { defineElement, property } from '../infra/decorator';
import type { ElementProps } from '../infra/dom';
import { $div, $new, $rect, $slot } from '../infra/dom';
import { register } from '../infra/registry';
import { $style, css } from '../infra/style';
import { Component } from './base';

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-page-host': PageHost<PageRecord>;
	}
}

declare module '../infra/registry' {
	interface Registry {
		'page-host': PageHost<any>;
	}
}

type Key<T> = (keyof T & string) | (string & {});
type Args<T, K> =
	K extends PageConstructor<infer A>
		? A
		: K extends keyof T
			? T[K] extends PageConstructor<infer A>
				? A
				: any[]
			: any[];

const kHost = Symbol();
const kRoot = Symbol();

function isPageConstructor(page: unknown): page is PageConstructor {
	if (typeof page !== 'function') return false;
	if (!('prototype' in page)) return false;
	return page.prototype instanceof Page;
}

function setHidden(target: HTMLElement, hidden: boolean): void {
	target.style.visibility = hidden ? 'hidden' : '';
}

//#region #Page

/** 页面基类 */
export abstract class Page {
	[kHost]!: PageHost<PageRecord>;
	[kRoot]!: HTMLDivElement;
	/**
	 * 页面宿主
	 * @description
	 * 仅在页面开始初始化后可访问
	 */
	get host() {
		return this[kHost];
	}
	/**
	 * 页面根元素
	 * @description
	 * 仅在页面开始初始化后可访问
	 */
	get root() {
		return this[kRoot];
	}
	/** 页面初始化回调 */
	init?(): void;
	/** 进入页面回调 */
	enter?(): void;
	/**
	 * 收集当前页面中可用于页面间连接动画的元素
	 * @description
	 * 键名（key）用于匹配，元素（HTMLElement）将用于捕获视觉状态。
	 * 此方法会在页面即将退出或进入前调用。
	 */
	collectConnectableElements?(): ConnectableElements;
	/** 退出页面回调 */
	exit?(): void;
	/** 页面销毁回调 */
	destroy?(): void;
}

/** 单例页面基类 */
export abstract class SingletonPage<Args extends any[] = any[]> extends Page {
	/** 页面复用配置回调 */
	setup?(...args: Args): void;
}

/** 页面构造器 */
export type PageConstructor<Args extends any[] = any[]> =
	| Constructor<Page, Args>
	| Constructor<SingletonPage<Args>, Args>;
/** 页面记录 */
export type PageRecord = Record<string, PageConstructor>;

//#region #History
/**
 * 页面历史记录管理器接口
 * @template T 历史记录项数据类型
 */
export interface PageHistory<T> {
	/** 将一个新项推入历史记录栈 */
	push(item: T): void;
	/** 导航到历史记录中的上一项 */
	back(): T | undefined;
	/** 导航到历史记录中的下一项 */
	forward(): T | undefined;
	/** 跳转到历史记录栈中的指定索引位置 */
	goto(index: number): T | undefined;
	/** 当前活动的历史记录项 */
	get current(): T | undefined;
	/** 当前历史记录项的索引 */
	get currentIndex(): number;
	/** 历史记录栈的总长度 */
	get length(): number;
}

/**
 * 空页面历史记录实现
 * @description
 * 此实现不维护任何历史记录栈，仅保留当前项。
 * 适用于不需要历史记录功能的场景。
 */
export class NonPageHistory<T> implements PageHistory<T> {
	#current?: T;
	push(item: T): void {
		this.#current = item;
	}
	back(): T | undefined {
		this.#current = undefined;
		return;
	}
	forward(): T | undefined {
		return;
	}
	goto(index: number): T | undefined {
		return index ? undefined : this.#current;
	}
	get current(): T | undefined {
		return this.#current;
	}
	get currentIndex(): number {
		return this.#current ? 0 : -1;
	}
	get length(): number {
		return this.#current ? 1 : 0;
	}
}

/**
 * 栈式页面历史记录实现
 * @description
 * 此实现基于栈结构维护完整的历史记录，支持前进、后退和跳转等标准导航操作。
 * 当推入新项时，会清除当前位置之后的所有历史记录。
 */
export class StackPageHistory<T> implements PageHistory<T> {
	#stack: T[] = [];
	#current = -1;
	push(item: T): void {
		this.#current++;
		if (this.#current < this.length) {
			this.#stack = this.#stack.slice(0, this.#current);
		}
		this.#stack.push(item);
	}
	back(): T | undefined {
		if (this.#current > -1) this.#current--;
		return this.current;
	}
	forward(): T | undefined {
		if (this.#current + 1 >= this.length) return;
		this.#current++;
		return this.current;
	}
	goto(index: number): T | undefined {
		this.#current = clamp(-1, index, this.length - 1);
		return this.current;
	}
	get current(): T | undefined {
		return this.#stack[this.#current];
	}
	get currentIndex(): number {
		return this.#current;
	}
	get length(): number {
		return this.#stack.length;
	}
}

//#region #Transition
/** 页面变换动画类型 */
export type PageTransitionType = keyof typeof TRANSITION | 'suppress';
/** 页面变换参数 */
export interface PageTransitionOptions {
	/** 切换动画 */
	transition?: PageTransitionType;
	/** 用于匹配的连接动画元素集 */
	connectFrom?: ConnectableElements;
	/** 连接动画是否为单向 */
	connectOneWay?: boolean;
}
/** 动画关键帧 */
type Keyframes = Keyframe[] | PropertyIndexedKeyframes;
const TRANSITION = {
	fade: [{ opacity: [1, 0] }, { opacity: [0, 1] }],
	entrance: [{ opacity: [1, 0] }, { top: ['128px', '0px'] }],
	drill: [
		{ opacity: [1, 0], scale: [1, 1.1] },
		{ opacity: [0, 1], scale: [0.9, 1] },
	],
	slideFromRight: [{ left: ['0px', '-128px'] }, { left: ['128px', '0px'] }],
	slideFromLeft: [{ left: ['0px', '128px'] }, { left: ['-128px', '0px'] }],
} as const satisfies Record<string, [prev: Keyframes, next: Keyframes]>;
const PREV_ANIMATION_OPTIONS: KeyframeAnimationOptions = {
	duration: 200,
	easing: 'cubic-bezier(1,0,1,1)',
};
const NEXT_ANIMATION_OPTIONS: KeyframeAnimationOptions = {
	duration: 200,
	easing: 'cubic-bezier(0,1,1,1)',
};

/** 创建可取消动画 */
function animate(
	signal: AbortSignal,
	target: HTMLElement,
	keyframes: Keyframes,
	options: number | KeyframeAnimationOptions,
	reverse?: boolean,
): Animation {
	const animation = target.animate(keyframes, options);
	signal.addEventListener('abort', () => {
		if (animation.playState === 'finished') return;
		animation.cancel();
	});
	if (reverse) animation.reverse();
	animation.play();
	return animation;
}

/** 播放过渡动画 */
function transition(
	enter: HTMLElement | undefined,
	exit: HTMLElement | undefined,
	type: PageTransitionType,
	reverse?: boolean,
): AbortController {
	const controller = new AbortController();
	const { signal } = controller;

	const cleanup = () => {
		exit?.remove();
		if (enter) setHidden(enter, false);
	};
	signal.addEventListener('abort', cleanup);

	if (type === 'suppress') {
		cleanup();
		return controller;
	}

	const [prevKeyframes, nextKeyframes] = TRANSITION[type];
	const enterKeyframes = reverse ? prevKeyframes : nextKeyframes;
	const exitKeyframes = reverse ? nextKeyframes : prevKeyframes;
	const enterOption = reverse ? PREV_ANIMATION_OPTIONS : NEXT_ANIMATION_OPTIONS;
	const exitOption = reverse ? NEXT_ANIMATION_OPTIONS : PREV_ANIMATION_OPTIONS;
	if (!exit) {
		if (!enter) return controller;
		setHidden(enter, false);
		animate(signal, enter, enterKeyframes, enterOption, reverse);
		return controller;
	}
	const animation = animate(signal, exit, exitKeyframes, exitOption, reverse);
	animation.onfinish = () => {
		if (controller.signal.aborted) return;
		exit?.remove();
		if (!enter) return;
		setHidden(enter, false);
		animate(signal, enter, enterKeyframes, enterOption, reverse);
	};

	return controller;
}

//#region #Connect
/** 支持连接动画的元素集合 */
export type ConnectableElements = Record<string, HTMLElement>;
/** 连接样式 */
type ConnectStyle = Record<string, string | number>;
/** 预备连接动画 */
interface PreparedConnectAnimation {
	element: HTMLElement;
	style: ConnectStyle;
}
/** 已计算的连接动画 */
interface ComputedConnectAnimation {
	start: HTMLElement;
	end: HTMLElement;
	startStyle: ConnectStyle;
	middleStyle: ConnectStyle;
	endStyle: ConnectStyle;
}
/** 可复制样式 */
type CopyableStyleKey = {
	[K in keyof CSSStyleDeclaration]: CSSStyleDeclaration[K] extends string
		? K
		: never;
}[keyof CSSStyleDeclaration];
const CONNECT_ANIMATION_OPTIONS: KeyframeAnimationOptions = {
	duration: 400,
	easing: 'cubic-bezier(1,0,0,1)',
};
const CONNECT_NUM_STYLES: (keyof ConnectStyle)[] = [
	'top',
	'left',
	'height',
	'width',
];
const CONNECT_COPY_STYLES: CopyableStyleKey[] = [
	'opacity',
	'borderRadius',
	'aspectRatio',
	'backdropFilter',
	'background',
	'border',
	'boxShadow',
	'color',
	'display',
	'filter',
	'font',
	'objectFit',
	'objectPosition',
	'outline',
	'padding',
];
function normalizeStyle(style: ConnectStyle): ConnectStyle {
	for (const key of CONNECT_NUM_STYLES) {
		style[key] = `${style[key]}px`;
	}
	return style;
}
/** 获取连接元素样式 */
function getConnectElementStyle(
	{ x, y }: DOMRect,
	element: HTMLElement,
): ConnectStyle | undefined {
	const { top, left, height, width } = $rect(element);
	const styles = getComputedStyle(element);
	if (styles.display === 'none') return;
	// if (styles.visibility === 'hidden') return;
	const result: ConnectStyle = {
		top: top - y,
		left: left - x,
		height,
		width,
	};
	for (const key of CONNECT_COPY_STYLES) result[key] = styles[key];
	return result;
}
/** 预备连接元素 */
function prepareConnectElements(
	root: DOMRect,
	elements?: ConnectableElements,
): Map<string, PreparedConnectAnimation> {
	const map = new Map<string, PreparedConnectAnimation>();
	if (!elements) return map;
	for (const [key, element] of Object.entries(elements)) {
		if (!element.isConnected) continue;
		const style = getConnectElementStyle(root, element);
		if (!style) continue;
		map.set(key, { element, style });
	}
	return map;
}
/** 计算连接元素 */
function computeConnectElements(
	prepared: Map<string, PreparedConnectAnimation>,
	root: DOMRect,
	elements?: ConnectableElements,
	reverse?: boolean,
): ComputedConnectAnimation[] {
	const animations: ComputedConnectAnimation[] = [];
	if (!elements) return animations;
	for (const [key, { element, style }] of prepared) {
		const target = elements[key];
		if (!target?.isConnected) continue;
		const targetStyle = getConnectElementStyle(root, target);
		if (!targetStyle) continue;
		const maxTop = Math.max(style.top as number, targetStyle.top as number);
		animations.push({
			start: reverse ? target : element,
			end: reverse ? element : target,
			startStyle: normalizeStyle(reverse ? targetStyle : style),
			middleStyle: { top: `${maxTop + 64}px` },
			endStyle: normalizeStyle(reverse ? style : targetStyle),
		});
	}
	return animations;
}
/** 播放连接动画 */
function connect(
	root: ParentNode,
	connectAnimations: ComputedConnectAnimation[],
): AbortController {
	const controller = new AbortController();
	const { signal } = controller;
	for (const {
		start,
		end,
		startStyle,
		middleStyle,
		endStyle,
	} of connectAnimations) {
		setHidden(end, true);
		const ghost = start.cloneNode(true) as HTMLElement;
		$style(ghost, { ...startStyle, position: 'absolute' });
		setHidden(start, true);
		root.append(ghost);
		const animation = animate(
			signal,
			ghost,
			[startStyle, middleStyle, endStyle],
			CONNECT_ANIMATION_OPTIONS,
		);
		animation.onfinish = () => {
			ghost.remove();
			setHidden(start, false);
			setHidden(end, false);
		};
		animation.oncancel = animation.onfinish;
	}
	return controller;
}

//#region #Switch
/**
 * 切换页面
 * @param host 页面宿主
 * @param prev 前一页面历史记录
 * @param next 后一页面历史记录
 * @param reverse 反向切换
 * @returns 停止页面切换动画
 */
function switchPage(
	updateObserver: (oldPage?: HTMLElement, newPage?: HTMLElement) => void,
	host: PageHost<any>,
	prev: PageHistoryItem | undefined,
	next: PageHistoryItem,
	reverse?: boolean,
): () => void {
	if (prev?.context === next.context) return () => {};
	const enterItem = (reverse ? prev : next)?.context;
	const exitItem = (reverse ? next : prev)?.context;
	const enter = enterItem?.container;
	const exit = exitItem?.container;
	// Pre Layout
	updateObserver(exit, enter);
	if (enter) {
		setHidden(enter, true);
		if (reverse) host.prepend(enter);
		else host.append(enter);
	}
	const root = $rect(host);
	const prepared = prepareConnectElements(root, next.connectedElements);
	// Life Callback
	exitItem?.page.exit?.();
	enterItem?.page.enter?.();
	// Connect
	const computed = computeConnectElements(
		prepared,
		root,
		next.context.page.collectConnectableElements?.(),
		reverse,
	);
	const connectController = connect(host, computed);
	// Transition
	const transitionController = transition(enter, exit, next.transition, reverse);

	return () => {
		connectController.abort();
		transitionController.abort();
	};
}

//#region #Host

/** 页面上下文 */
interface PageContext<T extends Page = Page> {
	page: T;
	singleton: boolean;
	container: HTMLDivElement;
}
/** 页面历史记录 */
interface PageHistoryItem {
	context: PageContext;
	transition: PageTransitionType;
	connectedElements?: ConnectableElements;
	args?: any[];
}
/** 新页面打开参数 */
type PagePushOption<T> = T | ({ page: T } & PageTransitionOptions);

export interface PageHostProps<T extends PageRecord>
	extends ElementProps<PageHost<T>, never, 'current'> {}

/**
 * 页面宿主
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/page)
 */
@register('page-host')
@defineElement('abm-page-host')
export class PageHost<T extends PageRecord> extends Component<
	PageHostProps<T>
> {
	protected static style = css`
		:host {
			display: block;
			position: relative;
			overflow: clip;
		}
		::slotted([abm-page]) {
			position: absolute;
			inset: 0;
			width: 100%;
			height: 100%;
			max-width: 100%;
			max-height: 100%;
		}
		:host([autoHeight]) { height: var(--page-content-height, 0px) }
		:host([autoHeight]) ::slotted([abm-page]) { height: max-content }
	`;
	#history?: PageHistory<PageHistoryItem>;
	#cache = new Map<PageConstructor, PageContext<SingletonPage>>();
	#map = new BiMap<string, PageConstructor>();
	#cancelAnimation?: () => void;
	#resizeObserver = new ResizeObserver(() => this.#updateView());
	constructor(_props?: PageHostProps<T>) {
		super();
		this.attachShadow({}, $slot());
	}
	#updateObserver = (oldPage?: HTMLElement, newPage?: HTMLElement) => {
		if (oldPage) this.#resizeObserver.unobserve(oldPage);
		if (newPage) this.#resizeObserver.observe(newPage);
	};
	#updateView() {
		const page = this.#history?.current?.context.container;
		$style(this, { $pageContentHeight: page?.scrollHeight ?? 0 });
	}
	#create(page: PageConstructor, args: any[]): PageContext {
		let context = this.#cache.get(page);
		if (context) {
			context.page.setup?.(...args);
			return context;
		}
		context = {
			page: new page(...args),
			singleton: page.prototype instanceof SingletonPage,
			container: $div({ attr: { 'abm-page': '' } }),
		};
		context.page[kHost] = this as any;
		context.page[kRoot] = context.container;
		context.page.init?.();
		if (context.singleton) this.#cache.set(page, context);
		return context;
	}
	//#region History
	/**
	 * 历史记录
	 * @description
	 * 仅允许设置一次历史记录；
	 * 若未设置历史记录实例将会创建默认实例。
	 */
	get history() {
		if (!this.#history) this.#history = new NonPageHistory();
		return this.#history;
	}
	set history(value) {
		if (this.#history) return;
		this.#history = value;
	}
	/** 当前页面 */
	get current(): Page | undefined {
		return this.#history?.current?.context.page;
	}
	/**
	 * 打开新页面
	 * @returns 是否成功打开新页面
	 */
	push<K extends Key<T> | PageConstructor>(
		option: PagePushOption<K>,
		...args: Args<T, K>
	): boolean {
		// Parse
		let proto: PageConstructor | undefined;
		let options: PageTransitionOptions | undefined;
		if (typeof option === 'string') proto = this.#map.get(option);
		else if (isPageConstructor(option)) proto = option;
		else if (option && typeof option === 'object') {
			options = option;
			if (typeof option.page === 'string') proto = this.#map.get(option.page);
			else if (isPageConstructor(option.page)) proto = option.page;
		}
		if (!proto) return false;
		// History
		const prev = this.history.current;
		const context = this.#create(proto, args);
		const next: PageHistoryItem = {
			context,
			transition: options?.transition ?? this.#transition,
			connectedElements: options?.connectOneWay ? undefined : options?.connectFrom,
			args: context.singleton ? args : undefined,
		};
		this.history.push(next);
		// Cancel animation
		this.#cancelAnimation?.();
		// Switch
		this.#cancelAnimation = switchPage(this.#updateObserver, this, prev, {
			...next,
			connectedElements: options?.connectFrom,
		});
		return true;
	}
	/**
	 * 导航到历史记录中的上一项
	 * @description
	 * 默认情况下，只剩下一个页面时不关闭；
	 * 强制返回时，最后一个页面会被关闭并显示占位符
	 * @param force 强制返回
	 * @returns 是否成功导航
	 */
	back(
		force?: boolean,
		options?: Omit<PageTransitionOptions, `connect${string}`>,
	): boolean {
		if (!this.#history) return false;
		// History
		const next = this.history.current;
		if (!next) return false;
		if (!force && this.history.currentIndex === 0) return false;
		const prev = this.history.back();
		// Stop prev transition
		this.#cancelAnimation?.();
		// Singleton
		if (prev?.context.page instanceof SingletonPage && prev.args) {
			prev.context.page.setup?.(...prev.args);
		}
		this.#cancelAnimation = switchPage(
			this.#updateObserver,
			this,
			prev,
			{ ...next, transition: options?.transition ?? next.transition },
			true,
		);
		return true;
	}
	/**
	 * 导航到历史记录中的下一项
	 * @returns 是否成功导航
	 */
	forward(options?: Omit<PageTransitionOptions, `connect${string}`>): boolean {
		if (!this.#history) return false;
		// History
		const prev = this.history.current;
		const next = this.history.forward();
		if (!next) return false;
		// Cancel animation
		this.#cancelAnimation?.();
		// Switch
		this.#cancelAnimation = switchPage(this.#updateObserver, this, prev, {
			...next,
			transition: options?.transition ?? next.transition,
		});
		return true;
	}
	/**
	 * 跳转到历史记录栈中的指定索引位置
	 * @returns 是否成功导航
	 */
	goto(
		index: number,
		options?: Omit<PageTransitionOptions, `connect${string}`>,
	): boolean {
		if (!this.#history) return false;
		// History
		const currentIndex = this.history.currentIndex;
		const current = this.history.current;
		const goto = this.history.goto(index);
		const gotoIndex = this.history.currentIndex;
		const diff = gotoIndex - currentIndex;
		if (!diff) return false;
		const reverse = diff === -1;
		const prev = reverse ? goto : current;
		const next = reverse ? current : goto;
		// Cancel animation
		this.#cancelAnimation?.();
		// Switch
		this.#cancelAnimation = switchPage(
			this.#updateObserver,
			this,
			prev,
			{ ...next!, transition: options?.transition ?? next!.transition },
			reverse,
		);
		return true;
	}
	//#region Register
	/**
	 * 注册页面
	 * @param name 页面名称
	 * @param page 页面类
	 * @returns 若已存在对应名称或页面类，返回 `false`
	 */
	register<K extends Key<T>>(
		name: K,
		page: K extends keyof T ? T[K] : PageConstructor,
	): boolean {
		if (!isPageConstructor(page)) {
			throw new TypeError('Page class require extends of Page', {
				cause: { name, page },
			});
		}
		if (this.#map.has(name)) return false;
		if (this.#map.inverse.has(page)) return false;
		this.#map.set(name, page);
		return true;
	}
	/**
	 * 取消注册页面
	 * @param page 页面名称或页面类
	 * @returns 若未存在对应页面类，返回 `false`
	 */
	unregister<K extends Key<T>>(page: K | PageConstructor): boolean {
		if (typeof page === 'string') return this.#map.delete(page);
		return this.#map.inverse.delete(page);
	}
	/**
	 * 检查页面是否已经注册
	 * @param page 页面名称或页面类
	 */
	isRegistered<K extends Key<T>>(page: K | PageConstructor): boolean {
		if (typeof page === 'string') return this.#map.has(page);
		return this.#map.inverse.has(page);
	}
	/** 获取已注册的页面名称 */
	getName(page: PageConstructor): string | undefined {
		return this.#map.inverse.get(page);
	}
	/** 获取已注册的页面类 */
	getPage<K extends Key<T>>(
		name: K,
	): (K extends keyof T ? T[K] : PageConstructor) | undefined {
		return this.#map.get(name) as any;
	}
	//#region Other
	#transition: PageTransitionType = 'suppress';
	get transition() {
		return this.#transition;
	}
	@typeCheck(...Object.keys(TRANSITION), 'suppress')
	set transition(value) {
		this.#transition = value;
	}
	/** 自动高度 */
	@property({ reflect: true, toValue: Boolean })
	accessor autoHeight = false;
	protected clone(from: this): void {
		this.transition = from.transition;
		this.autoHeight = from.autoHeight;
		for (const [name, page] of from.#map) this.#map.set(name, page);
	}
	static new<T extends PageRecord>(
		pages: T,
		history?: PageHistory<unknown>,
	): PageHost<T> {
		const host = $new(PageHost<T>);
		host.#history = history as PageHistory<PageHistoryItem>;
		for (const [name, page] of Object.entries(pages)) {
			host.register(name, page as any);
		}
		return host;
	}
}
