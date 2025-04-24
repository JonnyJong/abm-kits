import {
	$div,
	$new,
	Debounce,
	EventValue,
	Events,
	find,
	proxyArray,
	proxyObject,
} from 'abm-utils';
import { Navigable } from '../../../navigate';
import { UIContent, UIContentInit } from '../../content';
import { WidgetBtn } from '../btn';
import { WidgetInput, WidgetInputEventsInit, WidgetInputValue } from './base';

export interface WidgetInputActionItem {
	id: string;
	/** 按钮内容 */
	content: UIContent | string | UIContentInit;
	/** 开关型 */
	toggle?: boolean;
	/** 开关状态 */
	checked?: boolean;
	/** 禁用 */
	disabled?: boolean;
	/** 隐藏 */
	hidden?: boolean;
	/** 按钮长按激活时长 */
	delay?: number;
}

export class InputActions<Value extends WidgetInputValue = WidgetInputValue> {
	#input: WidgetInput<Value>;
	#events: Events<WidgetInputEventsInit<Value>>;
	#position: 'left' | 'right';
	#inputWidth = 0;
	#inputHeight = 0;
	constructor(
		input: WidgetInput<Value>,
		events: Events<WidgetInputEventsInit<Value>>,
		position: 'left' | 'right',
	) {
		this.#input = input;
		this.#events = events;
		this.#position = position;

		this.#element.classList.add(`actions-${position}`);

		this.#element.addEventListener('pointerdown', this.#pointerDownHandler);

		const observer = new ResizeObserver(this.#debounceUpdateView);
		observer.observe(this.#input);

		this.#element.navParent = this.#input;
	}
	//#region View
	#element: HTMLDivElement & Navigable = $div({ class: 'actions' });
	#updateView = () => {
		const prevElements = new Set(this.#element.children) as Set<WidgetBtn>;
		const newElements: WidgetBtn[] = [];

		for (const item of this.#items) {
			let element = find(
				prevElements,
				(element) => element.dataset.id === item.id,
			);
			if (element) prevElements.delete(element);
			else {
				element = $new('w-btn', {
					class: 'action',
					data: { id: item.id },
					prop: {
						flat: true,
					},
				});
				element.on('active', this.#activeHandler);
			}

			element.content = item.content;
			element.state = item.toggle ? 'toggle' : '';
			element.checked = !!item.checked;
			element.disabled = item.disabled || !!item.hidden;
			element.classList.toggle('action-hidden', !!item.hidden);
			element.delay = item.delay ?? 0;

			newElements.push(element);
		}

		this.#element.replaceChildren(...newElements);

		this.#inputWidth = this.#input.offsetWidth;
		this.#inputHeight = this.#input.offsetHeight;

		this.#updateSize();
	};
	async #updateSize() {
		if (this.#inputWidth === 0 && this.#inputHeight === 0) return;

		const size = [...this.#element.children].reduce((size, element, i) => {
			if (this.#items[i].hidden) return size;
			return size + element.getBoundingClientRect().width;
		}, 0);
		this.#input.style.setProperty(
			`--w-input-actions-${this.#position}`,
			`${size + 2}px`,
		);
	}
	#debounceUpdateView = Debounce.new(this.#updateView, 50);
	get element() {
		return this.#element;
	}
	//#region Contents
	#items = proxyArray<WidgetInputActionItem>({
		update: this.#debounceUpdateView,
		set: (value): WidgetInputActionItem => {
			return proxyObject(
				{ update: this.#debounceUpdateView },
				{
					id: value.id,
					content: value.content,
					toggle: value.toggle,
					checked: value.checked,
					disabled: value.disabled,
					hidden: value.hidden,
					delay: value.delay,
				},
			);
		},
	});
	get items() {
		return this.#items;
	}
	set items(value: WidgetInputActionItem[]) {
		this.#items.splice(0, this.#items.length, ...value);
	}
	//#region Events
	#pointerDownHandler = (event: PointerEvent) => {
		event.preventDefault();
	};
	#activeHandler = ({ target }: { target: WidgetBtn }) => {
		const { id } = target.dataset;
		if (!id) return;

		const index = [...target.parentNode!.children].indexOf(target);
		this.#items[index].checked = target.checked;

		this.#events.emit(
			new EventValue('action', { target: this.#input, value: id }),
		);
	};
}
