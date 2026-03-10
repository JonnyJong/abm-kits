import { defineElement, property } from '../infra/decorator';
import { register } from '../infra/registry';
import { css } from '../infra/style';
import { FormControl, type FormControlProps } from './form';

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-value': Value;
	}
}

declare module '../infra/registry' {
	interface Registry {
		value: Value;
	}
}

export interface ValueProps<T> extends FormControlProps<Value<T>> {}

/**
 * 值
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form/value)
 */
@register('value')
@defineElement('abm-value')
export class Value<T = any> extends FormControl<T, ValueProps<T>> {
	protected static style = css`:host{display:none}`;
	constructor(_props?: ValueProps<T>) {
		super();
		this.attachShadow();
	}
	@property()
	accessor default!: T;
	@property()
	accessor value!: T;
}
