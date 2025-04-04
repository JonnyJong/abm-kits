import { Signal } from '@lit-labs/signals';
import { $div, $new, DOMContents, asArray, clamp, css, sleep } from 'abm-utils';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import CSS_ITEM from 'select-item.style';
import CSS from 'select.style';
import { configs } from '../../configs';
import { events, UIEventActive } from '../../events';
import { EventValue, EventValueInit } from '../../events/api/value';
import { EventsList } from '../../events/events';
import { LocaleOptions } from '../../locale';
import { Navigable, NavigateCallbackOptions, navigate } from '../../navigate';
import { UIContentText, UIContentTextInit } from '../content';
import { Widget } from './base';
import { WidgetList, WidgetListItem } from './list';

interface WidgetSelectEventsInit<
	Value = unknown,
	Options extends LocaleOptions = LocaleOptions,
	Data extends IWidgetSelectItem<Value> = IWidgetSelectItem<Value>,
> {
	/** 更改事件 */
	change: EventValueInit<WidgetSelect<Value, Options, Data>, Value>;
}

export type WidgetSelectEvents<
	Value = unknown,
	Options extends LocaleOptions = LocaleOptions,
	Data extends IWidgetSelectItem<Value> = IWidgetSelectItem<Value>,
> = EventsList<WidgetSelectEventsInit<Value, Options, Data>>;

export interface IWidgetSelectItem<Value = unknown> {
	value: Value;
	label: DOMContents;
}

export interface WidgetSelectProp<
	Value = unknown,
	Options extends LocaleOptions = LocaleOptions,
	Data extends IWidgetSelectItem<Value> = IWidgetSelectItem<Value>,
> {
	/** 选项索引 */
	index?: number;
	/** 选项值 */
	value?: Value;
	/** 选项列表 */
	options?: Data[];
	/** 占位符 */
	placeholder?: string | UIContentText<Options> | UIContentTextInit<Options>;
	/** 禁用 */
	disabled?: boolean;
}

//#region #Item
@customElement('w-select-item')
class WidgetSelectItem<
	Value = unknown,
	Data extends IWidgetSelectItem<Value> = IWidgetSelectItem<Value>,
> extends WidgetListItem<Data> {
	static styles = css(CSS_ITEM);
	#root = this.createRenderRoot();
	updateLabel!: (index: number) => any;
	constructor() {
		super(undefined, true);

		this.activeTrigger = this;
		events.hover.add(this);
	}
	value: Value = undefined as Value;
	get label() {
		return [...this.#root.childNodes].map((node) => {
			if (node instanceof Text) return node.textContent ?? '';
			return node as HTMLElement;
		});
	}
	set label(value: DOMContents) {
		this.#root.replaceChildren(...asArray(value));
		if (!this.parentNode) return;
		this.updateLabel([...(this.parentNode as ShadowRoot).children].indexOf(this));
	}
	get data(): Data {
		return this as unknown as Data;
	}
	set data(value: Data) {
		this.value = value.value;
		this.label = value.label;
	}
	static create<
		Value = unknown,
		Data extends IWidgetSelectItem<Value> = IWidgetSelectItem<Value>,
	>(data: Data): WidgetSelectItem<Value, Data> {
		const item = $new<WidgetSelectItem<Value, Data>>('w-select-item');
		item.data = data;
		return item;
	}
}

//#region #Select
/** 选择框 */
@customElement('w-select')
export class WidgetSelect<
	Value = unknown,
	Options extends LocaleOptions = LocaleOptions,
	Data extends IWidgetSelectItem<Value> = IWidgetSelectItem<Value>,
> extends Widget<
	WidgetSelectProp<Value, Data>,
	WidgetSelectEventsInit<Value, Options, Data>
