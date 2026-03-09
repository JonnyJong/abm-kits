import {
	type applyConditionalOperation,
	asArray,
	type Constructor,
	proxyArray,
	SetMap,
	zip,
} from 'abm-utils';
import { defineElement } from '../infra/decorator';
import type { ElementProps } from '../infra/dom';
import { $div, $new, $rect, type DOMContents } from '../infra/dom';
import { register } from '../infra/registry';
import { css } from '../infra/style';
import { MovementController } from '../movement';
import type { Navigable } from '../navigate';
import { state } from '../state';
import type { AriaConfig } from './base';
import { FormControl } from './form';
import { ico } from './icon';
import { List, ListItem } from './list';

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-table': Table;
	}
}

declare module '../infra/registry' {
	interface Registry {
		table: Table;
	}
}

declare module './icon' {
	interface PresetIcons {
		/** 表格：递增 */
		increasing: string;
	}
}

//#region Column

const FORM_EVENTS = ['input', 'change', 'submit'] as const;

/** 表格单元格 */
export interface TableCell<T, V, E extends DOMContents = DOMContents> {
	create: (
		data: V,
		row: T,
		emit: (type: 'input' | 'change' | 'submit') => void,
	) => E;
	update?: (dom: E, data: V, row: T) => E;
}
/** 表格列 */
export interface TableColumn<T, K extends keyof T = keyof T> {
	/** 列键 */
	key: K;
	/** 列头 */
	head?: (key: K) => DOMContents;
	/** 单元格 */
	cell?: TableCell<T, T[K]> | Constructor<FormControl<T[K]>>;
	/** 排序比较 */
	sort?: (a: T[K], b: T[K]) => number;
	/** 列宽度 */
	width?: string | number;
}
export type TableColumns<T> = {
	[K in keyof T]: TableColumn<T, K>;
}[keyof T][];
function defaultHead(key: string | symbol | number): HTMLElement {
	return $div({ children: String(key) });
}
const DEFAULT_CELL: TableCell<any, any> = {
	create(data) {
		return $div({ children: String(data) });
	},
	update(dom, data) {
		(dom as HTMLElement).textContent = String(data);
		return dom;
	},
};
function controlToCell<T, K extends keyof T>(
	control: Constructor<FormControl<T[K]>>,
	key: K,
): TableCell<T, T[K], FormControl<T[K]>> {
	return {
		create(data, row, emit) {
			const node = $new(control, { value: data });
			for (const event of FORM_EVENTS) {
				node.on(event, () => {
					row[key] = node.value;
					emit(event);
				});
			}
			return node;
		},
		update(dom, data) {
			dom.value = data;
			return dom;
		},
	};
}
function defaultSort<T>(a: T, b: T): number {
	if (typeof a === 'number' && typeof b === 'number') {
		const diff = a - b;
		if (Number.isNaN(diff)) return 1;
		return diff;
	}
	const sa = String(a);
	const sb = String(b);
	if (sa === sb) return 0;
	return sa > sb ? 1 : -1;
}

//#region Row

type TableCellInRow = [HTMLDivElement, DOMContents];

function isForm(define: unknown): define is Constructor<FormControl<any>> {
	if (typeof define !== 'function') return false;
	return define.prototype instanceof FormControl;
}

