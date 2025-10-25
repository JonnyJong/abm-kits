import {
	$div,
	AnimationFrameController,
	clamp,
	css,
	Debounce,
	type EventsInitList,
	SyncList,
	toReversed,
	zip,
} from 'abm-utils';
import { customElement } from 'lit/decorators.js';
import type { Navigable } from '../../../navigate';
import { Widget } from '../base';
import CSS from './index.styl';

/**
 * 网格整体布局
 * @description
 * - `fill`: 填充宽度
 * - `content-center`：智能内容居中（根据实际元素宽度居中）
 */
export type WidgetGridVirtualLayout = 'fill' | 'content-center';
/**
 * 元素行内横向间隔
 * @description
 * - `between`：均匀分布，第一项与起始点齐平，最后一项与终止点齐平
 * - `around`：均匀分布，项目在两端有一半大小的空间
 * - `evenly`：均匀分布，项目周围有相等的空间
 * - `none`：紧密分布，项目之间无额外间隔
 */
export type WidgetGridVirtualItemSpacing =
	| 'between'
	| 'around'
	| 'evenly'
	| 'none';
/**
 * 元素行内横向对齐
 * @description
 * - `left`：左对齐
 * - `center`：居中对齐
 * - `right`：右对齐
 * - `justify`：两端对齐（spacing 为 none 时等同于 center）
 */
export type WidgetGridVirtualItemAlign =
	| 'left'
	| 'center'
	| 'right'
	| 'justify';
/**
 * 元素行内纵向对齐
 * @description
 * - `top`：顶部
 * - `center`：中间
 * - `bottom`：底部
 */
export type WidgetGridVirtualItemVerticalAlign = 'top' | 'center' | 'bottom';
/**
 * 元素宽度
 * @description
 * - `fixed-count`：固定数量，通过 `itemWidthRatio` 确定一行显示的项目数量
 * - `fixed-size`：固定宽度，通过 `itemWidthRatio` 确定一个项目的宽度
 * - `variable`：可变宽度，尽可能填充宽度，通过 `itemWidthRatio` 确定一个项目的目标宽度
 * - `dynamic`：动态宽度，每个项目提供自身宽度
 */
export type WidgetGridVirtualItemWidthType =
	| 'fixed-count'
	| 'fixed-size'
	| 'variable'
	| 'dynamic';
/**
 * 元素高度
 * @description
 * - `fixed`：固定高度，通过 `itemHeightRatio` 确定元素的高度
 * - `dynamic`：动态高度，每个项目提供自身高度
 */
export type WidgetGridVirtualItemHeightType = 'fixed' | 'dynamic';

export interface WidgetGridVirtualProp<
	Data = unknown,
	Item extends WidgetGridVirtualItem<Data> = WidgetGridVirtualItem<Data>,
> {
	/** 列表元素类 */
	itemClass?: WidgetGridVirtualItemConstructor<Data, Item>;
	/** 列表数据 */
	items?: Data[];
	/**
	 * 网格整体布局
	 * @description
	 * - `fill`: 填充宽度
	 * - `content-center`：智能内容居中（根据实际元素宽度居中）
	 * @default 'fill'
	 */
	layout?: WidgetGridVirtualLayout;
	/**
	 * 元素行内横向对齐
	 * @description
	 * - `space-between`：均匀分布，第一项与起始点齐平，最后一项与终止点齐平
	 * - `space-around`：均匀分布，项目在两端有一半大小的空间
	 * - `space-evenly`：均匀分布，项目周围有相等的空间
	 * - `left`：居左
	 * - `center`：居中
	 * - `right`：居右
	 * @default 'space-between'
	 */
	itemAlign?: WidgetGridVirtualItemAlign;
	/**
	 * 元素行内纵向对齐
	 * @description
	 * - `top`：顶部
	 * - `center`：中间
	 * - `bottom`：底部
	 * @default 'top'
	 */
	itemVerticalAlign?: WidgetGridVirtualItemVerticalAlign;
	/**
	 * 元素宽度
	 * @description
	 * - `fixed-count`：固定数量，通过 `itemWidthRatio` 确定一行显示的项目数量
	 * - `fixed-size`：固定宽度，通过 `itemWidthRatio` 确定一个项目的宽度
	 * - `variable`：可变宽度，尽可能填充宽度，通过 `itemWidthRatio` 确定一个项目的目标宽度
	 * - `dynamic`：动态宽度，每个项目提供自身宽度
	 * @default 'dynamic'
	 */
	itemWidthType?: WidgetGridVirtualItemWidthType;
	/**
	 * 元素宽度系数
	 * @default 0
	 */
	itemWidthRatio?: number;
	/**
	 * 元素高度
	 * @description
	 * - `fixed`：固定高度，通过 `itemHeightRatio` 确定元素的高度
	 * - `dynamic`：动态高度，每个项目提供自身高度
	 * @default 'dynamic'
	 */
	itemHeightType?: WidgetGridVirtualItemHeightType;
	/**
	 * 元素高度系数
	 * @default 0
	 */
	itemHeightRatio?: number;
}

