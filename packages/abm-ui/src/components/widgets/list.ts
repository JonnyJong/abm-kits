import {
	Fn,
	SyncList,
	applyConditionalOperation,
	callTask,
	css,
	shift,
	sleep,
} from 'abm-utils';
import CSS from 'list.style';
import { customElement, property } from 'lit/decorators.js';
import { events, UIEventActive, UIEventSlide } from '../../events';
import { EventBase, EventBaseInit } from '../../events/api/base';
import { EventValue, EventValueInit } from '../../events/api/value';
import { EventsInitList, EventsList } from '../../events/events';
import { Slidable, SlideBorder } from '../../events/ui/slide';
import { keyboard } from '../../keyboard';
import { Navigable, NavigateCallbackOptions, navigate } from '../../navigate';
import { Widget } from './base';

interface WidgetListEventsInit<
	Data = unknown,
	Item extends WidgetListItem<Data> = WidgetListItem<Data>,
> {
	/** 列表元素激活事件 */
	active: EventValueInit<WidgetList<Data, Item>, number>;
	/** 列表排序事件 */
	sort: EventBaseInit<WidgetList<Data, Item>>;
	/** 列表元素选择事件 */
	select: EventBaseInit<WidgetList<Data, Item>>;
}

export type WidgetListEvents<
	Data = unknown,
	Item extends WidgetListItem<Data> = WidgetListItem<Data>,
> = EventsList<WidgetListEventsInit<Data, Item>>;

/**
 * 列表选择类型
 * @description
 * - null：禁用
 * - 'single'：单选
 * - 'multi'：多选
 */
export type WidgetListSelectType = null | 'single' | 'multi';

export interface WidgetListProp<
	Data = unknown,
	Item extends WidgetListItem<Data> = WidgetListItem<Data>,
> {
	/** 列表元素类 */
	itemClass?: WidgetListItemConstructor<Data, Item>;
	/** 列表数据 */
	items?: Data[];
	/** 可排序 */
	sortable?: boolean;
	/**
	 * 列表选择类型
	 * @description
	 * - null：禁用
	 * - 'single'：单选
	 * - 'multi'：多选
	 */
	selectType?: WidgetListSelectType;
	/** 列表元素初始化 */
	initItem?: (item: Item) => any;
}

const CLASS_DRAGGING = 'w-list-dragging';
const CLASS_FILTERED = 'w-list-filtered';
const CLASS_SELECTED = 'w-list-selected';
const SELECT_TYPES = ['single', 'multi'];
// const SCROLL_OPTIONS: ScrollIntoViewOptions = {
// 	block: 'center',
// 	inline: 'center',
// 	behavior: 'smooth',
// };
// const SLIDE_START_OFFSET = 4;
const SORT_START_TIME = 1000;