/** 表格行 */
@defineElement('abm-table-row')
class TableRow<T> extends ListItem<T> {
	protected static aria: AriaConfig = { role: 'row' };
	#initialized = false;
	#cells: [TableColumn<T>['cell'], TableCellInRow][] = [];
	table!: Table<any>;
	columns!: TableColumn<T>[];
	#value!: T;
	get value() {
		return this.#value;
	}
	set value(value) {
		this.#value = value;
		if (this.#initialized) this.updateCellsValue();
		else this.update();
		this.#initialized = true;
	}
	#emit = (type: 'input' | 'change' | 'submit') => {
		switch (type) {
			case 'input':
			case 'change':
				this.table.emit(type, this.table.value);
				break;
			case 'submit':
				this.table.emit(type);
		}
	};
	/** 更新整行 */
	update() {
		const old = new SetMap<TableColumn<T>['cell'], TableCellInRow>();
		for (const [col, cell] of this.#cells) old.add(col, cell);
		const row = this.#value;
		const newCells = this.columns.map<[TableColumn<T>['cell'], TableCellInRow]>(
			(column) => {
				const data = row[column.key];
				const rawDefine = column.cell ?? DEFAULT_CELL;
				let cell = old.getOne(rawDefine);
				const define = isForm(rawDefine)
					? controlToCell(rawDefine, column.key)
					: rawDefine;
				if (cell) {
					old.delete(rawDefine, cell);
					if (!define.update) return [column.cell, cell];
					cell[1] = define.update(cell[1] as any, data, row);
				} else {
					const div = $div({ part: 'cell', role: 'cell' });
					const content = define.create(data, row, this.#emit);
					cell = [div, content];
				}
				cell[0].replaceChildren(...asArray(cell[1]));
				return [column.cell, cell];
			},
		);
		this.#cells = newCells;
		this.replaceChildren(...newCells.map(([_, [e]]) => e));
	}
	/** 更新表格数据 */
	updateCellsValue() {
		const row = this.#value;
		for (let [column, [rawDefine, cell]] of zip(this.columns, this.#cells)) {
			const data = row[column.key];
			rawDefine ??= DEFAULT_CELL;
			const define = isForm(rawDefine)
				? controlToCell(rawDefine, column.key)
				: rawDefine;
			if (!define.update) continue;
			cell[1] = define.update(cell[1] as any, data, row);
			cell[0].replaceChildren(...asArray(cell[1]));
		}
	}
}

//#region #Table
export interface TableProp<T extends object = object>
	extends ElementProps<Table<T>> {}

type CellInHead = [div: HTMLDivElement, resize: HTMLDivElement];

/**
 * 表格
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form/table)
 */
@register('table')
@defineElement('abm-table')
export class Table<T extends object = object>
	extends FormControl<T[], TableProp>
	implements Navigable
{
	protected static style = css`
		:host {
			display: block;
			border-radius: var(--border-radius);
			overflow: auto;
		}
		:host>.head, :host>.body>* {
			display: flex;
			width: max-content;
		}
		:host>.head, :host>.body>*:nth-child(even) { background: var(--ui-bg) }
		:host>.head {
			position: sticky;
			top: 0;
			z-index: 1;
			backdrop-filter: blur(8px);
		}
		:host>.head>*:nth-child(odd), :host>.body>*>* {
			display: flex;
			align-items: center;
			padding: 4px;
			overflow: clip;
		}
		:host>.head>*>:first-child { flex: 1 }
		:host>.head>*:nth-child(even) {
			position: relative;
		}
		:host>.head>*:nth-child(even)::before {
			content: '';
			position: absolute;
			display: block;
			top: 0;
			left: -1px;
			height: 100%;
			width: 1px;
		}
		:host>.head>*:nth-child(even)::after {
			content: '';
			position: absolute;
			display: block;
			top: 0;
			left: -4px;
			height: 100%;
			width: 4px;
		}
		:host>.head>*:nth-child(even):hover::before,
		:host>.head>*:nth-child(even):active::before {
			background: var(--fg);
		}
		:host>.head>*:nth-child(odd)[hover] { background: var(--ui-bg-hover) }
		:host>.head>*:nth-child(odd)[active] { background: var(--ui-bg-active) }
		:host>.head>*>.order {
			transition: .1s scale, .1s rotate;
			scale: 0;
		}
		:host>.head>[sort]>.order { scale: 1 }
		:host>.head>[sort="rev"]>.order { rotate: 180deg }
	`;
	protected static aria: AriaConfig = { role: 'table' };
	#headCells: [TableColumn<T>, CellInHead][] = [];
	#head = $div({ className: 'head', part: 'head', role: 'head' });
	#body: List<T, TableRow<T>> = $new(List<T, TableRow<T>>, {
		className: 'body',
		part: 'body',
		role: 'body',
	});
	#columns = proxyArray<TableColumns<T>[0]>({
		update: () => this.#updateColumns(),
		debounceDelay: 50,
	});
	#sort?: [index: number, reverse: boolean];
	constructor(_props?: TableProp) {
		super();
		this.attachShadow({}, this.#head, this.#body);
		this.#body.itemCreator = this.#create;
	}
	#create = (value: T): TableRow<T> => {
		const row = $new(TableRow<T>, { part: 'row' });
		row.table = this;
		row.columns = this.#columns;
		row.value = value;
		return row;
	};
	#updateView() {
		const BASE = ':host';
		// Cell
		const selector = (i: number) =>
			`${BASE}>.head>:nth-child(${i * 2 + 1}),${BASE}>.body>*>:nth-child(${i + 1})`;
		const size = (value?: number | string) => {
			if (value === undefined) return '100px';
			if (typeof value === 'number') return `${value}px`;
			return String(value);
		};
		const cells = this.#columns.map(
			(column, i) => `${selector(i)}{flex:0 0 auto;width:${size(column.width)}}`,
		);
		// Combined
		const style = [...cells].join('');
		this.updateStyles(style);
	}
	#updateColumns() {
		const old = new SetMap<TableColumn<T>, CellInHead>();
		for (const [col, cell] of this.#headCells) old.add(col, cell);
		const newCells = this.#columns.map<[TableColumn<T>, CellInHead]>(
			(column, index) => {
				const cell = old.getOne(column);
				if (cell) {
					old.delete(column, cell);
					if (index !== this.#sort?.[0]) {
						cell[0].removeAttribute('sort');
					}
					return [column, cell];
				}
				const content = (column.head ?? defaultHead)(column.key);
				const getIndex = (): number | null => {
					const index = [...this.#head.children].indexOf(div);
					if (index === -1) return null;
					return index / 2;
				};
				const div = $div(
					{},
					$div(
						{ part: 'cell', role: 'cell', attr: { nav: '' } },
						...asArray(content),
					),
					ico('ui.increasing', { className: 'order' }),
				);
				state.hover.add(div);
				state.active.on(div, (active, cancel) => {
					const index = getIndex();
					if (index === null) return;
					if (active || cancel) return;
					this.sort(index);
				});
				const resize = $div();
				new MovementController(
					{
						value: 0,
						penStartDelay: 75,
						touchStartDelay: 75,
					},
					{
						triggers: resize,
						handler: (event) => {
							if (!event.pointer) return;
							const index = getIndex();
							if (index === null) return;
							const { left, right } = $rect(div);
							const x = event.pointer.current[0];
							const size =
								getComputedStyle(this).direction === 'ltr' ? x - left : right - x;
							this.#columns[index].width = Math.max(8, size);
							this.#updateView();
						},
					},
				);
				return [column, [div, resize]];
			},
		);
		this.#headCells = newCells;
		this.#head.replaceChildren(...newCells.flatMap(([_, e]) => e));
		for (const row of this.#body.items) {
			row.update();
		}
		this.#updateView();
	}
	get default() {
		return this.#body.default;
	}
	set default(value) {
		this.#body.default = value;
	}
	get value() {
		return this.#body.value;
	}
	set value(value) {
		this.#body.value = value;
		if (!this.#sort) return;
		this.sort(...this.#sort);
	}
	get columns() {
		return this.#columns;
	}
	set columns(value) {
		this.#sort = undefined;
		this.#columns.splice(0, this.#columns.length, ...value);
	}
	get navChildren() {
		return [this.#head, this.#body];
	}
	/**
	 * 根据条件隐藏列表中的元素
	 * @param condition - 条件规则
	 * - `true`：隐藏全部
	 * - `false`,`null`,`undefined`：显示全部
	 * - `number[]`：显示指定索引的项
	 * - `((data: Data)=>boolean)`：显示返回值为 `true` 的项
	 */
	filter(condition: Parameters<typeof applyConditionalOperation<T>>[2]) {
		this.#body.filter(condition);
	}
	/** 排序 */
	sort(key: keyof T | number, reverse?: boolean) {
		if (typeof key !== 'number') {
			key = this.#columns.findIndex((col) => col.key === key);
		}
		if (key === -1) return;
		if (key >= this.#columns.length) return;
		if (reverse === undefined) {
			reverse = this.#sort?.[0] === key ? !this.#sort[1] : false;
		}
		if (this.#sort) {
			this.#headCells[this.#sort[0]][1][0].removeAttribute('sort');
		}
		this.#headCells[key][1][0].setAttribute('sort', reverse ? 'rev' : '');
		const colKey = this.#columns[key].key;
		const sort = this.#columns[key].sort ?? defaultSort;
		this.#body.value.sort((a, b) => sort(a[colKey], b[colKey]));
		if (reverse) this.#body.value.reverse();
		this.#sort = [key, reverse];
	}
	protected clone(from: this): void {
		this.columns = from.columns;
		super.clone(from);
	}
}
