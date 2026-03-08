import 'reflect-metadata';
import { Component, filter } from '../component/base';
import type { ComponentConstructor, ElementConstructor } from './dom';
import { registerElementProps } from './internal';

/**
 * 自定义元素装饰器工厂函数
 * @description
 * 用于创建自定义元素的类装饰器，将类注册为自定义 HTML 元素
 * @param name 自定义元素的名称，必须包含连字符
 * @example 定义自定义元素
 * ```ts
 * @defineElement('my-button')
 * class MyButton extends HTMLElement {}
 * ```
 */
export function defineElement(
	name: string,
): (target: ElementConstructor, context?: ClassDecoratorContext) => void {
	return (target) => {
		customElements.define(name, target);
		registerElementProps(target);
		Component.define(target as ComponentConstructor);
	};
}

/** 元素属性初始化参数 */
export interface ComponentPropInit<T> {
	/** 覆盖默认属性名 */
	name?: string;
	/** 启用反射 */
	reflect?: boolean;
	/**
	 * 转换为值
	 * @default `String`
	 */
	toValue?:
		| ((string: string | null, current: T) => T)
		| StringConstructor
		| BooleanConstructor
		| NumberConstructor;
	/**
	 * 转换为字符串
	 * @default `String`
	 */
	toAttr?: (value: T) => string | null;
	/** 值过滤 */
	filter?: ((value: T, current: T) => T) | Set<any> | any[];
}

const SUPPORT_TYPE = new Set([String, Boolean, Number]);

/** 注册属性 */
export function property<T>(
	init: ComponentPropInit<T> = {},
): (
	target: ComponentConstructor['prototype'],
	key: string,
	descriptor?: TypedPropertyDescriptor<T>,
) => any {
	return (target, key, descriptor) => {
		if (descriptor && !(descriptor.set && descriptor.get)) {
			console.warn(
				`Cannot set property for member missing a 'getter' or 'setter'`,
				target,
				key,
			);
			return descriptor;
		}

		const proto: ComponentConstructor = target.constructor as any;
		Component.defineProperty(proto, key, init);

		if (!init.reflect) return descriptor;
		if (!init.toValue) {
			let type = Reflect.getMetadata('design:type', target, key);
			if (!SUPPORT_TYPE.has(type)) type = String;
			init.toValue = type;
		}

		type This = Component & { [privateKey]: T; [k: string]: T };
		if (descriptor) {
			const set = descriptor.set!;
			descriptor.set = function (this: This, value: T) {
				if (init.filter) {
					value = filter(init, value, this[key]);
				}
				set.call(this, value);
				this.updateProperty(key);
			};
			return descriptor;
		}
		const privateKey = Symbol(key);
		return {
			enumerable: true,
			configurable: true,
			get(this: This) {
				return this[privateKey];
			},
			set(this: This, value: T) {
				if (init.filter) {
					value = filter(init, value, this[privateKey]);
				}
				if (value === this[privateKey]) return;
				this[privateKey] = value;
				this.updateProperty(key);
			},
		} satisfies TypedPropertyDescriptor<T>;
	};
}
