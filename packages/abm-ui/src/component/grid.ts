import {
	applyConditionalOperation,
	SyncList,
	sleep,
	typeCheck,
} from 'abm-utils';
import { defineElement, property } from '../infra/decorator';
import type { ElementProps } from '../infra/dom';
import { $rect, $slot } from '../infra/dom';
import { $style, css } from '../infra/style';
import { keyboard } from '../input/keyboard';
import type { Navigable } from '../navigate';
import { state } from '../state';
import { type AriaConfig, Component } from './base';
import { FormControl, type FormControlEventMap } from './form';

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-grid': Grid;
	}
}

const PART = {
	INIT: 'init',
	FILTER: 'filtered',
	SELECT: 'selected',
} as const;

const kHost = Symbol();

//#region #Item

export interface GridItemProp<T = any> extends ElementProps<GridItem<T>> {}

export abstract class GridItem<T = any>
	extends Component<GridItemProp<T>>
	implements Navigable
{
	protected static aria: AriaConfig = { role: 'gridcell' };
	[kHost]!: Grid<T>;
	/** 宿主网格 */
	get host() {
		return this[kHost];
	}
	/** 值 */
	abstract value: T;
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
}

//#region #Grid

export interface GridProp<T = any, I extends GridItem<T> = GridItem<T>>
	extends ElementProps<Grid<T, I>> {}

export interface GridEventMap<T> extends FormControlEventMap<T[]> {
	/** 激活事件 */
	active: [value: T, index: number];
	/** 选择事件 */
	select: [];
}

type LineItem = [item: HTMLElement, width: number, height: number];

/**
 * 网格
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form/grid)
 */
@defineElement('abm-grid')
export class Grid<
	T = any,
	I extends GridItem<T> = GridItem<T>,
> extends FormControl<T[], GridProp<T, I>, GridEventMap<T>> {
	protected static style = css`
		:host {
			display: block;
			position: relative;
		}
		::slotted(*) {
			position: absolute;
			transition: .2s top, .2s inset-inline-start, .2s opacity;
		}
		::slotted(.init) { opacity: 0 }
		::slotted(.hidden) { visibility: hidden }
	`;
	protected static aria: AriaConfig = { role: 'grid' };
	#resizeObserver = new ResizeObserver(() => this.#updateView());
	#intersectionObserver = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				entry.target.classList.toggle('hidden', !entry.isIntersecting);
			}
		},
		{ rootMargin: '128px' },
	);
	constructor(_props?: GridProp) {
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
		update: () => this.#updateLayout(),
		updateDelay: 50,
	});
	#create(value: T): I {
		const item = this.#itemCreator!(value);
		item[kHost] = this as any;
		item.classList.add('item', PART.INIT);
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
	//#region View
	#updateView() {
		if (!this.isConnected) return;
		// Prepare
		const { paddingTop, paddingBottom, paddingLeft, paddingRight, direction } =
			getComputedStyle(this);
		const pTop = parseFloat(paddingTop);
		const pBottom = parseFloat(paddingBottom);
		let pLeft = parseFloat(paddingLeft);
		let pRight = parseFloat(paddingRight);
		if (direction === 'rtl') [pLeft, pRight] = [pRight, pLeft];
		if (this.children.length === 0) {
			$style(this, { height: pTop + pBottom });
			return;
		}
		const maxWidth = $rect(this).width - pLeft - pRight;
		// Line
		const lines: LineItem[][] = [[]];
		let maxLineWidth = 0;
		let currentLine = lines[0];
		let currentLineWidth = 0;
		for (const item of this.children as any as HTMLElement[]) {
			const w = item.offsetWidth;
			const h = item.offsetHeight;
			if (w === 0 && h === 0) continue;
			const lineItem: LineItem = [item, w, h];
			if (currentLine.length === 0) {
				currentLine.push(lineItem);
				currentLineWidth += w;
				continue;
			}
			const addedWidth = currentLineWidth + w + this.#hGap;
			if (addedWidth > maxWidth) {
				maxLineWidth = Math.max(maxLineWidth, currentLineWidth);
				currentLine = [lineItem];
				currentLineWidth = w;
				lines.push(currentLine);
				continue;
			}
			currentLine.push(lineItem);
			currentLineWidth = addedWidth;
		}
		maxLineWidth = Math.max(maxLineWidth, currentLineWidth);
		// Align
		if (lines.length === 1) {
			const step =
				lines[0].reduce((p, c) => p + c[1], 0) / lines[0].length + this.#hGap;
			if (step < Number.EPSILON) maxLineWidth = maxWidth;
			else maxLineWidth += Math.floor((maxWidth - maxLineWidth) / step) * step;
		}
		// Render
		const start = (maxWidth - maxLineWidth) / 2 + pLeft;
		let y = pTop;
		for (const [index, items] of lines.entries()) {
			let x = start;
			if (index > 0) y += this.#vGap;
			let lineHeight = 0;
			for (const [item, w, h] of items) {
				lineHeight = Math.max(lineHeight, h);
				$style(item, { insetInlineStart: x });
				x += w + this.#hGap;
			}
			for (const [item, _, h] of items) {
				$style(item, { top: y + (lineHeight - h) / 2 });
			}
			y += lineHeight + this.#vGap;
		}
		$style(this, { height: y - this.#vGap + pBottom });
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
	#hGap = 0;
	/** 水平间距 */
	get hGap() {
		return this.#hGap;
	}
	@typeCheck(Number)
	set hGap(value) {
		if (value === this.#hGap) return;
		this.#hGap = value;
		this.#updateView();
	}
	#vGap = 0;
	/** 垂直间距 */
	get vGap() {
		return this.#vGap;
	}
	@typeCheck(Number)
	set vGap(value) {
		if (value === this.#vGap) return;
		this.#vGap = value;
		this.#updateView();
	}
	protected clone(from: this): void {
		this.selectType = from.selectType;
		this.#hGap = from.hGap;
		this.#vGap = from.vGap;
		super.clone(from);
		this.select(from.getSelectedIndex());
	}
}