//#region #Item
/** 列表元素类基类 */
export abstract class WidgetListItem<
		Data = unknown,
		Prop extends Record<string, any> = {},
		EventList extends EventsInitList<EventList> = {},
	>
	extends Widget<Prop, EventList>
	implements Navigable
{
	#host: WidgetList<Data, WidgetListItem<Data, Prop, EventList>> = null as any;
	/** 列表，只允许一次赋值 */
	get host() {
		return this.#host;
	}
	set host(value) {
		if (this.#host || !(value instanceof WidgetList)) return;
		this.#host = value;
	}
	/** 数据 */
	abstract get data(): Data;
	abstract set data(value: Data);
	/**
	 * 元素顶部坐标
	 * @description
	 * 请勿修改该属性，该属性自动计算
	 */
	viewTop = 0;
	/**
	 * 元素底部坐标
	 * @description
	 * 请勿修改该属性，该属性自动计算
	 */
	viewBottom = 0;
	/**
	 * 元素尺寸
	 * @description
	 * 请勿修改该属性，该属性自动计算
	 */
	viewSize = 0;
	/** 元素最小尺寸 */
	viewMinSize?: number;
	//#region Active
	/** 触发列表元素 */
	protected active() {
		this.host.emitActive(this);
	}
	#activeTrigger?: HTMLElement;
	/**
	 * active 事件触发器
	 * @description
	 * 用户通过点击该元素来触发 active 事件。
	 * 请绑定到可导航元素（`ui-nav`）上以确保可访问性。
	 *
	 * 支持鼠标、触摸、键盘、游戏控制器。
	 */
	protected get activeTrigger() {
		return this.#activeTrigger;
	}
	protected set activeTrigger(value) {
		if (this.#activeTrigger === value) return;
		if (this.#activeTrigger) {
			events.active.off(this.#activeTrigger, this.#activeHandler);
		}
		this.#activeTrigger = value;
		if (!value) return;
		events.active.on(value, this.#activeHandler);
	}
	#activeHandler = ({ cancel, active }: UIEventActive) => {
		if (cancel || active) return;
		this.active();
	};
	//#region Sort
	#dragHandle?: HTMLElement;
	/**
	 * 拖拽把手
	 * @description
	 * 用户通过长按该元素来启动排序。
	 * 请绑定到可导航元素（`ui-nav`）上以确保可访问性。
	 *
	 * 支持鼠标、触摸、键盘、游戏控制器。
	 */
	protected get dragHandle() {
		return this.#dragHandle;
	}
	protected set dragHandle(value) {
		if (this.#dragHandle === value) return;
		if (this.#dragHandle) {
			events.active.off(this.#dragHandle, this.#sortActiveHandler);
		}
		this.#dragHandle = value;
		if (!value) return;
		events.active.on(value, this.#sortActiveHandler);
	}
	#sortStartTimer: number | null = null;
	#clearSortTimer() {
		if (this.#sortStartTimer === null) return;
		clearTimeout(this.#sortStartTimer);
		this.#sortStartTimer = null;
	}
	#sortActiveHandler = ({
		active,
		cancel,
		identifier,
		position,
		target,
	}: UIEventActive) => {
		if (active) {
			if (this.#sortStartTimer !== null) return;
			this.#sortStartTimer = setTimeout(() => {
				events.active.cancel(this.#dragHandle!);
				this.#host.emitSortStart(this, identifier, position);
				this.#clearSortTimer();
			}, SORT_START_TIME);
			return;
		}
		if (cancel || active === false) {
			if (this.#dragHandle !== target) return;
			this.#clearSortTimer();
			return;
		}
	};
	/**
	 * 排序结束回调
	 * @description
	 * 重写该回调，以自定义排序结束后的行为。
	 * 主动调用 `this.host.emitSortEnd(this)` 将不会触发该回调。
	 * 无需调用 `super.onSortEnd()`。
	 */
	onSortEnd?: Fn;
	//#region Select
	#selectTrigger?: HTMLElement;
	/**
	 * select 事件触发器
	 * @description
	 * 用户通过点击该元素来触发 select 事件。
	 * 请绑定到可导航元素（`ui-nav`）上以确保可访问性。
	 *
	 * 支持鼠标、触摸、键盘、游戏控制器。
	 */
	protected get selectTrigger() {
		return this.#selectTrigger;
	}
	protected set selectTrigger(value) {
		if (this.#selectTrigger === value) return;
		if (this.#selectTrigger) {
			events.active.off(this.#selectTrigger, this.#selectActiveHandler);
		}
		this.#selectTrigger = value;
		if (!value) return;
		events.active.on(value, this.#selectActiveHandler);
	}
	#selectActiveHandler = ({ cancel, active }: UIEventActive) => {
		if (cancel || active) return;
		this.host.emitSelect(this);
	};
	//#region Others
	get nonNavigable() {
		return this.classList.contains(CLASS_FILTERED);
	}
	get navParent() {
		return this.host;
	}
	/**
	 * navigate 回调
	 * @description
	 * 该默认回调在 cancel 触发时，停止排序
	 */
	navCallback({ cancel }: NavigateCallbackOptions) {
		if (!cancel) return;
		this.host.emitSortEnd();
		callTask(this.onSortEnd, this);
	}
}

/** 列表元素类基类构造器 */
export interface WidgetListItemConstructor<
	Data = unknown,
	Item extends WidgetListItem<Data> = WidgetListItem<Data>,
> {
	new (...args: any): Item;
	/**
	 * 由列表组件调用，创建列表元素
	 * @param data - 数据
	 * @example
	 * ```ts
	 * create(data: Data): Item {
	 * 	 const element = $new('list-item-tag-name');
	 *   element.data = data;
	 *   return element;
	 * }
	 */
	create(data: Data): Item;
}

//#region #List
@customElement('w-list')
export class WidgetList<
		Data = unknown,
		Item extends WidgetListItem<Data, any, any> = WidgetListItem<Data, any, any>,
	>
	extends Widget<WidgetListProp<Data, Item>, WidgetListEventsInit<Data, Item>>
	implements Navigable, Slidable
{
	static styles = css(CSS);
	#root = this.createRenderRoot();
	constructor() {
		super(['active', 'sort', 'select']);
	}
	connectedCallback(): void {
		super.connectedCallback();
		this.toggleAttribute('ui-nav-group', true);
		this.#updateLayout();
	}
	#items = new SyncList<Data, Item>({
		getData: (instance) => instance.data,
		setData(instance, data) {
			instance.data = data;
		},
		create: (data) => this.#createItem(data),
		update: () => {
			this.#updateValidItems();
			this.#updateView();
		},
		updateDelay: 50,
	});
	//#region Items
	#itemClass?: WidgetListItemConstructor<Data, Item>;
	#createItem(data: Data): Item {
		const item = this.#itemClass!.create(data);
		item.host = this as any;
		item.part.add('w-list-item');
		return item;
	}
	#validItems: Item[] = [];
	#prevValidItem(index: number): Item | null {
		while (index > 0) {
			index--;
			if (this.#validItems[index].classList.contains(CLASS_FILTERED)) continue;
			return this.#validItems[index];
		}
		return null;
	}
	#nextValidItem(index: number): Item | null {
		while (index < this.#validItems.length - 1) {
			index++;
			if (this.#validItems[index].classList.contains(CLASS_FILTERED)) continue;
			return this.#validItems[index];
		}
		return null;
	}
	#updateValidItems() {
		this.#validItems = this.#items.instances.filter(
			(item) => !item.classList.contains(CLASS_FILTERED),
		);
	}
	//#region View
	#updateLayout() {
		const { paddingTop, paddingBottom } = getComputedStyle(this);

		let offset = parseFloat(paddingTop);

		for (const item of this.#items.instances) {
			if (item.classList.contains(CLASS_FILTERED)) continue;

			const minHeight = item.viewMinSize;
			let { height } = item.getBoundingClientRect();
			if (Number.isFinite(minHeight!)) height = Math.max(height, minHeight!);

			if (!item.classList.contains(CLASS_DRAGGING)) item.style.top = `${offset}px`;

			item.viewTop = offset;
			offset += height;
			item.viewBottom = offset;
			item.viewSize = height;
		}

		offset += parseFloat(paddingBottom);
		this.style.height = `${offset}px`;
	}
	async #updateView() {
		this.#root.replaceChildren(...this.#items.instances);
		await sleep(0);
		this.#updateLayout();
	}
	//#region Properties
	get itemClass() {
		return this.#itemClass;
	}
	set itemClass(value) {
		if (this.#itemClass === value) return;
		this.#itemClass = value;
		this.#items.creatable = !!value;
		if (!(this.#itemClass && value)) return;
		this.#items.replace(...this.#items.items);
	}
	get items() {
		return this.#items.items;
	}
	set items(value) {
		this.#items.replace(...value);
	}
	@property({ type: Boolean, reflect: true }) accessor sortable = false;
	/**
	 * 列表选择类型
	 * @description
	 * - null：禁用
	 * - 'single'：单选
	 * - 'multi'：多选
	 */
	get selectType() {
		const type = this.getAttribute('select');
		if (SELECT_TYPES.includes(type!)) return type as any;
		return null;
	}
	set selectType(value: WidgetListSelectType) {
		if (SELECT_TYPES.includes(value!)) this.setAttribute('select', value!);
		else this.removeAttribute('select');
	}
	//#region Sort
	#emitSort() {
		this.events.emit(new EventBase('sort', { target: this }));
	}
	#sortingItem: Item | null = null;
	emitSortStart(
		item: Item,
		identifier: number,
		position?: readonly [number, number],
	) {
		if (this.#sortingItem) return;
		this.#sortingItem = item;
		navigate.lock(item);
		item.classList.add(CLASS_DRAGGING);
		this.classList.add(CLASS_DRAGGING);
		events.slide.on(this, this.#slideHandler);
		if (identifier !== -2) {
			events.slide.start(this, identifier, position?.[0], position?.[1]);
			return;
		}
		events.slide.start(this, identifier, 0, this.#items.instances.indexOf(item));
	}
	emitSortEnd() {
		if (!this.#sortingItem) return;

		navigate.lock(null);
		this.#sortingItem.classList.remove(CLASS_DRAGGING);
		this.classList.remove(CLASS_DRAGGING);
		events.slide.cancel(this);
		events.slide.off(this, this.#slideHandler);
		this.#updateLayout();

		this.#sortingItem = null;
	}
	#applySlide(y: number) {
		if (!this.#sortingItem) return;

		const index = this.#items.instances.indexOf(this.#sortingItem);
		const validIndex = this.#validItems.indexOf(this.#sortingItem);
		const top = y - this.getBoundingClientRect().top;
		const bottom = top + this.#sortingItem.viewSize;
		this.#sortingItem.style.top = `${top}px`;

		const next = this.#nextValidItem(validIndex);
		if (next && next.viewTop + next.viewSize / 2 < bottom) {
			next.after(this.#sortingItem);
			shift(this.#items.instances, index, this.#items.instances.indexOf(next) + 1);
			shift(this.#validItems, validIndex, this.#validItems.indexOf(next) + 1);
			this.#updateLayout();
			this.#emitSort();
			return;
		}
		const prev = this.#prevValidItem(validIndex);
		if (prev && prev.viewBottom - prev.viewSize / 2 > top) {
			prev.before(this.#sortingItem);
			shift(this.#items.instances, index, this.#items.instances.indexOf(prev));
			shift(this.#validItems, validIndex, this.#validItems.indexOf(prev));
			this.#updateLayout();
			this.#emitSort();
			return;
		}
	}
	#applyDigitalSlide(y: number) {
		if (!this.#sortingItem) return;

		const nextIndex = Math.round(y);

		// Style
		const offset = y - nextIndex;
		this.#sortingItem.style.top = `${this.#sortingItem.viewTop + offset * this.#sortingItem.viewSize}px`;

		// Check Sort
		const validIndex = this.#validItems.indexOf(this.#sortingItem);
		if (validIndex === nextIndex) return;

		// Sort
		const index = this.#items.instances.indexOf(this.#sortingItem);
		const swapTarget = this.#validItems[nextIndex];

		let indexOffset = 0;
		if (nextIndex < index) swapTarget.before(this.#sortingItem);
		else {
			swapTarget.after(this.#sortingItem);
			indexOffset = 1;
		}

		shift(this.#validItems, validIndex, nextIndex + indexOffset);
		shift(
			this.#items.instances,
			index,
			this.#items.instances.indexOf(swapTarget) + indexOffset,
		);
		this.#updateLayout();
		this.#sortingItem.style.top = `${this.#sortingItem.viewTop + offset * this.#sortingItem.viewSize}px`;

		this.#emitSort();
	}
	#slideHandler(event: UIEventSlide) {
		if (!this.#sortingItem) return;

		if (event.pointer) this.#applySlide(event.y);
		else this.#applyDigitalSlide(event.y);

		if (event.state === 'end') {
			callTask(this.#sortingItem.onSortEnd, this.#sortingItem);
			this.emitSortEnd();
			return;
		}
	}
	//#region Active
	emitActive(item: Item) {
		const index = this.#items.instances.indexOf(item);
		if (index === -1) return;
		this.events.emit(new EventValue('active', { target: this, value: index }));
	}
	//#region Select
	/**
	 * 根据条件选中列表中的元素
	 * @param condition - 条件规则
	 * - `true`：选择全部
	 * - `false`,`null`,`undefined`：取消全部
	 * - `number[]`：选择指定索引的项
	 * - `((data: Data)=>boolean)`：选择返回值为 `true` 的项
	 */
	select(condition: Parameters<typeof applyConditionalOperation>[2]) {
		applyConditionalOperation(
			this.#items.instances,
			(item, selected) => item.classList.toggle(CLASS_SELECTED, selected),
			condition,
			(item) => item.data,
		);
	}
	#prevSelect: WeakRef<Item> | null = null;
	#selectSingle(item?: Item) {
		if (item) this.#prevSelect = new WeakRef(item);
		for (const element of this.#items.instances) {
			element.classList.toggle(CLASS_SELECTED, element === item);
		}
	}
	emitSelect(item: Item) {
		const items = this.#items.instances;
		if (!items.includes(item)) return;
		const type = this.selectType;
		if (!type) return;
		// Single
		if (type === 'single') return this.#selectSingle(item);
		// Multi
		const multi = keyboard.isAliasActivated('ui.selectMulti');
		const range = keyboard.isAliasActivated('ui.selectRange');
		// Multi: single
		if (!range) {
			this.#prevSelect = new WeakRef(item);
			if (!multi) return this.#selectSingle(item);
			item.classList.toggle(CLASS_SELECTED);
			return;
		}
		// Multi: range
		const from = this.#prevSelect?.deref();
		if (!from) {
			this.#prevSelect = new WeakRef(item);
			item.classList.toggle(CLASS_SELECTED);
			return;
		}
		if (!multi) this.#selectSingle();
		let fromIndex = items.indexOf(from);
		let toIndex = items.indexOf(item);
		const add = !item.classList.contains(CLASS_SELECTED);
		if (fromIndex > toIndex) [fromIndex, toIndex] = [toIndex, fromIndex];
		for (const element of items.slice(fromIndex, toIndex + 1)) {
			if (element.classList.contains(CLASS_FILTERED)) continue;
			element.classList.toggle(CLASS_SELECTED, add);
		}
	}
	//#region Others
	/**
	 * 根据条件隐藏列表中的元素
	 * @param condition - 条件规则
	 * - `true`：隐藏全部
	 * - `false`,`null`,`undefined`：显示全部
	 * - `number[]`：显示指定索引的项
	 * - `((data: Data)=>boolean)`：显示返回值为 `true` 的项
	 */
	filter(condition: Parameters<typeof applyConditionalOperation>[2]) {
		applyConditionalOperation(
			this.#items.instances,
			(item, filtered) => item.classList.toggle(CLASS_FILTERED, filtered),
			condition,
			(item) => item.data,
		);
		this.#updateValidItems();
	}
	get elements() {
		return Object.freeze([...this.#items.instances]);
	}
	get navChildren() {
		return this.#items.instances;
	}
	get slideBorder(): SlideBorder {
		return [0, 0, 0, this.#validItems.length - 1];
	}
	get joystickYSpeedFactor() {
		return 10;
	}
}
