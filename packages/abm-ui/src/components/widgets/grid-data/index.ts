import { $div, $new, createArray, css, Debounce, zip } from 'abm-utils';
import { customElement } from 'lit/decorators.js';
import { configs } from '../../../configs';
import { events, type UIEventSlideState } from '../../../events';
import { type KeyboardEvents, keyboard } from '../../../keyboard';
import type { Navigable } from '../../../navigate';
import { Widget } from '../base';
import CSS from './index.styl';

export interface WidgetGridDataColumnDefinition<
	Data extends object = object,
	E extends HTMLElement = HTMLElement,
> {
	head(): HTMLElement;
	create(row: Data): E;
	refresh(row: Data, element: E): any;
	sort(a: Data, b: Data): number;
}
export type WidgetGridDataColumn = {
	key: string | number | symbol;
	width: string | number;
};
/**
 * 数据表格刷新级别
 * @description
 * - `style`：仅刷新样式
 * - `data`：仅刷新数据
 * - `column`：刷新数据和更新列
 * - `all`：清空表格重新渲染
 */
export type WidgetGridDataRefreshLevel = 'style' | 'data' | 'column' | 'all';
export interface WidgetGridDataInit<Data extends object = object> {
	data: Data[];
	columnDefinitions:
		| Map<string | number | symbol, WidgetGridDataColumnDefinition<Data>>
		| { [key: string | number | symbol]: WidgetGridDataColumnDefinition<Data> };
	column: WidgetGridDataColumn[];
	rowHeight?: number;
	sortIndex?: number;
	sortDirection?: WidgetGridDataSortDirection;
}

export type WidgetGridDataSortDirection = 'asc' | 'desc' | 'none';

const DIRECTION = ['asc', 'desc'];

