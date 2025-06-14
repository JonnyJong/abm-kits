import {
	$new,
	AnimationFrameController,
	DOMContents,
	EventValue,
	Events,
	css,
	proxyObject,
} from 'abm-utils';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { configs } from '../../../configs';
import { events } from '../../../events';
import { Navigable } from '../../../navigate';
import { WidgetList, WidgetListItem } from '../list';
import CSS from './autofill.styl';
import {
	InputElement,
	WidgetInput,
	WidgetInputEventsInit,
	WidgetInputValue,
} from './base';

interface WidgetInputAutoFillItemValue<Value extends WidgetInputValue> {
	id: string;
	/**
	 * 应用该自动填充项目时：
	 * - 若 value 为空，则不修改输入框的值
	 * - 若 value 为非空，则将输入框的值修改为 value
	 */
	value: Value;
	/**
	 * 自动填充列表中显示的内容，若为空，则显示 value
	 */
	label?: DOMContents;
}

interface WidgetInputAutoFillItemLabel<Value extends WidgetInputValue> {
	id: string;
	/**
	 * 应用该自动填充项目时：
	 * - 若 value 为空，则不修改输入框的值
	 * - 若 value 为非空，则将输入框的值修改为 value
	 */
	value?: Value;
	/**
	 * 自动填充列表中显示的内容，若为空，则显示 value
	 */
	label: DOMContents;
}

type WidgetInputAutoFillItemObject<Value extends WidgetInputValue> =
	| WidgetInputAutoFillItemValue<Value>
	| WidgetInputAutoFillItemLabel<Value>;

export type IWidgetInputAutoFillItem<Value extends WidgetInputValue> =
	| Value
	| WidgetInputAutoFillItemObject<Value>;

//#region #Item
@customElement('w-input-autofill')
export class WidgetInputAutoFillItem<
		Value extends WidgetInputValue,
		Data extends
			IWidgetInputAutoFillItem<Value> = IWidgetInputAutoFillItem<Value>,
		_Obj extends
			WidgetInputAutoFillItemObject<Value> = WidgetInputAutoFillItemObject<Value>,
	>
	extends WidgetListItem<Data>
	implements Navigable
{
	static styles = css(CSS);
	@property({ attribute: false }) private accessor label: DOMContents | number =
		'';
	protected render() {
		return html`${this.label}`;
	}
	constructor() {
		super([], true);

		this.activeTrigger = this;
		events.hover.add(this);
	}
	#data: Data = '' as any;
	#update = () => {
		if (typeof this.#data !== 'object') {
			this.label = this.#data;
			return;
		}
		if ((this.#data as _Obj).label) {
			this.label = (this.#data as _Obj).label!;
		} else {
			this.label = (this.#data as _Obj).value!;
		}
	};
	get data() {
		return this.#data;
	}
	set data(value: Data) {
		if (typeof value !== 'object') this.#data = value;
		else {
			this.#data = proxyObject(
				{
					update: this.#update,
					debounceDelay: 50,
				},
				{
					id: value.id,
					value: value.value!,
					label: value.label!,
				},
			) as Data;
		}

		this.#update();
	}
	static create<
		Value extends WidgetInputValue,
		Data extends
			IWidgetInputAutoFillItem<Value> = IWidgetInputAutoFillItem<Value>,
	>(data: Data): WidgetInputAutoFillItem<Value, Data> {
		const item: WidgetInputAutoFillItem<Value, Data> = $new(
			'w-input-autofill' as any,
		);
		item.data = data;
		return item;
	}
	viewMinSize = 32;
}

//#region #List
export class InputAutoFill<
	Value extends WidgetInputValue,
	Item extends IWidgetInputAutoFillItem<Value> = IWidgetInputAutoFillItem<Value>,
	_Obj extends
		WidgetInputAutoFillItemObject<Value> = WidgetInputAutoFillItemObject<Value>,
> {
	#container: WidgetInput<Value> & {
		autoFill: IWidgetInputAutoFillItem<Value>[];
	};
	#input: InputElement;
	#events: Events<WidgetInputEventsInit<Value>>;
	constructor(
		container: WidgetInput<Value> & {
			autoFill: IWidgetInputAutoFillItem<Value>[];
		},
		input: InputElement,
		events: Events<WidgetInputEventsInit<Value>>,
	) {
		this.#container = container;
		this.#input = input;
		this.#events = events;

		this.#element.itemClass = WidgetInputAutoFillItem;

		this.#input.addEventListener('focus', this.#updateView);
		this.#input.addEventListener('blur', this.#updateView);
		this.#element.addEventListener('pointerdown', this.#pointerDownHandler);
		this.#element.on('active', this.#activeHandler);
		this.#resizeObserver.observe(this.#element);

		this.#element.navParent = this.#container;
	}
	//#region Contents
	#element: WidgetList<Item> & Navigable = $new<
		WidgetList<Item> & Navigable,
		{}
	>('w-list', {
		class: 'w-input-autofill',
	});
	get items() {
		return this.#element.items;
	}
	set items(value: Item[]) {
		this.#element.items = value;
	}
	get element() {
		return this.#element;
	}
	//#region View
	#elementSize = 0;
	#resizeObserver = new ResizeObserver(() => {
		if (!this.#element.parentNode) return;
		if (this.#element.items.length === 0) return;
		this.#elementSize = this.#element.clientHeight;
	});
	#hide() {
		this.#frameController.stop();

		this.#element.remove();
		this.#container.toggleAttribute('autofill', false);
	}
	#show() {
		this.#frameController.start();

		if (!this.#element.parentNode) document.body.append(this.#element);

		const { width, bottom, left, top } = this.#container.getBoundingClientRect();
		const { bottom: safeBottom } = configs.screen.safeRect;
		this.#element.style.left = `${left}px`;
		this.#element.style.width = `${width}px`;

		if (this.#elementSize <= safeBottom - bottom) {
			this.#element.style.top = `${bottom}px`;
			this.#element.style.bottom = '';
			this.#container.setAttribute('autofill', 'down');
			this.#element.classList.remove('w-input-autofill-up');
		} else {
			this.#element.style.top = '';
			this.#element.style.bottom = `${window.innerHeight - top}px`;
			this.#container.setAttribute('autofill', 'up');
			this.#element.classList.add('w-input-autofill-up');
		}
	}
	#updateView = () => {
		if (this.#element.items.length === 0) return this.#hide();
		if (!this.#container.focusing) return this.#hide();
		this.#show();
	};
	#frameController = new AnimationFrameController(this.#updateView);
	//#region Events
	#emit(input?: Value, id?: string) {
		this.#events.emit(
			new EventValue('autofill', { target: this.#container, value: id }),
		);
		if (input === undefined) return;
		this.#events.emit(
			new EventValue('input', { target: this.#container, value: input }),
		);
	}
	#pointerDownHandler = (e: PointerEvent) => {
		e.preventDefault();
	};
	#activeHandler = ({ value: index }: { value: number }) => {
		const item = this.#element.items[index];

		if (typeof item !== 'object') {
			this.#container.value = item as Value;
			this.#emit(item as Value);
			return;
		}

		const { id, value } = item;
		if (value) this.#container.value = value;
		this.#emit(value, id);
	};
}
