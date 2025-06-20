import { Signal } from '@lit-labs/signals';
import {
	$div,
	EventValue,
	EventValueInit,
	EventsList,
	SyncList,
	css,
} from 'abm-utils';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { events } from '../../../events';
import { Navigable } from '../../../navigate';
import { UIContentAll, UIContentAllInit } from '../../content';
import { Widget } from '../base';
import CSS from './index.styl';

interface WidgetNavEventsInit<ID extends string = string> {
	/** 更改事件 */
	change: EventValueInit<WidgetNav<ID>, ID>;
}

export interface WidgetNavEvents<ID extends string = string>
	extends EventsList<WidgetNavEventsInit<ID>> {}

export type WidgetNavItemType = 'flex' | 'item';

export interface WidgetNavFlex<ID extends string = string> {
	/**
	 * 类型
	 * @description
	 * - `item`：普通项
	 * - `flex`：伸缩盒
	 */
	type: 'flex';
	id?: ID;
	/** 内容 */
	content?: string | UIContentAllInit | UIContentAll;
	/** 禁用 */
	disabled?: boolean;
}

export interface WidgetNavItem<ID extends string = string> {
	/**
	 * 类型
	 * @description
	 * - `item`：普通项
	 * - `flex`：伸缩盒
	 */
	type?: 'item';
	id: ID;
	/** 内容 */
	content: string | UIContentAllInit | UIContentAll;
	/** 禁用 */
	disabled?: boolean;
}

export type WidgetNavItems<ID extends string = string> =
	| WidgetNavFlex<ID>
	| WidgetNavItem<ID>;

export type WidgetNavDisplay = 'all' | 'icon' | 'text';

export interface WidgetNavProp<ID extends string = string> {
	/** 元素列表 */
	items?: WidgetNavItems<ID>[];
	/** 当前 ID */
	value?: ID;
	/** 禁用 */
	disabled?: boolean;
	/** 垂直 */
	vertical?: boolean;
	/**
	 * 显示样式
	 * @description
	 * - `all`：显示图标和文本
	 * - `icon`：只显示图标
	 * - `text`：只显示文本
	 */
	display?: WidgetNavDisplay;
	/** 垂直显示 */
	verticalDisplay?: boolean;
}

const DISPLAYS: WidgetNavDisplay[] = ['all', 'icon', 'text'];

//#region Item
class NavItem<ID extends string = string> {
	#type: WidgetNavItemType = 'item';
	id: ID = '' as any;
	#content: UIContentAll = new UIContentAll();
	#element: HTMLDivElement & Navigable = $div({ class: 'item' });
	#active: (item: NavItem<ID>) => any;
	constructor(
		data: WidgetNavItems<ID>,
		active: (item: NavItem<ID>) => any,
		root: WidgetNav<ID>,
	) {
		this.#active = active;

		this.reset(data);

		this.#content.on('icon', this.#updateContent);
		this.#content.on('label', this.#updateContent);

		this.#element.navParent = root;

		events.hover.add(this.#element);
		events.active.on(this.#element, (event) => {
			if (this.disabled) return;
			if (this.type !== 'item') return;
			if (event.cancel || event.active) return;
			this.#active(this);
		});
		this.#updateContent();
	}
	get type() {
		return this.#type;
	}
	set type(value: WidgetNavItemType) {
		if (value !== 'flex') value = 'item';
		this.#type = value;
		this.#element.classList.remove('flex', 'item');
		this.#element.classList.add(value);
		this.#element.toggleAttribute('ui-nav', value === 'item');
	}
	get content() {
		return this.#content;
	}
	set content(value: string | UIContentAllInit | UIContentAll) {
		if (typeof value === 'string') {
			this.#content.key = value;
			return;
		}
		this.#content.reset(value);
	}
	get disabled() {
		return this.#element.hasAttribute('disabled');
	}
	set disabled(value: boolean) {
		this.#element.toggleAttribute('disabled', value);
		this.#element.nonNavigable = !!value;
	}
	reset(data: WidgetNavItems<ID>) {
		this.type = data.type!;
		if (typeof data.id === 'string') this.id = data.id;
		if (data.content) this.content = data.content;
		this.disabled = !!data.disabled;
	}
	#updateContent = () => {
		this.#element.replaceChildren(
			this.#content.iconElement,
			this.#content.labelElement,
		);
	};
	get element() {
		return this.#element;
	}
}

