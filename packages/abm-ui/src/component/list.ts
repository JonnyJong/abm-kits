import {
	applyConditionalOperation,
	clamp,
	SyncList,
	shift,
	sleep,
	typeCheck,
} from 'abm-utils';
import { defineElement, property } from '../infra/decorator';
import type { ElementProps } from '../infra/dom';
import { $slot } from '../infra/dom';
import { register } from '../infra/registry';
import { $style, css } from '../infra/style';
import { viewportTracker } from '../infra/viewport-tacker';
import { keyboard } from '../input/keyboard';
import { MovementController, type MovementEvent } from '../movement';
import type { Navigable, NavState } from '../navigate/index';
import { state } from '../state';
import { type AriaConfig, Component } from './base';
import { FormControl, type FormControlEventMap } from './form';

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-list': List;
	}
}

declare module '../infra/registry' {
	interface Registry {
		list: List;
	}
}

export const PART = {
	INIT: 'init',
	FILTER: 'filtered',
	SELECT: 'selected',
	SORT: 'sorting',
} as const;

const kHost = Symbol();

//#region #Item

export interface ListItemProp<T = any> extends ElementProps<ListItem<T>> {}

export abstract class ListItem<T = any>
	extends Component<ListItemProp<T>>
	implements Navigable
{
	[kHost]!: List<T>;
	/** 宿主列表 */
	get host() {
		return this[kHost];
	}
	/** 值 */
	abstract value: T;
	/** 元素最小尺寸 */
	viewMinSize?: number;
	protected connectedCallback(): void {
		super.connectedCallback();
		sleep(0).then(() => this.classList.remove(PART.INIT));
	}
	//#region Active
	#activeTrigger?: HTMLElement;
	/**
	 * active 事件触发器
	 * @description
	 * 用户通过点击该元素来触发 active 事件。
	 * 请绑定到可导航元素（`nav`）上以确保可访问性。
	 *
	 * 支持鼠标、触摸、键盘、游戏控制器。
	 */
	protected get activeTrigger() {
		return this.#activeTrigger;
	}
	protected set activeTrigger(value) {
		if (this.#activeTrigger === value) return;
		if (this.#activeTrigger) {
			state.active.off(this.#activeTrigger, this.#handleActive);
		}
		this.#activeTrigger = value;
		if (value) state.active.on(value, this.#handleActive);
	}
	#handleActive = (active: boolean, cancel: boolean) => {
		if (active || cancel) return;
		this.active();
	};
	/** 触发 */
	protected active() {
		this[kHost].emitActive(this);
	}
	//#region Select
	#selectTrigger?: HTMLElement;
	/**
	 * 选择触发器
	 * @description
	 * 用户通过点击该元素来触发选择。
	 * 请绑定到可导航元素（`nav`）上以确保可访问性。
	 *
	 * 支持鼠标、触摸、键盘、游戏控制器。
	 */
	protected get selectTrigger() {
		return this.#selectTrigger;
	}
	protected set selectTrigger(value) {
		if (this.#selectTrigger === value) return;
		if (this.#selectTrigger) {
			state.active.off(this.#selectTrigger, this.#handleSelect);
		}
		this.#selectTrigger = value;
		if (value) state.active.on(value, this.#handleSelect);
	}
	#handleSelect = (active: boolean, cancel: boolean) => {
		if (active || cancel) return;
		this[kHost].emitSelect(this);
	};
	//#region Sort
	#sorting = false;
	#dragHandle?: HTMLElement;
	/**
	 * 拖拽把手
	 * @description
	 * 用户通过长按该元素来启动排序。
	 * 请绑定到可导航元素（`nav`）上以确保可访问性。
	 *
	 * 支持鼠标、触摸、键盘、游戏控制器。
	 */
	get dragHandle() {
		return this.#dragHandle;
	}
	protected set dragHandle(value) {
		if (this.#dragHandle === value) return;
		this.host?.updateSortHandle(value, this.#dragHandle);
		this.#dragHandle = value;
	}
	/**
	 * 处理导航排序
	 * @description
	 * 导航排序开始后将导航事件重定向到此处
	 */
	protected handleNavSort(state: NavState) {
		if (!this.#sorting) return;
		this.host.emitSort(this, state);
	}
	/**
	 * 开始排序
	 * @description
	 * 调用该方法以通知排序导航式排序开始
	 */
	protected startSort() {
		if (this.#sorting) return;
		this[kHost].emitSort(this, { type: 'focus' });
	}
	/**
	 * 停止排序
	 * @param cancel 取消排序
	 * @description
	 * 调用该方法以通知排序导航式排序结束
	 */
	protected stopSort(cancel?: boolean) {
		if (!this.#sorting) return;
		this[kHost].stopSort(this, cancel);
		this.#sorting = false;
	}
	sortStart() {
		if (this.#sorting) return;
		this.#sorting = true;
		if (!this.#activeTrigger) return;
		state.active.set(this.#activeTrigger, false, true);
	}
}

//#region #List

export interface ListProp<T = any> extends ElementProps<List<T>> {}

export interface ListEventMap<T> extends FormControlEventMap<T[]> {
	/** 激活事件 */
	active: [value: T, index: number];
	/** 选择事件 */
	select: [];
	/** 排序事件 */
	sort: [];
}

/**
 * 列表
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form/list)
 */
@register('list')
@defineElement('abm-list')
export class List<T = any, I extends ListItem<T> = ListItem<T>>
	extends FormControl<T[], ListProp<T>, ListEventMap<T>>
	implements Navigable
{
	protected static style = css`
		:host {
			display: block;
			position: relative;
		}
		::slotted(*) {
			position: absolute;
			width: 100%;
			transition: .2s top, .2s opacity;
		}
		::slotted(.init) { opacity: 0 }
		:host(.sorting) ::slotted(:not(.sorting)) { opacity: .5 }
		::slotted(.sorting) {
			z-index: 1;
			opacity: 1;
			transition: .2s opacity;
		}
		::slotted(.hidden) { visibility: hidden }
	`;
	protected static aria: AriaConfig = { role: 'list' };
	#resizeObserver = new ResizeObserver(() => this.#updateView());
	#intersectionObserver = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.target.classList.contains(PART.SORT)) continue;
				entry.target.classList.toggle('hidden', !entry.isIntersecting);
			}
		},
		{ rootMargin: '128px' },
	);
	constructor(_props?: ListProp<T>) {
		super();
		this.attachShadow({}, $slot());
		this.#resizeObserver.observe(this);
	}
	#default = [];
	get default() {
		return this.#default;
	}
	set default(value) {
		if (!Array.isArray(value)) return;
		this.#default = value;
	}
	get value() {
		return this.#list.items;
	}
	set value(value) {
		this.#list.replace(...value);
	}
	get items() {
		return [...this.#list.instances];
	}
	//#region Item
	#itemCreator?: (value: T) => I;
	get itemCreator() {
		return this.#itemCreator;
	}
	set itemCreator(value) {
		if (this.#itemCreator === value) return;
		this.#itemCreator = value;
		this.#list.creatable = !!value;
		if (!(this.#itemCreator && value)) return;
		this.#list.rebuild();
	}
	#list = new SyncList<T, I>({
		getData: (instance) => instance.value,
		setData(instance, data) {
			instance.value = data;
		},
		create: (data) => this.#create(data),
		reset: (instance, data) => {
			instance.value = data;
			instance.classList.add(PART.INIT);
			instance.style.cssText = '';
		},
		update: () => this.#updateLayout(),
		updateDelay: 50,
	});
	#create(value: T): I {
		const item = this.#itemCreator!(value);
		item[kHost] = this as any;
		item.classList.add('item', PART.INIT);
		this.updateSortHandle(item.dragHandle);
		return item;
	}
	//#region Active
	emitActive(item: I) {
		if (this.disabled) return;
		const index = this.#list.instances.indexOf(item);
		if (index === -1) return;
		this.emit('active', item.value, index);
	}
	//#region Filter
	/**
	 * 根据条件隐藏列表中的元素
	 * @param condition - 条件规则
	 * - `true`：隐藏全部
	 * - `false`,`null`,`undefined`：显示全部
	 * - `number[]`：显示指定索引的项
	 * - `((data: Data)=>boolean)`：显示返回值为 `true` 的项
	 */
	filter(condition: Parameters<typeof applyConditionalOperation<I, T>>[2]) {
		applyConditionalOperation(
			this.#list.instances,
			(item, filtered) => item.classList.toggle(PART.FILTER, filtered),
			condition,
			(item) => item.value,
			true,
		);
		this.#updateLayout();
	}
	//#region Select
	#selectType: null | 'single' | 'multi' = null;
	/**
	 * 选择类型
	 * @description
	 * - null：禁用
	 * - 'single'：单选
	 * - 'multi'：多选
	 */
	get selectType(): null | 'single' | 'multi' {
		return this.#selectType;
	}
	@property({ toValue: (str: string | null) => str as any })
	@typeCheck(null, 'single', 'multi')
	set selectType(value) {
		this.#selectType = value;
		if (value) return;
		this.#prevSelect = null;
		for (const item of this.#list.instances) {
			item.classList.remove(PART.SELECT);
		}
	}
	#prevSelect: WeakRef<I> | null = null;
	#selectSingle(item?: I) {
		if (item) this.#prevSelect = new WeakRef(item);
		for (const e of this.children) {
			e.classList.toggle(PART.SELECT, e === item);
		}
	}
	emitSelect(item: I) {
		if (this.disabled) return;
		const items = [...this.children] as I[];
		if (!items.includes(item)) return;
		if (!this.#selectType) return;
		// Single
		if (this.#selectType === 'single') {
			this.#selectSingle(item);
			this.emit('select');
			return;
		}
		// Multi
		const multi = keyboard.alias.isActivated('ui.select.multi');
		const range = keyboard.alias.isActivated('ui.select.range');
		// Multi: single
		if (!range) {
			this.#prevSelect = new WeakRef(item);
			if (multi) item.classList.toggle(PART.SELECT);
			else this.#selectSingle(item);
			this.emit('select');
			return;
		}
		// Multi: range
		const from = this.#prevSelect?.deref();
		if (!from) {
			this.#prevSelect = new WeakRef(item);
			item.classList.toggle(PART.SELECT);
			this.emit('select');
			return;
		}
		if (!multi) this.#selectSingle();
		let fromIndex = items.indexOf(from);
		let toIndex = items.indexOf(item);
		const add = !item.classList.contains(PART.SELECT);
		if (fromIndex > toIndex) [fromIndex, toIndex] = [toIndex, fromIndex];
		for (const e of items.slice(fromIndex, toIndex + 1)) {
			e.classList.toggle(PART.SELECT, add);
		}
		this.emit('select');
	}
	/**
	 * 根据条件选择列表中的元素
	 * @param condition - 条件规则
	 * - `true`：选择全部
	 * - `false`,`null`,`undefined`：取消选择全部
	 * - `number[]`：选择指定索引的项
	 * - `((data: Data)=>boolean)`：选择返回值为 `true` 的项
	 */
	select(condition: Parameters<typeof applyConditionalOperation>[2]) {
		if (!this.#selectType) return;
		const single = this.#selectType === 'single';
		let selectOnce = false;
		applyConditionalOperation(
			this.#list.instances,
			(item, selected) => {
				if (selectOnce && single) selected = false;
				item.classList.toggle(PART.SELECT, selected);
				if (selected) selectOnce = true;
			},
			condition,
			(item) => item.value,
		);
	}
	/** 获取选中的数据 */
	getSelected(): T[] {
		return this.#list.instances
			.filter((e) => e.classList.contains(PART.SELECT))
			.map((e) => e.value);
	}
	/** 获取选中的下标 */
	getSelectedIndex(): number[] {
		return this.#list.instances
			.map((e, i) => (e.classList.contains(PART.SELECT) ? i : -1))
			.filter((i) => i >= 0);
	}
	//#region Sort
	// TODO: Rewrite this shit
	#sorting?: WeakRef<I>;
	#startTop = 0;
	#startIndex = 0;
	#startOffset = 0;
	#listTop = 0;
	#moveEvent?: MovementEvent<number>;
	#handleScroll = () => {
		if (!this.#moveEvent) return;
		this.#handleMove(this.#moveEvent);
	};
	#sortStart(item: I) {
		this.#sorting = new WeakRef(item);
		item.classList.add(PART.SORT);
		this.classList.add(PART.SORT);
		this.#startTop = item.offsetTop;
		this.#startIndex = [...this.children].indexOf(item);
		this.#startOffset = 0;
		this.#startOffset = this.#getOffset();
		this.#listTop = this.getBoundingClientRect().top;
		this.#move.start({ value: this.#startIndex, trigger: item });
		item.sortStart();
		viewportTracker.lock(item);
		viewportTracker.on('scrolled', this.#handleScroll);
	}
	#sortEnd(item: I, rollback?: boolean) {
		viewportTracker.unlock(item);
		viewportTracker.off('scrolled', this.#handleScroll);
		this.#moveEvent = undefined;
		this.#sorting = undefined;
		item.classList.remove(PART.SORT);
		this.classList.remove(PART.SORT);
		this.#move.stop();
		if (rollback) this.#updateLayout();
		else this.#updateView();
	}
	#getOffset() {
		const { top } = this.getBoundingClientRect();
		return top - this.scrollTop - this.#startOffset;
	}
	#findItem(trigger?: HTMLElement): I | undefined {
		if (!trigger) return;
		for (const item of [...this.children] as I[]) {
			if (item === trigger) return item;
			if (item.dragHandle === trigger) return item;
		}
		return;
	}
	#getRealIndex(item: I) {
		return this.#list.instances.indexOf(item);
	}
	#handleMoveEnd(item: I) {
		const index = [...this.children].indexOf(item);
		if (index === -1 || this.#startIndex === index) return this.#sortEnd(item);
		const oldRealIndex = this.#getRealIndex(item);
		const prev = item.previousElementSibling as I;
		const next = item.nextElementSibling as I;
		if (prev) {
			const prevRealIndex = this.#getRealIndex(prev);
			shift(this.#list.items, oldRealIndex, prevRealIndex + 1);
		} else if (next) {
			const nextRealIndex = this.#getRealIndex(next);
			shift(this.#list.items, oldRealIndex, nextRealIndex);
		}
		this.emit('sort');
		this.emitUpdate(true);
		this.#sortEnd(item);
	}
	#handleMove = (event: MovementEvent<number>) => {
		let item: I | undefined = this.#sorting?.deref();
		if (!item && event.trigger) item = this.#findItem(event.trigger);
		if (!item) return;

		if (!event.pointer) {
			if (event.end) {
				item.style.translate = '';
				return this.#sortEnd(item, true);
			}
			const index = Math.round(event.value);
			const offset = event.value - index;
			const items = [...this.children];
			item.style.translate = `0 ${offset * 100}%`;
			if (index === 0) this.prepend(item);
			else if (index === items.length - 1) this.append(item);
			else if (items[index - 1] !== item) items[index - 1].after(item);
			else items[index + 1].before(item);
			this.#updateView(true);
			item.scrollIntoView({
				block: 'center',
				inline: 'center',
				behavior: 'smooth',
			});
			return;
		}

		const {
			state,
			pointer: { offset },
		} = event;
		if (state === 'cancel') return this.#sortEnd(item, true);
		if (state === 'end') return this.#handleMoveEnd(item);
		if (state === 'start') return this.#sortStart(item);
		const listOffset = this.#listTop - this.getBoundingClientRect().top;
		const top = clamp(
			-0.1,
			this.#startTop + offset[1] + listOffset,
			this.scrollHeight - item.offsetHeight,
		);
		const center = top + item.clientHeight / 2;
		let cur: HTMLElement | undefined;
		for (const element of [...this.children] as I[]) {
			const c = element.offsetTop + element.clientHeight / 2;
			if (c > center) break;
			cur = element;
		}
		if (cur !== item.previousElementSibling) {
			if (cur) cur.after(item);
			else this.prepend(item);
		}
		this.#updateView();
		$style(item, { top });
		this.#moveEvent = event;
	};
	#move = new MovementController<number>(
		{
			value: 0,
			start: 0,
			end: () => this.children.length - 1,
			step: 1,
			mouseStartDelay: () => this.mouseStartDelay,
			penStartDelay: () => this.penStartDelay,
			touchStartDelay: () => this.touchStartDelay,
		},
		{ handler: this.#handleMove, axis: () => ({ o: [0, 0], x: [0, 1] }) },
	);
	updateSortHandle(newTrigger?: HTMLElement, oldTrigger?: HTMLElement): void {
		if (oldTrigger) this.#move.rmTriggers(oldTrigger);
		if (newTrigger) this.#move.addTriggers(newTrigger);
	}
	emitSort(item: I, state: NavState) {
		if (this.disabled) return;
		if (!this.contains(item)) return;
		const sorting = this.#sorting?.deref();
		if (sorting && sorting !== item) return;
		if (!sorting) this.#sortStart(item);
		this.#move.handleNav(state);
	}
	stopSort(item: I, cancel?: boolean) {
		if (!this.contains(item)) return;
		if (cancel) return this.#sortEnd(item, true);
		this.#handleMoveEnd(item);
	}
	sort(compareFn?: (a: T, b: T) => number) {
		this.#list.items.sort(compareFn);
	}
	/**
	 * 鼠标排序开始延迟
	 * @description
	 * 单位：毫秒
	 * @default 0
	 */
	@typeCheck(Number)
	accessor mouseStartDelay = 0;
	/**
	 * 笔排序开始延迟
	 * @description
	 * 单位：毫秒
	 * @default 500
	 */
	@typeCheck(Number)
	accessor penStartDelay = 500;
	/**
	 * 触摸排序开始延迟
	 * @description
	 * 单位：毫秒
	 * @default 500
	 */
	@typeCheck(Number)
	accessor touchStartDelay = 500;
	//#region View
	#updateView(force?: boolean): void {
		const { paddingTop, paddingBottom } = getComputedStyle(this);
		let offset = parseFloat(paddingTop);
		for (const item of this.children as Iterable<I>) {
			if (force || !item.classList.contains(PART.SORT)) {
				item.style.top = `${offset}px`;
			}
			offset += Math.max(item.viewMinSize ?? 0, item.offsetHeight);
		}
		offset += parseFloat(paddingBottom);
		this.style.height = `${offset}px`;
	}
	#updateLayout() {
		this.#resizeObserver.disconnect();
		this.#intersectionObserver.disconnect();
		const items = this.#list.instances.filter(
			(item) => !item.classList.contains(PART.FILTER),
		);
		this.replaceChildren(...items);
		this.#resizeObserver.observe(this);
		for (const item of items) {
			this.#resizeObserver.observe(item);
			this.#intersectionObserver.observe(item);
		}
		this.#updateView();
	}
	protected clone(from: this): void {
		this.selectType = from.selectType;
		this.mouseStartDelay = from.mouseStartDelay;
		this.penStartDelay = from.penStartDelay;
		this.touchStartDelay = from.touchStartDelay;
		super.clone(from);
		this.select(from.getSelectedIndex());
	}
}
