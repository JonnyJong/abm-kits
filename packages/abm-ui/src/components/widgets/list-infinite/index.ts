import {
	$div,
	$new,
	DOMContents,
	Debounce,
	EventsInitList,
	PromiseOr,
	asArray,
	css,
	sleep,
} from 'abm-utils';
import { customElement } from 'lit/decorators.js';
import { Navigable } from '../../../navigate';
import { Widget } from '../base';
import CSS from './index.styl';

export interface WidgetListInfiniteProp<
	ID extends Exclude<any, null> = unknown,
	Item extends WidgetListInfiniteItem<ID> = WidgetListInfiniteItem<ID>,
> {
	/** 列表项构造器 */
	itemClass?: WidgetListInfiniteItemConstructor<ID, Item>;
	/**
	 * 滚动缓冲阈值
	 * @default 20
	 */
	scrollBufferThreshold?: number;
	/** 顶部边界提示内容 */
	topBoundaryContent?: DOMContents;
	/** 底部边界提示内容 */
	bottomBoundaryContent?: DOMContents;
}

//#region #Item
/** 无限列表元素类基类 */
export abstract class WidgetListInfiniteItem<
		ID extends Exclude<any, null> = unknown,
		EventList extends EventsInitList<EventList> = {},
	>
	extends Widget<EventList>
	implements Navigable
{
	abstract identifier: ID;
}

/** 无限列表元素类基类构造器 */
export interface WidgetListInfiniteItemConstructor<
	ID extends Exclude<any, null> = unknown,
	Item extends WidgetListInfiniteItem<ID> = WidgetListInfiniteItem<ID>,
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
	create(identifier: ID): Item;
	/**
	 * 由列表组件调用，获取位于起始 `ID` 前的一系列 `ID`
	 * @param from - 起始 ID
	 * @returns 返回一个 ID 数组；
	 * 若返回空数组或其他值，则表示达到尽头
	 */
	prev(from: ID): PromiseOr<ID[] | null | undefined>;
	/**
	 * 由列表组件调用，获取位于起始 `ID` 后的一系列 `ID`
	 * @param from - 起始 ID
	 * @returns 返回一个 ID 数组；
	 * 若返回空数组或其他值，则表示达到尽头
	 */
	next(from: ID): PromiseOr<ID[] | null | undefined>;
}