//#region Nav
/** 导航 */
@customElement('w-nav')
export class WidgetNav<ID extends string = string>
	extends Widget<WidgetNavEventsInit<ID>>
	implements Navigable
{
	static styles = css(CSS);
	constructor() {
		super({
			eventTypes: ['change'],
			navGroup: true,
		});

		this.#resizeObserver.observe(this);
	}
	protected render() {
		return html`
			${this.navChildren}
			<div class="indicator" style=${styleMap({
				'--size': `${this.#size.get()}px`,
				'--offset': `${this.#offset.get()}px`,
			})}></div>
		`;
	}
	#selected = -1;
	#items = new SyncList<WidgetNavItems<ID>, NavItem<ID>>({
		getData: (i) => i,
		setData: (i, data) => i.reset(data),
		create: (data) => new NavItem(data, this.#activeHandler, this),
		update: () => this.requestUpdate(),
		updateDelay: 50,
		creatable: true,
	});
	#size = new Signal.State(0);
	#offset = new Signal.State(0);
	#updateIndicator = () => {
		let target: NavItem<ID> | null = this.#items.instances[this.#selected];
		if (target?.type === 'flex') target = null;
		this.#size.set(
			target?.element[this.vertical ? 'offsetHeight' : 'offsetWidth'] ?? 0,
		);
		this.#offset.set(
			target?.element[this.vertical ? 'offsetTop' : 'offsetLeft'] ?? 0,
		);
	};
	#resizeObserver = new ResizeObserver(this.#updateIndicator);
	//#region Properties
	/** 元素列表 */
	get items() {
		return this.#items.items;
	}
	set items(items: WidgetNavItems<ID>[]) {
		const value = this.value;
		this.#items.replace(...items);
		this.value = value;
	}
	/** 当前 ID */
	get value() {
		return this.#items.items[this.#selected]?.id;
	}
	set value(value: ID | undefined) {
		this.#selected = this.#items.instances.findIndex((i) => i.id === value);
		this.#updateIndicator();
	}
	/** 禁用 */
	@property({ type: Boolean, reflect: true }) accessor disabled = false;
	/** 垂直 */
	@property({ type: Boolean, reflect: true }) accessor vertical = false;
	/**
	 * 显示样式
	 * @description
	 * - `all`：显示图标和文本
	 * - `icon`：只显示图标
	 * - `text`：只显示文本
	 */
	get display() {
		const value = this.getAttribute('display') as any;
		if (DISPLAYS.includes(value as any)) return value;
		return 'all';
	}
	set display(value: WidgetNavDisplay) {
		if (!DISPLAYS.includes(value)) value = 'all';
		this.setAttribute('display', value);
	}
	/** 垂直显示 */
	@property({ type: Boolean, reflect: true, attribute: 'vertical-display' })
	accessor verticalDisplay = false;
	//#region Events
	#activeHandler = (item: NavItem<ID>) => {
		if (this.disabled) return;
		const index = this.#items.instances.indexOf(item);
		if (index === this.#selected) return;
		this.#selected = index;
		this.#updateIndicator();
		this.events.emit(new EventValue('change', { target: this, value: item.id }));
	};
	//#region Other
	get navChildren() {
		return this.#items.instances.map((i) => i.element);
	}
	get nonNavigable() {
		return this.disabled;
	}
	cloneNode(deep?: boolean): WidgetNav<ID> {
		const node = super.cloneNode(deep) as WidgetNav<ID>;

		node.items = this.items;
		node.value = this.value;
		node.vertical = this.vertical;
		node.display = this.display;
		node.disabled = this.disabled;

		return node;
	}
}
