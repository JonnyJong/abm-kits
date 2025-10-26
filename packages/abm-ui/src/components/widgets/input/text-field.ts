import { $new } from 'abm-utils';
import { customElement, property } from 'lit/decorators.js';
import { WidgetInput, type WidgetInputProp } from './base';
import { initInputNavigate } from './nav';

export interface WidgetTextFieldProp extends WidgetInputProp<string> {}

/** 多行文本输入框 */
@customElement('w-text-field')
export class WidgetTextField extends WidgetInput<string, HTMLTextAreaElement> {
	static properties = { value: { type: String } };
	constructor() {
		super($new({ tag: 'textarea' }));

		this.input.addEventListener('input', () => this.emit('input', this.value));
		this.input.addEventListener('blur', () => this.emit('confirm', this.value));

		initInputNavigate.call(this, this.input, this.events);
	}
	// TODO: 添加 Tab 缩进功能
	//#region Properties
	@property({ type: String })
	get value() {
		return this.input.value;
	}
	set value(value: string) {
		this.input.value = value;
		this.updatePlaceholder();
	}
	cloneNode(deep?: boolean): WidgetTextField {
		const node = super.cloneNode(deep) as WidgetTextField;

		node.value = this.value;

		return node;
	}
}
