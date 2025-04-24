import { $new, LocaleParams } from 'abm-utils';
import { customElement, property } from 'lit/decorators.js';
import { WidgetInput } from './base';
import { initInputNavigate } from './nav';

/** 多行文本输入框 */
@customElement('w-text-field')
export class WidgetTextField<
	Params extends LocaleParams = LocaleParams,
> extends WidgetInput<string, Params, HTMLTextAreaElement> {
	static properties = { value: { type: String } };
	constructor() {
		super($new('textarea'));

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
	cloneNode(deep?: boolean): WidgetTextField<Params> {
		const node = super.cloneNode(deep) as WidgetTextField<Params>;

		node.value = this.value;

		return node;
	}
}
