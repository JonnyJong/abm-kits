import { customElement, property } from 'lit/decorators.js';
import { LocaleOptions } from '../../../locale';
import { WidgetText } from './text';

export interface WidgetPasswordProp {
	/** 密码可见性 */
	passwordVisible?: boolean;
}

/** 密码输入框 */
@customElement('w-password')
export class WidgetPassword<
	Options extends LocaleOptions = LocaleOptions,
> extends WidgetText<Options, WidgetPasswordProp> {
	constructor() {
		super();
		this.input.type = 'password';
	}
	/** 密码可见性 */
	@property({ type: Boolean })
	get passwordVisible() {
		return this.input.type !== 'password';
	}
	set passwordVisible(value: boolean) {
		this.input.type = value ? 'text' : 'password';
	}
	cloneNode(deep?: boolean): WidgetPassword<Options> {
		const node = super.cloneNode(deep) as WidgetPassword<Options>;

		node.passwordVisible = this.passwordVisible;

		return node;
	}
}