@customElement('w-grid-data')
export class WidgetGridData<Data extends object = object>
	extends Widget
	implements Navigable
{
	static styles = css(CSS);
	#root = this.createRenderRoot() as ShadowRoot;
	#styleSheet = new CSSStyleSheet();
	#head = $div({ class: 'head' });
	#body = $div({ class: 'body', style: { $wGridDataZzz: 32 } });
	constructor() {
		super({ navGroup: true });
		this.#root.append(this.#head, this.#body);
	}
	connectedCallback(): void {
		super.connectedCallback();
		this.#root.adoptedStyleSheets = this.#root.adoptedStyleSheets.concat(
			this.#styleSheet,
		);
	}
	//#region Data
	#data: Data[] = [];
	get data() {
		return this.#data;
	}
	set data(value) {
		if (value === this.#data) return;
		if (!Array.isArray(value)) return;
		this.#data = value;
		this.#dismissOrder();
		this.refresh('data');
	}
	/**
	 * 插入多行数据
	 * @param index - 位置
	 * @param data - 数据
	 * @returns - 是否成功插入数据
	 * @description
	 * `0` 代表第一行前
	 * `1` 代表第一行后
	 * `data.length` 和 `-1` 都代表最后一行后
	 * `-2` 代表第二行前
	 */
	insertRow(index: number, ...data: Data[]): boolean {
		index = Math.trunc(index);
		if (index < 0) index = this.#data.length + index + 1;
		if (index > this.#data.length || index < 0) return false;
		if (data.length === 0) return true;

		const column = this.#column.map(
			({ key }) => this.#columnDefinitions.get(key)!,
		);
		const rows = data.map((row) => this.#createRow(column, row));
		if (index === this.#data.length) this.#body.append(...rows);
		else this.#body.children.item(index)!.before(...rows);

		this.#data.splice(index, 0, ...data);

		return true;
	}
	/**
	 * 删除多行数据
	 * @param index - 位置
	 * @param length - 数量
	 * @returns - 是否成功删除数据
	 * @description
	 * `0` 代表第一行
	 * `1` 代表第二行
	 * `data.length` 和 `-1` 都代表最后一行
	 * `-2` 代表最后第二行
	 */
	deleteRow(index: number, length: number): boolean {
		if (length < 1) return false;
		length = Math.trunc(length);
		index = Math.trunc(index);
		if (index < 0) index = this.#data.length + index;
		if (index >= this.#data.length || index < 0) return false;

		this.#data.splice(index, length);
		while (length > 0) {
			this.#body.children.item(index)?.remove();
			length--;
		}

		return true;
	}
	//#region Column
	#columnDefinitions = new Map<
		string | number | symbol,
		WidgetGridDataColumnDefinition<Data>
	>();
	get columnDefinitions() {
		return this.#columnDefinitions;
	}
	set columnDefinitions(value:
		| Map<string | number | symbol, WidgetGridDataColumnDefinition<Data>>
		| { [key: string | number | symbol]: WidgetGridDataColumnDefinition<Data> }) {
		if (value === this.#columnDefinitions) return;
		if (typeof value !== 'object') return;
		if (value instanceof Map) {
			this.#columnDefinitions = value;
			this.refresh('all');
			return;
		}
		this.#columnDefinitions = new Map(Object.entries(value));
		this.#column = this.#column.filter(({ key }) =>
			this.#columnDefinitions.has(key),
		);
		this.refresh('all');
	}
	#column: WidgetGridDataColumn[] = [];
	get column() {
		return this.#column;
	}
	set column(value) {
		if (value === this.#column) return;
		if (!Array.isArray(value)) return;
		this.#column = value.filter(({ key }) => this.#columnDefinitions.has(key));
		this.#dismissOrder();
		this.refresh('column');
	}
	/**
	 * 插入多个列
	 * @param index - 位置
	 * @param column - 列
	 * @returns - 是否成功插入列
	 * @description
	 * `0` 代表第一列前
	 * `1` 代表第一列后
	 * `data.length` 和 `-1` 都代表最后一列后
	 * `-2` 代表第二列前
	 */
	insertColumn(index: number, ...column: WidgetGridDataColumn[]): boolean {
		index = Math.trunc(index);
		if (index < 0) index = this.#column.length + index + 1;
		if (index > this.#column.length || index < 0) return false;
		column = column.filter(({ key }) => this.#columnDefinitions.has(key));
		if (column.length === 0) return true;

		const cols = column.map(({ key }) => this.#columnDefinitions.get(key)!);
		const headItems = cols.map(({ head }) => this.#createHeadItem(head));
		const rowItems = this.#data.map((data) =>
			cols.map(({ create }) => $div({ class: 'item' }, create(data))),
		);
		if (index === this.#column.length) {
			this.#head.append(...headItems);
			for (const [row, items] of zip([...this.#body.children], rowItems)) {
				row.append(...items);
			}
		} else {
			this.#head.children.item(index)!.before(...headItems);
			for (const [row, items] of zip([...this.#body.children], rowItems)) {
				row.children.item(index)!.before(...items);
			}
		}

		this.#column.splice(index, 0, ...column);

		this.#refreshStyle();
		return true;
	}
	/**
	 * 删除多个列
	 * @param index - 位置
	 * @param length - 数量
	 * @returns - 是否成功删除列
	 * @description
	 * `0` 代表第一列
	 * `1` 代表第二列
	 * `data.length` 和 `-1` 都代表最后一列
	 * `-2` 代表最后第二列
	 */
	deleteColumn(index: number, length: number): boolean {
		if (length < 1) return false;
		length = Math.trunc(length);
		index = Math.trunc(index);
		if (index < 0) index = this.#column.length + index;
		if (index >= this.#column.length || index < 0) return false;

		this.#column.splice(index, length);
		while (length > 0) {
			this.#head.children.item(index)?.remove();
			for (const row of this.#body.children) {
				row.children.item(index)?.remove();
			}
			length--;
		}

		return true;
	}
	#rowHeight = 32;
	get rowHeight() {
		return this.#rowHeight;
	}
	set rowHeight(value) {
		if (!Number.isFinite(value)) return;
		if (value < 0) return;
		this.#rowHeight = value;
		this.#body.style.setProperty(
			'--w-grid-data-row-height',
			`${this.#rowHeight}px`,
		);
	}
	//#region View
	setup({
		data,
		columnDefinitions,
		column,
		rowHeight,
	}: WidgetGridDataInit<Data>): boolean {
		if (!Array.isArray(data)) return false;
		if (typeof columnDefinitions !== 'object') return false;
		if (!Array.isArray(column)) return false;

		this.#data = data;
		if (columnDefinitions instanceof Map) {
			this.#columnDefinitions = columnDefinitions;
		} else {
			this.#columnDefinitions = new Map(Object.entries(columnDefinitions));
		}
		this.#column = column;
		if (rowHeight) this.rowHeight = rowHeight;

		this.refresh('all');
		return true;
	}
	#refreshing = false;
	/**
	 * 刷新数据表格
	 * @param level - 级别
	 * @description
	 * - `style`：仅刷新样式
	 * - `data`：仅刷新数据
	 * - `column`：刷新数据和更新列
	 * - `all`：清空表格重新渲染
	 */
	refresh = Debounce.new((level: WidgetGridDataRefreshLevel) => {
		if (this.#refreshing) return;
		this.#refreshing = true;
		switch (level) {
			case 'style':
				this.#refreshStyle();
				break;
			case 'data':
				this.#refreshData();
				break;
			case 'column':
				this.#refreshColumn();
				break;
			case 'all':
				this.#refreshAll();
				break;
		}
		this.#refreshing = false;
	});
	#createHeadItem(head: () => HTMLElement) {
		const resizeHandle = $div({ class: 'resize' });
		const headItem: HTMLDivElement & Navigable = $div(
			{ class: 'head-item', attr: { 'ui-nav': '' } },
			head(),
			$new({
				tag: 'w-icon',
				class: 'sort',
				prop: { key: configs.icon.defaults.orderDesc },
			}),
			resizeHandle,
		);
		headItem.navParent = this;
		events.hover.add(headItem);
		events.active.on(headItem, ({ active, cancel }) => {
			if (active || cancel) return;
			if (this.#resizingIndex !== -1) return;
			if (!headItem.parentNode) return;
			const index = [...headItem.parentNode.children].indexOf(headItem);
			this.sort(index);
		});
		events.slide.on(resizeHandle, ({ dx, state }) => {
			if (!headItem.parentNode) return;
			const index = [...headItem.parentNode.children].indexOf(headItem);
			this.#resize(index, dx, state);
		});
		return headItem;
	}
	#createRow(
		column: { create: WidgetGridDataColumnDefinition<Data>['create'] }[],
		data: Data,
	) {
		const rowItems: HTMLElement[] = [];
		for (const { create } of column) {
			rowItems.push($div({ class: 'item' }, create(data)));
		}
		const row = $div({ class: 'row', attr: { part: 'row' } }, ...rowItems);
		return row;
	}
	#refreshStyle(column: { width: string | number }[] = this.#column) {
		this.#styleSheet.replace(
			column
				.map(
					({ width }, i) =>
						`.head-item:nth-child(${i + 1}),.item:nth-child(${i + 1}){width:${typeof width === 'string' ? width : `${width}px`};}`,
				)
				.join(''),
		);
	}
	#refreshData() {
		for (const [x, { key }] of this.#column.entries()) {
			const col = this.#columnDefinitions.get(key);
			if (!col) continue;
			let y = 0;
			for (const row of this.#body.children) {
				if (y >= this.#data.length) break;
				col.refresh(this.#data[y], row.children[x].firstChild as HTMLElement);
				y++;
			}
		}
		let diff = this.#body.children.length - this.#data.length;
		while (diff > 0) {
			this.#body.lastChild?.remove();
			diff--;
		}
		if (diff === 0) return;
		const column = this.#column
			.map(({ key }) => {
				const col = this.#columnDefinitions.get(key);
				if (!col) return null;
				return col;
			})
			.filter((v) => !!v);
		const rows: HTMLElement[] = [];
		while (diff < 0) {
			rows.push(this.#createRow(column, this.#data.at(diff)!));
			diff++;
		}
		this.#body.append(...rows);
	}
	#refreshColumn() {
		const column = this.#column
			.map(({ key }) => {
				const col = this.#columnDefinitions.get(key);
				if (!col) return null;
				return { ...col, key };
			})
			.filter((v) => !!v);
		const current = this.#column.map(({ key }) => ({ key, used: false }));
		const headItems: HTMLElement[] = [];
		const rows = createArray<HTMLElement[]>(this.#body.children.length, () => []);
		for (const { key, head, create } of column) {
			const x = current.findIndex(({ key: k, used }) => !used && k === key);
			let y = 0;
			if (x === -1) {
				headItems.push(this.#createHeadItem(head));
				for (const row of rows) {
					row.push($div({ class: 'item' }, create(this.#data[y])));
					y++;
				}
			} else {
				current[x].used = true;
				headItems.push(this.#head.children.item(x) as HTMLElement);
				for (const row of this.#body.children) {
					rows[y].push(row.children.item(x) as HTMLElement);
					y++;
				}
			}
		}
		this.#head.replaceChildren(...headItems);
		for (const [row, items] of zip([...this.#body.children], rows)) {
			row.replaceChildren(...items);
		}
		this.#refreshStyle();
	}
	#refreshAll() {
		const column = this.#column
			.map(({ key, width }) => {
				const col = this.#columnDefinitions.get(key);
				if (!col) return null;
				return { ...col, key, width };
			})
			.filter((v) => !!v);
		// Sort
		if (
			this.#sortedColumnIndex !== -1 &&
			DIRECTION.includes(this.#sortDirection)
		) {
			this.#data.sort((a, b) => column[this.#sortedColumnIndex].sort(a, b));
			if (this.#sortDirection === 'desc') this.#data.reverse();
		}
		// Head
		const headItems: HTMLElement[] = [];
		for (const { head } of column) {
			headItems.push(this.#createHeadItem(head));
		}
		this.#head.replaceChildren(...headItems);
		// Body
		const rows: HTMLElement[] = [];
		for (const data of this.#data) {
			rows.push(this.#createRow(column, data));
		}
		this.#body.replaceChildren(...rows);
		// Style
		this.#refreshStyle(column);
	}
	//#region Sort
	#sortedColumnIndex = -1;
	/** 当前排序列索引（-1 表示未排序） */
	get sortedColumnIndex() {
		return this.#sortedColumnIndex;
	}
	/** 当前排序方向 */
	#sortDirection: WidgetGridDataSortDirection = 'none';
	get sortDirection() {
		return this.#sortDirection;
	}
	#dismissOrder() {
		this.#sortedColumnIndex = -1;
		this.#sortDirection = 'none';
		this.#head.querySelector('[order]')?.removeAttribute('order');
	}
	sort(index: number, direction?: WidgetGridDataSortDirection) {
		if (!Number.isFinite(index)) return;
		index = Math.trunc(index);
		if (index < -1) return;
		// No Sort
		if (
			(index === -1 || index === this.#sortedColumnIndex) &&
			direction === this.#sortDirection
		) {
			this.#sortedColumnIndex = -1;
			this.#sortDirection = 'none';
			this.#head.querySelector('[order]')?.removeAttribute('order');
			return;
		}
		// Direction
		let reverse = false;
		if (DIRECTION.includes(direction!)) {
			reverse = true;
		} else if (index === this.#sortedColumnIndex) {
			if (this.#sortDirection === 'desc') direction = 'asc';
			else direction = 'desc';
		} else {
			direction = 'desc';
		}
		// Order
		const originOrder = [...this.#data];
		if (reverse) this.#data.reverse();
		else {
			this.#data.sort((a, b) =>
				this.#columnDefinitions.get(this.#column[index].key)!.sort(a, b),
			);
			if (direction === 'desc') this.#data.reverse();
		}
		const order = this.#data.map((row) => originOrder.indexOf(row));
		// Apply
		const rows = order.map((i) => this.#body.children.item(i)!);
		this.#body.replaceChildren(...rows);
		this.#head.querySelector('[order]')?.removeAttribute('order');
		this.#head.children.item(index)?.setAttribute('order', direction!);
		this.#sortedColumnIndex = index;
		this.#sortDirection = direction!;
	}
	//#region Resize
	#resizingIndex = -1;
	#originSize = 0;
	#resize(index: number, dx: number, state: UIEventSlideState) {
		// const column = this.#column[index];
		const item = this.#head.children.item(index) as HTMLElement;
		if (state === 'start') {
			keyboard.on('aliasPress', this.#keyAliasPressHandler);
			this.#resizingIndex = index;
			this.#originSize = item.offsetWidth;
		}
		this.#column[index].width = Math.max(dx + this.#originSize, 8);
		this.#refreshStyle();
		if (state !== 'end') return;
		keyboard.on('aliasPress', this.#keyAliasPressHandler);
		this.#resizingIndex = -1;
	}
	#keyAliasPressHandler = ({ key }: KeyboardEvents['aliasPress']) => {
		if (key !== 'ui.cancel') return;
		keyboard.on('aliasPress', this.#keyAliasPressHandler);
		events.slide.cancel(
			this.#head.children
				.item(this.#resizingIndex)!
				.children.item(2) as HTMLElement,
		);
		this.#column[this.#resizingIndex].width = this.#originSize;
		this.#resizingIndex = -1;
		this.#refreshStyle();
	};
	//#region Other
	get navChildren() {
		const children = [
			...this.#body.querySelectorAll<Navigable>('[ui-nav],[ui-nav-group]'),
		];
		for (const child of children) {
			child.navParent = this;
		}
		return [...this.#head.children, ...children] as Navigable[];
	}
}
