import { asArray, clamp, sleep } from 'abm-utils';
import { defineElement } from '../infra/decorator';
import type { ElementProps } from '../infra/dom';
import { $clone, $div, $new, $slot, type DOMContents } from '../infra/dom';
import { $on } from '../infra/event';
import { register } from '../infra/registry';
import { safeRect } from '../infra/screen';
import { $style, css } from '../infra/style';
import { LayoutController } from '../layout';
import { type Navigable, type NavState, navigate } from '../navigate/index';
import { PrefabListItem } from '../prefab/list';
import { state } from '../state';
import type { AriaConfig } from './base';
import { FormControl } from './form';
import { ico } from './icon';
import { List } from './list';

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-select': Select<any>;
	}
}

declare module '../infra/registry' {
	interface Registry {
		select: Select<any>;
	}
}

declare module './icon' {
	interface PresetIcons {
		/** 选择框展开 */
		selectExpand: string;
	}
}

export interface SelectOption<T> {
	value: T;
	label: DOMContents;
}

export interface SelectProp<T = any> extends ElementProps<Select<T>> {}

const itemCreator = PrefabListItem.creator<SelectOption<any>>({
	init(self) {
		self.tabIndex = -1;
		self.role = 'option';
	},
	render: (self) => self.replaceChildren(...asArray(self.value.label)),
	activeTrigger: true,
	activatable: true,
	hoverable: true,
	navigable: true,
});

/**
 * 计算起始元素索引
 * @param items 元素列表
 * @param index 当前元素索引
 * @param displayHeight 列表显示高度
 * @param selectTop 选择框顶部坐标
 */
function computeExpandOrigin<T extends HTMLElement>(
	items: T[],
	index: number,
	displayHeight: number,
	selectTop: number,
): T {
	if (index !== -1) return items[index];
	if (items.length < 3) return items[0];

	const maxOffset = Math.min(displayHeight / 2, selectTop);

	for (let i = 1; i < items.length; i++) {
		const item = items[i];
		if (item.offsetTop > maxOffset) return items[i - 1];
	}

	return items[Math.trunc(items.length / 2)];
}

/**
 * 选择框
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form/select)
 */