type Spacing = [left: number, gap: number, right: number];

const ALIGN: WidgetGridVirtualLayout[] = ['fill', 'content-center'];
const ITEM_SPACING: WidgetGridVirtualItemSpacing[] = [
	'between',
	'around',
	'evenly',
	'none',
];
const ITEM_ALIGN: WidgetGridVirtualItemAlign[] = [
	'left',
	'center',
	'right',
	'justify',
];
const ITEM_VERTICAL_ALIGN: WidgetGridVirtualItemVerticalAlign[] = [
	'top',
	'center',
	'bottom',
];
const ITEM_WIDTH_TYPE: WidgetGridVirtualItemWidthType[] = [
	'fixed-count',
	'fixed-size',
	'variable',
	'dynamic',
];
const ITEM_HEIGHT_TYPE: WidgetGridVirtualItemHeightType[] = [
	'fixed',
	'dynamic',
];

function sum(width: number[]): number {
	return width.reduce((p, c) => p + c, 0);
}

const HORIZONTAL_SPACING: Record<
	WidgetGridVirtualItemSpacing,
	(width: number[], lineWidth: number, hGap: number) => Spacing
> = {
	between(width, lineWidth) {
		const blank = lineWidth - sum(width);
		if (width.length <= 2) return [0, blank, 0];
		return [0, blank / (width.length - 1), 0];
	},
	around(width, lineWidth, hGap) {
		const blank = lineWidth - sum(width);
		const gap = clamp(
			hGap,
			blank / width.length,
			blank / Math.max(width.length - 1, 1),
		);
		const around = (blank - gap * (width.length - 1)) / 2;
		return [around, gap, around];
	},
	evenly(width, lineWidth, hGap) {
		const blank = lineWidth - sum(width);
		const gap = clamp(
			hGap,
			blank / (width.length + 1),
			blank / Math.max(width.length - 1, 1),
		);
		const around = (blank - gap * (width.length - 1)) / 2;
		return [around, gap, around];
	},
	none(width, lineWidth, hGap) {
		const blank = lineWidth - sum(width) - hGap * (width.length - 1);
		return [blank, hGap, blank];
	},
};

const HORIZONTAL_POSITIONING: Record<
	WidgetGridVirtualItemAlign,
	(
		items: HTMLElement[],
		width: number[],
		lineWidth: number,
		spacing: WidgetGridVirtualItemSpacing,
		hGap: number,
		prevLine?: Spacing,
	) => Spacing
