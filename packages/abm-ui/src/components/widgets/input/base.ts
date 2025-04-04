import { $new, css } from 'abm-utils';
import CSS from 'input.style';
import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { events } from '../../../events';
import { EventValue, EventValueInit } from '../../../events/api/value';
import { EventsList } from '../../../events/events';
import { keyboard } from '../../../keyboard';
import { LocaleOptions } from '../../../locale';
import {
	Navigable,
	NavigateCallbackOptions,
	navigate,
} from '../../../navigate';
import { Widget } from '../base';
import { WidgetLang } from '../lang';
import { IWidgetInputAutoFillItem } from './autofill';

export type WidgetInputValue = string | number;

export type InputElement = HTMLInputElement | HTMLTextAreaElement;

export interface WidgetInputProp<
	Value extends WidgetInputValue = WidgetInputValue,
	Options extends LocaleOptions = LocaleOptions,
> {
	/** 输入框内容 */
	value?: Value;
	/** 占位符本地化键名 */
	placeholder?: string;
	/** 占位符本地化命名空间 */
	placeholderNamespace?: string;
	/** 占位符本地化参数 */
	placeholderOptions?: Options;
	/** 未通过验证 */
	invalid?: boolean;
	/** 禁用 */
	disabled?: boolean;
	/** 只读 */
	readOnly?: boolean;
	/** 自动尺寸 */
	autoSize?: boolean;
}

interface WidgetInputEventsInit<
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

export type WidgetInputEvents<
	Value extends WidgetInputValue = WidgetInputValue,
	Target extends WidgetInput<Value> = WidgetInput<Value>,
> = EventsList<WidgetInputEventsInit<Value, Target>>;

/** 输入框基类 */
export abstract class WidgetInput<
		Value extends WidgetInputValue = WidgetInputValue,
		Options extends LocaleOptions = LocaleOptions,
		Input extends InputElement = InputElement,
		Prop extends Record<string, any> = {},
	>
	extends Widget<
		WidgetInputProp<Value, Options> & Prop,
		WidgetInputEventsInit<Value>
	>
	implements Navigable
{
	static styles = css(CSS);
	protected input: Input;
	protected _placeholder = $new<WidgetLang<Options>>('w-lang', {
		class: 'placeholder',
	});
	constructor(input: Input) {
		super(['input', 'confirm', 'autofill', 'action'], true);
		this.input = input;

		events.hover.add(this);
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
	/** 占位符本地化键名 */
	@property({ type: String })
	get placeholder() {
		return this._placeholder.key;
	}
	set placeholder(value: string) {
		this._placeholder.key = value;
	}
	/** 占位符本地化命名空间 */
	@property({ type: String, attribute: 'placeholder-namespace' })
	get placeholderNamespace() {
		return this._placeholder.namespace;
	}
	set placeholderNamespace(value: string) {
		this._placeholder.namespace = value;
	}
	/** 占位符本地化参数 */
	get placeholderOptions() {
		return this._placeholder.options;
	}
	set placeholderOptions(value: Options | undefined) {
		this._placeholder.options = value;
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
		const node = super.cloneNode(deep) as WidgetInput<
			Value,
			Options,
			Input,
			Prop
		>;

		node.placeholderOptions = this.placeholderOptions;
		node.placeholderNamespace = this.placeholderNamespace;
		node.placeholder = this.placeholder;
		node.invalid = this.invalid;
		node.disabled = this.disabled;
		node.readOnly = this.readOnly;
		node.autoSize = this.autoSize;

		return node;
	}
}
