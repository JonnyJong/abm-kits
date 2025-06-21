import { $new } from 'abm-utils';
import { TemplateResult, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Navigable } from '../../../navigate';
import { InputActions, WidgetInputActionItem } from './actions';
import { IWidgetInputAutoFillItem, InputAutoFill } from './autofill';
import { WidgetInput, WidgetInputProp } from './base';
import { initInputNavigate } from './nav';

export interface WidgetTextProp extends WidgetInputProp<string> {
	/** 自动填充 */
	autoFill?: IWidgetInputAutoFillItem<string>[];
	/** 左侧动作按钮 */
	actionsLeft?: WidgetInputActionItem[];
	/** 右侧动作按钮 */
	actionsRight?: WidgetInputActionItem[];
}

/** 单行文本输入框 */
@customElement('w-text')
export class WidgetText
	extends WidgetInput<string, HTMLInputElement>
	implements Navigable
{
	static properties = { value: { type: String } };
	constructor() {
		super($new('input'));

		this.input.addEventListener('input', () => this.emit('input', this.value));
		this.input.addEventListener('blur', () => this.emit('confirm', this.value));

		initInputNavigate.call(this, this.input, this.events, this.#autofill);
	}
	//#region Properties
	@property({ type: String })
	get value() {
		return this.input.value;
	}
	set value(value: string) {
		this.input.value = value;
		this.updatePlaceholder();
	}
	#autofill = new InputAutoFill(this, this.input, this.events);
	/** 自动填充 */
	get autoFill() {
		return this.#autofill.items;
	}
	set autoFill(value: IWidgetInputAutoFillItem<string>[]) {
		this.#autofill.items = value;
	}
	#actionsLeft: InputActions = new InputActions(this, this.events, 'left');
	#actionsRight: InputActions = new InputActions(this, this.events, 'right');
	/** 左侧动作按钮 */
	get actionsLeft() {
		return this.#actionsLeft.items;
	}
	set actionsLeft(value: WidgetInputActionItem[]) {
		this.#actionsLeft.items = value;
	}
	/** 右侧动作按钮 */
	get actionsRight() {
		return this.#actionsRight.items;
	}
	set actionsRight(value: WidgetInputActionItem[]) {
		this.#actionsRight.items = value;
	}
	//#region View
	protected render(): TemplateResult<1> {
		return html`
			${this.input}
			${this._placeholder}
			${this.#actionsLeft.element}
			${this.#actionsRight.element}
		`;
	}
	//#region Nav
	get navChildren() {
		return [
			this.#actionsLeft.element,
			this.#actionsRight.element,
			this.#autofill.element,
		];
	}
	cloneNode(deep?: boolean): WidgetText {
		const node = super.cloneNode(deep) as WidgetText;

		node.value = this.value;
		node.autoFill = this.autoFill;
		node.actionsLeft = this.actionsLeft;
		node.actionsRight = this.actionsRight;

		return node;
	}
}