> = {
	left(items, width, lineWidth, spacing, hGap, prevLine) {
		let left: number;
		let gap: number;
		if (prevLine) {
			[left, gap] = prevLine;
		} else {
			[left, gap] = HORIZONTAL_SPACING[spacing](width, lineWidth, hGap);
			if (spacing === 'none') left = 0;
		}
		let l = left;
		for (const [item, w] of zip(items, width)) {
			item.style.left = `${l}px`;
			l += gap + w;
		}
		return [left, gap, 0];
	},
	center(items, width, lineWidth, spacing, hGap, prevLine) {
		let left: number;
		let gap: number;
		if (prevLine) {
			gap = prevLine[1];
			left = (lineWidth - sum(width) - gap * (items.length - 1)) / 2;
		} else {
			[left, gap] = HORIZONTAL_SPACING[spacing](width, lineWidth, hGap);
			if (spacing === 'none') left /= 2;
		}
		let l = left;
		for (const [item, w] of zip(items, width)) {
			item.style.left = `${l}px`;
			l += gap + w;
		}
		return [left, gap, 0];
	},
	right(items, width, lineWidth, spacing, hGap, prevLine) {
		let left: number;
		let gap: number;
		let right: number;
		if (prevLine) {
			[left, gap, right] = prevLine;
		} else {
			[left, gap, right] = HORIZONTAL_SPACING[spacing](width, lineWidth, hGap);
			if (spacing === 'none') right = 0;
		}
		let r = lineWidth - right;
		for (const [item, w] of zip(toReversed(items), toReversed(width))) {
			r -= w;
			item.style.left = `${r}px`;
			r -= gap;
		}
		return [left, gap, right];
	},
	justify(items, width, lineWidth, spacing, hGap, prevLine) {
		let left: number;
		let gap: number;
		let right: number;
		if (prevLine) {
			[left, gap, right] = prevLine;
			if (items.length > 1) {
				gap = (lineWidth - sum(width) - left - right) / (items.length - 1);
			}
		} else {
			[left, gap, right] = HORIZONTAL_SPACING[spacing](width, lineWidth, hGap);
			if (spacing === 'none') {
				left /= 2;
				right /= 2;
			}
		}
		let l = left;
		for (const [item, w] of zip(items, width)) {
			item.style.left = `${l}px`;
			l += w + gap;
		}
		return [left, gap, right];
	},
};

const VERTICAL_POSITIONING: Record<
	WidgetGridVirtualItemVerticalAlign,
	(
		items: HTMLElement[],
		height: number[],
		lineHeight: number,
		offset: number,
	) => void
> = {
	top: (items, _, __, offset) => {
		const top = `${offset}px`;
		for (const item of items) {
			item.style.top = top;
		}
	},
	center: (items, height, lineHeight, offset) => {
		for (const [item, h] of zip(items, height)) {
			item.style.top = `${(lineHeight - h) / 2 + offset}px`;
		}
	},
	bottom: (items, height, lineHeight, offset) => {
		for (const [item, h] of zip(items, height)) {
			item.style.top = `${lineHeight - h + offset}px`;
		}
	},
};

//#region #Item
/** 虚拟网格子元素类基类 */
export abstract class WidgetGridVirtualItem<
		Data = unknown,
		EventList extends EventsInitList<EventList> = {},
	>
	extends Widget<EventList>
	implements Navigable
{
	/** 数据 */
	abstract data: Data;
	/**
	 * 元素宽度
	 * @description
	 * 当 `itemWidthType` 为 `dynamic` 使用此值
	 */
	viewWidth = 0;
	/**
	 * 元素高度
	 * @description
	 * 当 `itemHeightType` 为 `dynamic` 使用此值
	 */
	viewHeight = 0;
}

/** 虚拟网格子元素类基类构造器 */
export interface WidgetGridVirtualItemConstructor<
	Data = unknown,
	Item extends WidgetGridVirtualItem<Data> = WidgetGridVirtualItem<Data>,
> {
	new (...args: any): Item;
	/**
	 * 由表格组件调用，创建表格元素
	 * @param data - 数据
	 * @example
	 * ```ts
	 * create(data: Data): Item {
	 * 	 const element = $new('grid-item-tag-name');
	 *   element.data = data;
	 *   return element;
	 * }
	 */
	create(data: Data): Item;
}

//#region #Gird
type LayoutLine<Item> = {
	items: Item[];
	width: number[];
	height: number[];
	lineHeight: number;
};

