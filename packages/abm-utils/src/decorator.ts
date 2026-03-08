import type { Constructor } from './object';
import { type AllowedType, verifyType } from './type';

/**
 * 类型检查装饰器工厂
 * @description
 * 可用于类属性，在设置值时进行类型检查。
 * - 对访问器属性：仅对 setter 生效，getter 不受影响
 * - 对字段属性：自动转换为带 getter/setter 的访问器属性
 * - 类型检查失败时，设置操作会被忽略
 * @param allowedTypes 允许的类型
 */
export function typeCheck(
	...allowedTypes: AllowedType[]
): (
	target: Constructor<any>['prototype'],
	name: string,
	descriptor?: TypedPropertyDescriptor<any>,
) => any {
	return (target, key, descriptor) => {
		if (descriptor) {
			if (!descriptor.set) {
				console.warn(
					'The @typeCheck decorator is not working because there is no setter',
					target,
					key,
				);
				return descriptor;
			}
			const set = descriptor.set!;
			descriptor.set = function (value) {
				if (!verifyType(value, allowedTypes)) return;
				set.call(this, value);
			};
			return descriptor;
		}
		const privateKey = Symbol(key);
		return {
			enumerable: true,
			configurable: true,
			get(this: { [privateKey]: unknown }) {
				return this[privateKey];
			},
			set(this: { [privateKey]: unknown }, value: unknown) {
				if (!verifyType(value, allowedTypes)) return;
				this[privateKey] = value;
			},
		} satisfies TypedPropertyDescriptor<any>;
	};
}

export function toType<T>(
	type: (input: unknown) => T,
): (
	target: Constructor<any>['prototype'],
	name: string,
	descriptor?: TypedPropertyDescriptor<T>,
) => any {
	return (target, key, descriptor) => {
		if (descriptor) {
			if (!descriptor.set) {
				console.warn(
					'The @toType decorator is not working because there is no setter',
					target,
					key,
				);
				return descriptor;
			}
			const set = descriptor.set;
			descriptor.set = function (value) {
				set.call(this, type(value));
			};
			return descriptor;
		}
		const privateKey = Symbol(key);
		return {
			enumerable: true,
			configurable: true,
			get(this: { [privateKey]: T }) {
				return this[privateKey];
			},
			set(this: { [privateKey]: T }, value: unknown) {
				this[privateKey] = type(value);
			},
		} satisfies TypedPropertyDescriptor<T>;
	};
}