> {
	static styles = css(CSS);
	constructor() {
		super(['change'], true);

		configs.icon.on('selectExpand', () => {
			this.#indicator.key = configs.icon.defaults.selectExpand;
		});

		events.hover.add(this);
		events.active.on(this, this.#activeHandler);
		events.active.on(this.#filter, this.#hidePicker);
		this.#list.on('active', this.#listActiveHandler);
		this.#list.navCallback = this.#navCallback;
	}
	#selected = new Signal.State(-1);
	//#region Picker
	#filter = $div({ class: 'ui-preset-fullscreen' });
	#list = $new<WidgetList<Data> & Navigable>('w-list', {
		class: 'w-select-list',
		prop: {
			itemClass: WidgetSelectItem,
			initItem: (item) => {
				(item as any).updateLabel = this.#updateLabel;
			},
		},
	});
	#picker = $div({ class: 'w-select-picker' }, this.#list);
	#getExpandTarget(
		elements: readonly WidgetListItem<any>[],
		top: number,
		listHeight: number,
		bottomSize: number,
	) {
		let target = this.#selected.get();
		if (target !== -1) return target;
		target = Math.floor((elements.length - 1) / 2);
		const middleTop = elements[target].viewTop;

		if (middleTop > top) {
			for (const element of elements.slice(0, target).reverse()) {
				target--;
				if (element.viewTop <= top) break;
			}
			return target;
		}

		if (listHeight - middleTop <= bottomSize) return target;

		for (const element of elements.slice(target + 1)) {
			if (element.viewTop > top) break;
			target++;
			if (listHeight - element.viewBottom <= bottomSize) break;
		}
		return target;
	}
	async #showPicker() {
		const elements = this.#list.elements;
		// Check
		if (elements.length === 0) return;
		// Layout
		document.body.append(this.#filter, this.#picker);
		await sleep(0);
		const { left, top, width, bottom } = this.getBoundingClientRect();
		const { top: safeTop, bottom: safeBottom } = configs.screen.safeRect;
		// Get target
		const listHeight = elements.at(-1)!.viewBottom;
		const target = this.#getExpandTarget(
			elements,
			top,
			listHeight,
			safeBottom - bottom,
		);
		// Calc
		const height = Math.min(listHeight, safeBottom - safeTop);
		const itemInList = elements[target].viewTop;
		const scroll = clamp(0, itemInList - top, listHeight - height);
		const itemDiff = scroll - itemInList;
		const listTop = clamp(safeTop, top + itemDiff, safeBottom - height);
		// Style
		this.#list.style.minWidth = `${width}px`;
		for (const [k, v] of [
			['left', left],
			['item-diff', itemDiff],
			['top-begin', top],
			['top-end', listTop],
			['height', height],
		]) {
			this.#picker.style.setProperty(`--w-select-${k}`, `${v}px`);
		}
		this.#list.scroll({ top: scroll, behavior: 'instant' });
		// Display
		await sleep(10);
		this.#picker.classList.add('w-select-picker-show');
		navigate.addLayer(this.#list, elements[target]);
	}
	#hidePicker = async () => {
		navigate.rmLayer(this.#list);
		this.#picker.style.opacity = '0';
		await sleep(100);
		this.#filter.remove();
		this.#picker.remove();
		this.#picker.style.opacity = '';
		this.#picker.classList.remove('w-select-picker-show');
	};
	//#region View
	#content = new Signal.State<(string | Node)[]>([]);
	#placeholder = new UIContentText<Options>();
	#indicator = $new('w-icon', {
		class: 'indicator',
		prop: { key: configs.icon.defaults.selectExpand },
	});
	protected render() {
		const selected = this.#selected.get();
		return html`
			<div class=${classMap({
				content: true,
				hidden: selected === -1,
			})}>${this.#content.get()}</div>
			<div class=${classMap({
				placeholder: true,
				hidden: selected !== -1,
			})}>
				${this.#placeholder.iconSignal.get()}
				${this.#placeholder.labelSignal.get()}
			</div>
			${this.#indicator}
		`;
	}
	#updateLabel = (index: number) => {
		if (index !== this.#selected.get()) return;
		this.#setLabel();
	};
	#setLabel() {
		const index = this.#selected.get();
		if (index === -1) {
			this.#content.set([]);
			return;
		}
		this.#content.set(
			(this.#list.items[index].label as (string | Node)[]).map((node) => {
				if (typeof node === 'string') return node;
				return node.cloneNode(true);
			}),
		);
	}
	//#region Properties
	/** 禁用 */
	@property({ type: Boolean, reflect: true }) accessor disabled = false;
	/** 占位符 */
	@property()
	get placeholder() {
		return this.#placeholder;
	}
	set placeholder(value:
		| string
		| UIContentTextInit<Options>
		| UIContentText<Options>) {
		if (typeof value === 'string') this.#placeholder.key = value;
		else this.#placeholder.reset(value);
	}
	/** 选项列表 */
	get options() {
		return this.#list.items;
	}
	set options(options: Data[]) {
		const value = this.value;
		this.#list.items = options;
		this.value = value;
	}
	/** 选项值 */
	get value(): Value | undefined {
		return this.#list.items[this.#selected.get()]?.value;
	}
	set value(value: Value | undefined) {
		this.#selected.set(
			this.#list.items.findIndex((item) => item.value === value),
		);
		this.#setLabel();
	}
	/** 选项索引 */
	get index() {
		return this.#selected.get();
	}
	set index(value: number) {
		value = Math.floor(value);
		if (!Number.isFinite(value) || value >= this.#list.items.length) value = -1;
		this.#selected.set(value);
		this.#setLabel();
	}
	//#region Events
	#activeHandler(event: UIEventActive) {
		if (event.cancel || event.active) return;
		this.#showPicker();
	}
	#listActiveHandler = ({ value }: { value: number }) => {
		this.#hidePicker();
		if (value === this.#selected.get()) return;
		this.#selected.set(value);
		this.#setLabel();
		this.events.emit(
			new EventValue('change', { target: this, value: this.value! }),
		);
	};
	#navCallback = ({ cancel }: NavigateCallbackOptions) => {
		if (cancel) this.#hidePicker();
	};
	cloneNode(deep?: boolean): WidgetSelect<Value, Options> {
		const node = super.cloneNode(deep) as WidgetSelect<Value, Options>;

		node.disabled = this.disabled;
		node.options = this.options;
		node.index = this.index;
		node.placeholder = this.placeholder;

		return node;
	}
}

// TODO: 输入名称、拼音等快速选择