@customElement('w-grid-virtual')
export class WidgetGridVirtual<
		Data = unknown,
		Item extends WidgetGridVirtualItem<Data> = WidgetGridVirtualItem<Data>,
	>
	extends Widget
	implements Navigable
{
	static styles = css(CSS);
	#container = $div({ class: 'container' });
	#content = $div({ class: 'content' }, this.#container);
	#resizeObserver = new ResizeObserver(() => {
		if (this.#itemWidthType !== 'fixed-count') {
			this.#requireUpdateItemLayout = true;
		}
		this.#updateRect();
		this.#updateLayoutDebounce();
	});
	constructor() {
		super({ navGroup: true });
		this.#resizeObserver.observe(this.#content);
		this.#intersectionObserver.observe(this);
		this.#updateRect();
	}
	//#region Items
	#itemClass?: WidgetGridVirtualItemConstructor<Data, Item>;
	#createItem(data: Data): Item {
		const item: Item & Navigable = this.#itemClass!.create(data);
		item.part.add('w-grid-virtual-item');
		item.navParent = this;
		return item;
	}
	#items = new SyncList<Data, Item>({
		getData: (instance) => instance.data,
		setData(instance, data) {
			instance.data = data;
		},
		create: (data) => this.#createItem(data),
		update: () => {
			this.#container.replaceChildren(...this.#items.instances);
			this.#requireUpdateItemLayout = true;
			this.#updateLayoutDebounce();
		},
		updateDelay: 50,
	});
	/** 列表元素类 */
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
	/** 列表数据 */
	get items() {
		return this.#items.data;
	}
	set items(value: Data[]) {
		this.#items.replace(...value);
	}
	//#region Layout
	#layout: WidgetGridVirtualLayout = 'fill';
	#itemScaping: WidgetGridVirtualItemSpacing = 'between';
	#itemAlign: WidgetGridVirtualItemAlign = 'left';
	#itemVerticalAlign: WidgetGridVirtualItemVerticalAlign = 'top';
	#itemWidthType: WidgetGridVirtualItemWidthType = 'dynamic';
	#itemWidthRatio = 0;
	#itemHeightType: WidgetGridVirtualItemHeightType = 'dynamic';
	#itemHeightRatio = 0;
	#hGap = 0;
	#vGap = 0;
	/**
	 * 网格整体布局
	 * @description
	 * - `fill`: 填充宽度
	 * - `content-center`：智能内容居中（根据实际元素宽度居中）
	 */
	get layout() {
		return this.#layout;
	}
	set layout(value: WidgetGridVirtualLayout) {
		if (!ALIGN.includes(value)) return;
		if (this.#layout === value) return;
		this.#layout = value;
		this.#updateLayoutDebounce();
	}
	/**
	 * 元素行内横向间隔
	 * @description
	 * - `between`：均匀分布，第一项与起始点齐平，最后一项与终止点齐平
	 * - `around`：均匀分布，项目在两端有一半大小的空间
	 * - `evenly`：均匀分布，项目周围有相等的空间
	 * - `none`：紧密分布，项目之间无额外间隔
	 */
	get itemScaping() {
		return this.#itemScaping;
	}
	set itemScaping(value: WidgetGridVirtualItemSpacing) {
		if (!ITEM_SPACING.includes(value)) return;
		if (this.#itemScaping === value) return;
		this.#itemScaping = value;
		this.#updateLayoutDebounce();
	}
	/**
	 * 元素行内横向对齐
	 * @description
	 * - `left`：左对齐
	 * - `center`：居中对齐
	 * - `right`：右对齐
	 * - `justify`：两端对齐
	 */
	get itemAlign() {
		return this.#itemAlign;
	}
	set itemAlign(value: WidgetGridVirtualItemAlign) {
		if (!ITEM_ALIGN.includes(value)) return;
		if (this.#itemAlign === value) return;
		this.#itemAlign = value;
		this.#updateLayoutDebounce();
	}
	/**
	 * 元素行内纵向对齐
	 * @description
	 * - `top`：顶部
	 * - `center`：中间
	 * - `bottom`：底部
	 */
	get itemVerticalAlign() {
		return this.#itemVerticalAlign;
	}
	set itemVerticalAlign(value: WidgetGridVirtualItemVerticalAlign) {
		if (!ITEM_VERTICAL_ALIGN.includes(value)) return;
		if (this.#itemVerticalAlign === value) return;
		this.#itemVerticalAlign = value;
		this.#updateLayoutDebounce();
	}
	/**
	 * 元素宽度
	 * @description
	 * - `fixed-count`：固定数量，通过 `itemWidthRatio` 确定一行显示的项目数量
	 * - `fixed-size`：固定宽度，通过 `itemWidthRatio` 确定一个项目的宽度
	 * - `variable`：可变宽度，尽可能填充宽度，通过 `itemWidthRatio` 确定一个项目的目标宽度
	 * - `dynamic`：动态宽度，每个项目提供自身宽度
	 */
	get itemWidthType() {
		return this.#itemWidthType;
	}
	set itemWidthType(value: WidgetGridVirtualItemWidthType) {
		if (!ITEM_WIDTH_TYPE.includes(value)) return;
		if (this.#itemWidthType === value) return;
		this.#itemWidthType = value;
		this.#requireUpdateItemLayout = true;
		this.#updateLayoutDebounce();
	}
	/** 元素宽度系数 */
	get itemWidthRatio() {
		return this.#itemWidthRatio;
	}
	set itemWidthRatio(value: number) {
		if (typeof value !== 'number') return;
		if (this.#itemWidthRatio === value) return;
		this.#itemWidthRatio = value;
		if (this.#itemWidthType !== 'dynamic') {
			this.#requireUpdateItemLayout = true;
		}
		this.#updateLayoutDebounce();
	}
	/**
	 * 元素高度
	 * @description
	 * - `fixed`：固定高度，通过 `itemHeightRatio` 确定元素的高度
	 * - `dynamic`：动态高度，每个项目提供自身高度
	 */
	get itemHeightType() {
		return this.#itemHeightType;
	}
	set itemHeightType(value: WidgetGridVirtualItemHeightType) {
		if (!ITEM_HEIGHT_TYPE.includes(value)) return;
		if (this.#itemHeightType === value) return;
		this.#itemHeightType = value;
		this.#requireUpdateItemLayout = true;
		this.#updateLayoutDebounce();
	}
	/** 元素高度系数 */
	get itemHeightRatio() {
		return this.#itemHeightRatio;
	}
	set itemHeightRatio(value: number) {
		if (typeof value !== 'number') return;
		if (this.#itemHeightRatio === value) return;
		this.#itemHeightRatio = value;
		if (this.#itemHeightType !== 'dynamic') {
			this.#requireUpdateItemLayout = true;
		}
		this.#updateLayoutDebounce();
	}
	/** 元素水平间距 */
	get hGap() {
		return this.#hGap;
	}
	set hGap(value) {
		if (!Number.isFinite(value)) return;
		if (this.#hGap === value) return;
		if (value < 0) value = 0;
		this.#hGap = value;
		this.#requireUpdateItemLayout = true;
		this.#updateLayoutDebounce();
	}
	/** 元素垂直间距 */
	get vGap() {
		return this.#vGap;
	}
	set vGap(value) {
		if (!Number.isFinite(value)) return;
		if (this.#vGap === value) return;
		if (value < 0) value = 0;
		this.#vGap = value;
		this.#requireUpdateItemLayout = true;
		this.#updateLayoutDebounce();
	}
	#width = 0;
	#linesLayout: LayoutLine<Item>[] = [];
	#requireUpdateItemLayout = false;
	#updateRect() {
		this.#width = this.#content.clientWidth;
	}
	#normalizeWidth(target: number, fallback: number): number {
		if (!Number.isFinite(target) || target < 0 || target > this.#width) {
			return fallback;
		}
		return target;
	}
	#normalizeHeight(target: number, fallback: number): number {
		if (!Number.isFinite(target) || target < 0) {
			return fallback;
		}
		return target;
	}
	#updateLayoutItemWidth(): number[] {
		if (this.#items.instances.length === 0) return [];
		// Dynamic
		if (this.#itemWidthType === 'dynamic') {
			const widths: number[] = [];
			for (const item of this.#items.instances) {
				const size = this.#normalizeWidth(item.viewWidth, 0);
				widths.push(size);
				item.style.width = `${size}px`;
			}
			return widths;
		}

		const widths: number[] = new Array(this.#items.instances.length);
		let width: string;
		if (this.#itemWidthType === 'fixed-count') {
			// Fixed Count
			let count = Math.max(Math.trunc(this.#itemWidthRatio), 1);
			if (!Number.isFinite(count)) count = 1;
			width = `${this.#width / count}px`;
			widths.fill(this.#width / count);
		} else if (this.#itemWidthType === 'fixed-size') {
			// Fixed Size
			const size = this.#normalizeWidth(this.#itemWidthRatio, this.#width);
			width = `${size}px`;
			widths.fill(size);
		} else {
			// Variable
			const target = this.#normalizeWidth(this.#itemWidthRatio, this.#width);
			const count = Math.max(Math.round(this.#width / target), 1);
			width = `${this.#width / count}px`;
			widths.fill(this.#width / count);
		}
		for (const element of this.#items.instances) {
			element.style.width = width;
		}
		return widths;
	}
	#updateLayoutItemHeight(widths: number[]): LayoutLine<Item>[] {
		if (this.#items.instances.length === 0) return [];

		const fixedHeight = this.#normalizeHeight(this.#itemHeightRatio, 0);
		const getHeight =
			this.#itemHeightType === 'fixed'
				? () => fixedHeight
				: (item: Item): number => this.#normalizeHeight(item.viewHeight, 0);

		const lines: LayoutLine<Item>[] = [];

		let line: LayoutLine<Item> = {
			items: [],
			width: [],
			height: [],
			lineHeight: 0,
		};
		let acc = 0;
		lines.push(line);

		for (const [item, width] of zip(this.#items.instances, widths)) {
			const height = getHeight(item);
			item.style.height = `${height}px`;
			if (width + this.#hGap + acc > this.#width) {
				line = { items: [], width: [], height: [], lineHeight: 0 };
				acc = 0;
				lines.push(line);
			}
			acc += width + this.#hGap;
			line.items.push(item);
			line.width.push(width);
			line.height.push(height);
			line.lineHeight = Math.max(line.lineHeight, height);
		}

		return lines;
	}
	#updateLayoutItem() {
		const widths = this.#updateLayoutItemWidth();
		this.#linesLayout = this.#updateLayoutItemHeight(widths);
	}
	#updateLayout() {
		this.#container.style.height = `${this.#linesLayout.reduce((p, { lineHeight }) => p + lineHeight + this.#vGap, 0)}px`;

		let lineWidth = this.#width;
		if (this.#layout === 'content-center') {
			lineWidth = Math.max(
				...this.#linesLayout.map(({ width }) => width.reduce((p, w) => p + w, 0)),
			);
		}
		this.#content.style.paddingLeft = `${(this.#width - lineWidth) / 2}px`;
		let top = 0;
		let prevSpacing: Spacing | undefined;
		const horizontalPositioning = HORIZONTAL_POSITIONING[this.#itemAlign];
		const verticalPositioning = VERTICAL_POSITIONING[this.#itemVerticalAlign];
		for (const [
			i,
			{ items, width, height, lineHeight },
		] of this.#linesLayout.entries()) {
			const spacing = horizontalPositioning(
				items,
				width,
				lineWidth,
				this.#itemScaping,
				this.#hGap,
				prevSpacing,
			);
			if (i === this.#linesLayout.length - 2) prevSpacing = spacing;
			verticalPositioning(items, height, lineHeight, top);
			top += lineHeight + this.#vGap;
		}
	}
	#updateLayoutDebounce = Debounce.new(() => {
		if (this.#requireUpdateItemLayout) {
			this.#updateLayoutItem();
			this.#requireUpdateItemLayout = false;
		}
		this.#updateLayout();
		this.#updateView(true);
	});
	/** 强制更新布局 */
	updateLayout() {
		this.#requireUpdateItemLayout = true;
		this.#updateLayoutDebounce();
	}
	//#region View
	#frameController = new AnimationFrameController(() => this.#updateView());
	#intersectionObserver = new IntersectionObserver((entries) => {
		if (entries[0].isIntersecting) {
			this.#frameController.start();
		} else {
			this.#frameController.stop();
		}
	});
	#prevTop = NaN;
	#updateView(force?: boolean) {
		if (this.#items.instances.length === 0) return;
		let { top } = this.#container.getBoundingClientRect();
		if (top === this.#prevTop && !force) return;
		this.#prevTop = top;

		const bottom = window.innerHeight - top;
		if (bottom < 0) return;
		if (top >= 0) top = 0;
		else top = -top;

		let offset = 0;
		for (const { lineHeight, items } of this.#linesLayout) {
			const visible = offset + lineHeight >= top && offset - lineHeight <= bottom;
			for (const item of items) {
				item.style.display = visible ? '' : 'none';
			}
			offset += lineHeight + this.#vGap;
			if (offset - 100 > bottom) return;
		}
	}
	protected render() {
		return this.#content;
	}
	//#region Nav
	get navChildren() {
		return this.#items.instances;
	}
}
