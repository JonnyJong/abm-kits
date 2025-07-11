import { customElement, property } from 'lit/decorators.js';
import { WidgetText, WidgetTextProp } from './text';

export interface WidgetPasswordProp extends WidgetTextProp {
	/** 密码可见性 */
	passwordVisible?: boolean;
}

/** 密码输入框 */
@customElement('w-password')
export class WidgetPassword extends WidgetText {
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
	cloneNode(deep?: boolean): WidgetPassword {
		const node = super.cloneNode(deep) as WidgetPassword;

		node.passwordVisible = this.passwordVisible;

		return node;
	}
}
