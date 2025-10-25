import {
	$div,
	$new,
	css,
	type EventsList,
	EventValue,
	type EventValueInit,
} from 'abm-utils';
import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { events } from '../../../events';
import { keyboard } from '../../../keyboard';
import {
	type Navigable,
	type NavigateCallbackOptions,
	navigate,
} from '../../../navigate';
import { Widget } from '../base';
import type { IWidgetInputAutoFillItem } from './autofill';
import CSS from './index.styl';

export type WidgetInputValue = string | number;

export type InputElement = HTMLInputElement | HTMLTextAreaElement;

export interface WidgetInputProp<
	Value extends WidgetInputValue = WidgetInputValue,
> {
	/** 输入框内容 */
	value?: Value;
	/** 占位符 */
	placeholder?: string;
	/** 未通过验证 */
	invalid?: boolean;
	/** 禁用 */
	disabled?: boolean;
	/** 只读 */
	readOnly?: boolean;
	/** 自动尺寸 */
	autoSize?: boolean;
	/** 扁平 */
	flat?: boolean;
}

export interface WidgetInputEventsInit<
	Value extends WidgetInputValue = WidgetInputValue,
	Target extends WidgetInput<Value> = WidgetInput<Value>,
> {
	/** 输入事件 */
	input: EventValueInit<Target, Value>;
	/** 确认事件 */
	confirm: EventValueInit<Target, Value>;
	/** 自动填充事件 */
	autofill: EventValueInit<
		Target & { autoFill: IWidgetInputAutoFillItem<Value>[] },
		string | undefined
	>;
	/** 动作触发事件 */
	action: EventValueInit<Target, string>;
}

export interface WidgetInputEvents<
	Value extends WidgetInputValue = WidgetInputValue,
	Target extends WidgetInput<Value> = WidgetInput<Value>,
> extends EventsList<WidgetInputEventsInit<Value, Target>> {}

/** 输入框基类 */
export abstract class WidgetInput<
		Value extends WidgetInputValue = WidgetInputValue,
		Input extends InputElement = InputElement,
	>
	extends Widget<WidgetInputEventsInit<Value>>
	implements Navigable
{
	static styles = css(CSS);
	protected input: Input;
	protected _placeholder: HTMLElement = $div(
		{ class: 'placeholder' },
		$new('slot'),
	);
	constructor(input: Input) {
		super({
			eventTypes: ['input', 'confirm', 'autofill', 'action'],
			nav: true,
		});
		this.input = input;

		events.hover.add(this);
		events.active.on(this, ({ active, cancel }) => {
			if (active || cancel) return;
			this.input.focus();
		});
		input.addEventListener('input', this.updatePlaceholder);
		input.addEventListener('focus', this.#focusHandler);
		input.addEventListener('blur', this.#blurHandler);
	}
	protected render() {
		return html`
			${this.input}
			${this._placeholder}
		`;
	}
	protected updatePlaceholder = () => {
		this._placeholder.classList.toggle('placeholder-hidden', !!this.input.value);
	};
	protected emit<Type extends 'input' | 'confirm'>(type: Type, value: Value) {
		this.events.emit(new EventValue(type, { target: this, value }));
	}
	//#region Properties
	/** 输入框内容 */
	abstract accessor value: Value;
	/** 占位符 */
	@property({ type: String })
	get placeholder() {
		return this.textContent ?? '';
	}
	set placeholder(value: string) {
		this.textContent = value;
	}
	/** 未通过验证 */
	@property({ type: Boolean, reflect: true }) accessor invalid = false;
	/** 禁用 */
	@property({ type: Boolean, reflect: true })
	get disabled() {
		return this.input.disabled;
	}
	set disabled(value: boolean) {
		this.input.disabled = value;
	}
	/** 只读 */
	@property({ type: Boolean, reflect: true, attribute: 'readonly' })
	get readOnly() {
		return this.input.readOnly;
	}
	set readOnly(value: boolean) {
		this.input.readOnly = value;
	}
	/** 自动尺寸 */
	@property({ type: Boolean, reflect: true, attribute: 'autosize' })
	accessor autoSize = false;
	/** 扁平 */
	@property({ type: Boolean, reflect: true }) accessor flat = false;
	#focusing = false;
	get focusing() {
		return this.#focusing;
	}
	//#region Nav
	navCallback({ active, cancel }: NavigateCallbackOptions) {
		if (cancel) this.input.blur();
		if (active !== false) return;
		this.input.focus();
	}
	#focusHandler = () => {
		this.#focusing = true;
		navigate.blockKeyboard = true;
		keyboard.preventDefaultWebBehavior = false;
		window.addEventListener('keydown', this.#keyDownHandler);
	};
	#blurHandler = () => {
		this.#focusing = false;
		navigate.blockKeyboard = false;
		keyboard.preventDefaultWebBehavior = true;
		window.removeEventListener('keydown', this.#keyDownHandler);
	};
	#keyDownHandler = (event: KeyboardEvent) => {
		if (event.code === 'Tab') event.preventDefault();
	};
	//#region Others
	cloneNode(deep?: boolean): Node {
		const node = super.cloneNode(deep) as WidgetInput<Value, Input>;

		node.invalid = this.invalid;
		node.disabled = this.disabled;
		node.readOnly = this.readOnly;
		node.autoSize = this.autoSize;

		return node;
	}
	get contextMenuBehavior() {
		return true;
	}
}