//#region #List
@customElement('w-list-infinite')
export class WidgetListInfinite<
		ID extends Exclude<any, null> = unknown,
		Item extends WidgetListInfiniteItem<ID> = WidgetListInfiniteItem<ID>,
	>
	extends Widget
	implements Navigable
{
	static styles = css(CSS);
	#root = this.createRenderRoot();
	#topBoundaryContainer = $div({ class: 'boundary-content' });
	#bottomBoundaryContainer = $div({ class: 'boundary-content' });
	#topBoundaryIndicator = $div(
		{ class: 'boundary-container' },
		$new('w-progress-ring'),
		this.#topBoundaryContainer,
	);
	#bottomBoundaryIndicator = $div(
		{ class: 'boundary-container' },
		$new('w-progress-ring'),
		this.#bottomBoundaryContainer,
	);
	#container = $div({ class: 'container' });
	#isIntersecting = false;
	#initId: ID | null = null;
	#observer = new IntersectionObserver((entries) => {
		this.#isIntersecting = entries[0].isIntersecting;
		if (!this.#isIntersecting) return;
		if (this.#initId === null) return;
		this.init(this.#initId);
		this.#initId = null;
	});
	#prevScroll = NaN;
	constructor() {
		super(undefined, false, true);
		this.#root.append(
			this.#topBoundaryIndicator,
			this.#container,
			this.#bottomBoundaryIndicator,
		);
		this.addEventListener('scroll', () => {
			const scroll = this.scrollTop;
			if (this.#prevScroll === scroll) return;
			this.#debouncedUpdate();
			this.#prevScroll = scroll;
		});
		this.#observer.observe(this);
	}
	/** 顶部边界提示内容 */
	get topBoundaryContent(): NodeListOf<ChildNode> {
		return this.#topBoundaryContainer.childNodes;
	}
	set topBoundaryContent(value: DOMContents) {
		this.#topBoundaryContainer.replaceChildren(...asArray(value));
	}
	/** 底部边界提示内容 */
	get bottomBoundaryContent(): NodeListOf<ChildNode> {
		return this.#bottomBoundaryContainer.childNodes;
	}
	set bottomBoundaryContent(value: DOMContents) {
		this.#bottomBoundaryContainer.replaceChildren(...asArray(value));
	}
	#itemClass?: WidgetListInfiniteItemConstructor<ID, Item>;
	#scrollBufferThreshold = 10;
	#hasReachedTop = false;
	#hasReachedBottom = false;
	/** 列表项构造器 */
	get itemClass() {
		return this.#itemClass;
	}
	set itemClass(value) {
		if (this.#itemClass === value) return;
		this.#itemClass = value;
		this.#rerender();
	}
	/**
	 * 滚动缓冲阈值
	 * @default 20
	 */
	get scrollBufferThreshold() {
		return this.#scrollBufferThreshold;
	}
	set scrollBufferThreshold(value) {
		if (typeof value !== 'number' || value < 1) return;
		this.#scrollBufferThreshold = value;
	}
	#updateBoundaryState(hasReached: boolean, direction: 'top' | 'bottom') {
		if (direction === 'top') {
			this.#hasReachedTop = hasReached;
			this.#topBoundaryIndicator.classList.toggle('reached', hasReached);
			return;
		}
		this.#hasReachedBottom = hasReached;
		this.#bottomBoundaryIndicator.classList.toggle('reached', hasReached);
	}
	#rerender() {
		if (!this.#itemClass) {
			this.#container.replaceChildren();
			return;
		}
		this.#container.replaceChildren(
			...[...this.#container.children].map((item) =>
				this.#itemClass!.create((item as Item).identifier),
			),
		);
	}
	/**
	 * 初始化列表
	 * @param startId - 起始项 ID
	 * @param itemClass - 项目构造器
	 * @returns
	 * - `true`：初始化成功；
	 * - `false`：初始化失败，没有设定 itemClass；
	 * - `null`：待元素可见后初始化
	 */
	async init(
		startId: ID,
		itemClass?: WidgetListInfiniteItemConstructor<ID, Item>,
	): Promise<boolean | null> {
		if (itemClass) this.itemClass = itemClass;
		if (!this.#itemClass) return false;
		if (!this.#isIntersecting) {
			this.#initId = startId;
			return null;
		}

		const prevItems =
			(await this.#itemClass.prev(startId))?.slice(-this.#scrollBufferThreshold) ??
			[];
		const nextItems =
			(await this.#itemClass.next(startId))?.slice(
				0,
				this.#scrollBufferThreshold,
			) ?? [];
		this.#updateBoundaryState(prevItems.length === 0, 'top');
		this.#updateBoundaryState(nextItems.length === 0, 'bottom');

		this.#container.replaceChildren(
			...[...prevItems, startId, ...nextItems].map((id) =>
				this.#itemClass!.create(id),
			),
		);

		this.#container.children[prevItems.length].scrollIntoView({
			block: 'center',
			behavior: 'instant',
		});

		return true;
	}
	#lastUpdateTimestamp = 0;
	#locateCenterItem() {
		const scrollTop = this.scrollTop - this.#topBoundaryIndicator.offsetHeight;
		const centerPosition = scrollTop + this.clientHeight / 2;
		let targetItem = this.#container.children[0] as Item;
		for (const item of this.#container.children) {
			if ((item as Item).offsetTop > centerPosition) {
				targetItem = item as Item;
				break;
			}
		}
		return {
			targetItem,
			initialScrollPosition: targetItem.getBoundingClientRect().top,
		};
	}
	#maintainScrollPosition(targetItem: Element, initialPosition: number) {
		const finalPosition = targetItem.getBoundingClientRect().top;
		this.scroll({
			top: this.scrollTop + finalPosition - initialPosition,
			behavior: 'instant',
		});
	}
	async #performUpdate() {
		if (Date.now() - this.#lastUpdateTimestamp < 15) return;
		if (!this.#itemClass) return;
		if (this.#container.childElementCount === 0) return;
		// 定位当前滚动位置
		const { targetItem, initialScrollPosition } = this.#locateCenterItem();
		const targetIndex = Array.prototype.indexOf.call(
			this.#container.children,
			targetItem,
		);

		// 处理下方内容
		let nextSurplus =
			this.#container.children.length - targetIndex - this.#scrollBufferThreshold;
		if (nextSurplus > 0) {
			this.#updateBoundaryState(false, 'bottom');
			while (nextSurplus > 0) {
				this.#container.lastChild?.remove();
				nextSurplus--;
			}
		} else if (nextSurplus < 0 && !this.#hasReachedBottom) {
			const nextBatch =
				(
					await this.#itemClass.next((this.#container.lastChild as Item).identifier)
				)?.slice(0, -nextSurplus) ?? [];
			this.#container.append(
				...nextBatch.map((id) => this.#itemClass!.create(id)),
			);
			this.#updateBoundaryState(nextBatch.length === 0, 'bottom');
		}
		// 处理上方内容
		let prevSurplus = targetIndex - this.#scrollBufferThreshold;
		if (prevSurplus > 0) {
			this.#updateBoundaryState(false, 'top');
			while (prevSurplus > 0) {
				this.#container.firstChild?.remove();
				prevSurplus--;
			}
		} else if (prevSurplus < 0 && !this.#hasReachedTop) {
			const prevBatch =
				(
					await this.#itemClass.prev((this.#container.firstChild as Item).identifier)
				)?.slice(prevSurplus) ?? [];
			this.#container.prepend(
				...prevBatch.map((id) => this.#itemClass!.create(id)),
			);
			this.#updateBoundaryState(prevBatch.length === 0, 'top');
		}
		// 保持滚动位置
		await sleep(0);
		this.#maintainScrollPosition(targetItem, initialScrollPosition);
		this.#lastUpdateTimestamp = Date.now();
	}
	#debouncedUpdate = Debounce.new(() => this.#performUpdate(), 10);
}