@register('select')
@defineElement('abm-select')
export class Select<T> extends FormControl<T | undefined, SelectProp<T>> {
	protected static hoverable = true;
	protected static navigable = true;
	protected static style = css`
		:host {
			display: inline-flex;
			align-items: center;
			gap: 8px;
			background: var(--ui-bg);
			border: 1px solid var(--ui-border);
			border-radius: var(--border-radius);
			padding: 5px 8px;
			transition: .1s;
			transition-property: background, border-color;
		}
		:host([hover]:not([disabled])) {
			background: var(--ui-bg-hover);
			border-color: var(--ui-border-hover);
		}
		:host([active]:not([disabled])) {
			background: var(--ui-bg-active);
			border-color: var(--ui-border-active);
		}
		:host([disabled]) {
			opacity: .75;
		}
		.placeholder { opacity: .6 }
		.content {
			flex: 1;
			display: flex;
			align-items: center;
		}
		.hidden, .content:not(.placeholder) { display: none }
		.hidden~.content { display: flex }
	`;
	protected static aria: AriaConfig = {
		role: 'combobox',
		hasPopup: 'listbox',
		expanded: false,
	};
	#placeholder = $div(
		{ class: 'placeholder content', part: 'placeholder content' },
		$slot(),
	);
	#content = $div({ class: 'content', part: 'content' });
	#list = $new(List<SelectOption<T>>);
	#backdrop = $div({ class: 'backdrop' });
	#picker = $div<Navigable>(
		{ class: 'surface-glass overlay abm-select' },
		this.#list,
	);
	#index = -1;
	constructor(_props?: SelectProp<T>) {
		super();
		this.attachShadow(
			{},
			this.#placeholder,
			this.#content,
			ico('ui.selectExpand'),
		);
		this.#picker.navCallback = this.#handleNav;
		this.#list.itemCreator = itemCreator;
		state.active.on(this, (active, cancel) => {
			if (this.disabled || this.options.length === 0 || active || cancel) return;
			this.#show();
		});
		this.#list.on('active', (_, index) => {
			if (this.#index === index) return this.#hide();
			this.#index = index;
			this.#updateView();
			this.#hide();
			this.emitUpdate(true);
		});
		$on(this.#backdrop, 'pointerdown', () => this.#hide());
	}
	#handleNav = (state: NavState) => {
		if (state.type !== 'back') return;
		this.#hide();
	};
	#layout = new LayoutController(this, ({ left, top }) => {
		const items = this.#list.items;
		const { vSize, vStart, vEnd } = safeRect;
		const listHeight = this.#list.scrollHeight;
		const displayHeight = Math.min(listHeight, vSize);
		const origin = computeExpandOrigin(items, this.#index, displayHeight, top);
		const originOffset = origin.offsetTop;
		const rawDisplayTop = top - originOffset;
		const displayTop = clamp(vStart, rawDisplayTop, vEnd - displayHeight);
		$style(this.#picker, {
			$left: left,
			$topDisplay: displayTop,
			$heightDisplay: displayHeight,
		});
	});
	async #show() {
		const items = this.#list.items;
		// Layout
		$style(this.#picker, { visibility: 'hidden' });
		document.body.append(this.#backdrop, this.#picker);
		$style(this.#picker, { $width: this.offsetWidth });
		await sleep(0);
		// Origin
		const { vSize, vStart, vEnd } = safeRect;
		const {
			left,
			top: selectTop,
			height: selectHeight,
		} = this.getBoundingClientRect();
		const listHeight = this.#list.scrollHeight;
		const displayHeight = Math.min(listHeight, vSize);
		const origin = computeExpandOrigin(
			items,
			this.#index,
			displayHeight,
			selectTop,
		);
		// Calc
		const originOffset = origin.offsetTop;
		const rawDisplayTop = selectTop - originOffset;
		const displayTop = clamp(vStart, rawDisplayTop, vEnd - displayHeight);
		const scroll = clamp(
			0,
			originOffset - displayHeight / 2,
			listHeight - displayHeight,
		);
		const offset = scroll - originOffset;
		// Style
		$style(this.#picker, {
			visibility: '',
			$left: left,
			// Begin
			$topSelect: selectTop,
			$heightSelect: selectHeight,
			$offset: offset,
			// End
			$topDisplay: displayTop,
			$heightDisplay: displayHeight,
		});
		this.#list.scroll({ top: scroll, behavior: 'instant' });
		// Display
		await sleep(10);
		this.#picker.classList.add('abm-select-show');
		navigate.addLayer(this.#picker, origin);
		this.#layout.start();
	}
	#hide() {
		this.#layout.stop();
		this.#backdrop.remove();
		navigate.rmLayer(this.#picker);
		const animation = this.#picker.animate({ opacity: 0 }, 100);
		animation.onfinish = () => {
			this.#picker.remove();
			this.#picker.classList.remove('abm-select-show');
		};
	}
	#updateView() {
		const selected = this.#index !== -1;
		this.#placeholder.classList.toggle('hidden', selected);
		const label = selected ? this.options[this.#index].label : [];
		this.#content.replaceChildren(...asArray($clone(label)));
	}
	/** 选项 */
	get options() {
		return this.#list.value;
	}
	set options(items) {
		const value = this.#list.value[this.#index];
		this.#list.value = items;
		this.#index = this.#list.value.findIndex((item) => item.value === value);
		this.#updateView();
	}
	accessor default: T | undefined;
	get value(): T | undefined {
		return this.options[this.#index]?.value;
	}
	set value(value) {
		if (value === undefined) {
			this.#index = -1;
		} else {
			const index = this.options.findIndex((item) => item.value === value);
			if (index === -1) return;
			this.#index = index;
		}
		this.#updateView();
	}
	/** 当前选项索引值 */
	get index() {
		return this.#index;
	}
	set index(value) {
		if (!Number.isFinite(value)) return;
		value = Math.trunc(value);
		if (value < -1) return;
		if (value >= this.options.length) return;
		this.#index = value;
		this.#updateView();
	}
	protected clone(from: this): void {
		this.options = from.options;
		super.clone(from);
	}
}
