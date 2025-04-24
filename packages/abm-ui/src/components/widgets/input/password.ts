import { LocaleParams } from 'abm-utils';
import { customElement, property } from 'lit/decorators.js';
import { WidgetText } from './text';

export interface WidgetPasswordProp {
	/** 密码可见性 */
	passwordVisible?: boolean;
}

/** 密码输入框 */
@customElement('w-password')
export class WidgetPassword<
	Params extends LocaleParams = LocaleParams,
> extends WidgetText<Params, WidgetPasswordProp> {
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
	cloneNode(deep?: boolean): WidgetPassword<Params> {
		const node = super.cloneNode(deep) as WidgetPassword<Params>;

		node.passwordVisible = this.passwordVisible;

		return node;
	}
}
