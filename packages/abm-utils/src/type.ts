import type { Constructor } from './object';

/** 基础类型构造函数 */
export type TypeConstructor =
	| BigIntConstructor
	| BooleanConstructor
	| FunctionConstructor
	| NumberConstructor
	| ObjectConstructor
	| StringConstructor
	| SymbolConstructor
	| undefined
	| null;

/** 基本类型字面量 */
export type Primitive = bigint | boolean | number | object | string | symbol;

/**
 * TypeGuard
 * @description
 * - 基础类型
 * - 字面量
 * - 原型
 */
export type AllowedType = TypeConstructor | Primitive | Constructor<any>;

const TYPE_CONSTRUCTOR_MAP: Record<
	| 'bigint'
	| 'boolean'
	| 'function'
	| 'number'
	| 'object'
	| 'string'
	| 'symbol'
	| 'undefined',
	TypeConstructor
> = {
	string: String,
	number: Number,
	bigint: BigInt,
	boolean: Boolean,
	symbol: Symbol,
	object: Object,
	function: Function,
	undefined,
};

/** 获取值的类型构造函数 */
function getTypeConstructor(value: unknown): TypeConstructor {
	if (value === null) return null;
	return TYPE_CONSTRUCTOR_MAP[typeof value];
}

/**
 * 验证值是否符合指定的类型约束
 * @param value 待验证的值
 * @param allowedTypes 允许的类型数组
 * @returns 是否通过验证
 *
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/utils/type.html#函数-verifytype)
 */
export function verifyType(
	value: unknown,
	allowedTypes: AllowedType[],
): boolean {
	if (allowedTypes.includes(value as any)) return true;
	if (value === Infinity) return false;
	if (value === -Infinity) return false;
	if (allowedTypes.includes(getTypeConstructor(value))) return true;
	let hasNaN = false;
	for (const type of allowedTypes) {
		if (Number.isNaN(type)) {
			hasNaN = true;
			continue;
		}
		if (typeof type !== 'function') continue;
		if (value instanceof type) return true;
	}
	if (hasNaN && Number.isNaN(value)) return true;
	return false;
}
