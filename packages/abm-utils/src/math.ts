import { type Vec2, Vector2 } from './vector';

/**
 * 限制目标值在最小值和最大值之间
 *
 * @param min 最小值
 * @param target 目标值
 * @param max 最大值
 * @returns 限制后的值
 */
export function clamp(min: number, target: number, max: number) {
	if (min > max) [min, max] = [max, min];
	return Math.max(min, Math.min(target, max));
}

/**
 * 将一个数值循环限制在指定范围内
 *
 * @param target 需要限制的数值
 * @param max 最大值
 * @param min 最小值，默认为0
 * @returns 限制在范围内的数值
 *
 * @example
 * ```ts
 * wrapInRange(4, 5) // 4
 * wrapInRange(5, 5) // 5
 * wrapInRange(5.5, 5) // 0.5
 * wrapInRange(4, 5, 1) // 4
 * wrapInRange(5, 5, 1) // 5
 * wrapInRange(5.5, 5, 1) // 1.5
 * ```
 */
export function wrapInRange(target: number, max: number, min = 0): number {
	const range = max - min;
	const wrappedValue = ((((target - min) % range) + range) % range) + min;
	return wrappedValue;
}

const TRAILING_ZERO = /0+$/;
const TRAILING_DOT = /\.$/;

/**
 * 根据步长将数值格式化为字符串
 * @param value - 需要格式化的值
 * @param step - 步长
 */
export function formatWithStep(value: number, step: number): string {
	return value
		.toFixed(step.toString().split('.')[1]?.length ?? 2)
		.replace(TRAILING_ZERO, '')
		.replace(TRAILING_DOT, '');
}

export type CSSFourValue = [
	top: number,
	right: number,
	bottom: number,
	left: number,
];
/**
 * 将数字或数组按照 CSS 中四值的方式处理
 * @description
 * - a, [a]：[a, a, a, a]
 * - [a, b]：[a, b, a, b]
 * - [a, b, c]：[a, b, c, b]
 * - [a, b, c, d]：[a, b, c, d]
 */
export function normalizeCSSFourValue(
	value: number | number[] | CSSFourValue,
): CSSFourValue | null {
	if (typeof value === 'number') return [value, value, value, value];
	if (!Array.isArray(value)) return null;
	if (value.length === 0) return null;
	const [a, b, c, d] = value;
	if (value.length === 1) return [a, a, a, a];
	if (value.length === 2) return [a, b, a, b];
	if (value.length === 3) return [a, b, c, b];
	return [a, b, c, d];
}

/**
 * 线性映射
 * @description
 * 将输入值从 [x1, x2] 映射到 [y1, y2]
 */
export function createLinearMapper(
	x1: number,
	x2: number,
	y1 = 0,
	y2 = 1,
): (value: number) => number {
	return (value: number) => ((value - x1) / (x2 - x1)) * (y2 - y1) + y1;
}

function deltaToStep(d: number): number {
	d = Math.abs(d);
	if (Number.isInteger(d)) return d / 100;
	return 1;
}

export function resolveStep<T extends number | Vec2>(a: T, b: T, step?: T): T {
	// Number
	if (typeof a === 'number') {
		if (step && Math.abs(step as number) > Number.EPSILON) return step;
		return deltaToStep(a - (b as number)) as T;
	}
	// Vec2
	if (step && !Vector2.isZero(step as Vec2)) return step;
	const [x, y] = Vector2.sub(a, b as Vec2);
	return [deltaToStep(x), deltaToStep(y)] as T;
}

/**
 * 将值限制在指定范围内，并按照指定的步长进行取整
 *
 * @param start 范围的起始值
 * @param end 范围的结束值
 * @param value 需要限制的值
 * @param step 步长，默认为 0
 * @returns 限制在范围内并按步长取整的值
 *
 * @example
 * ```ts
 * steppedClamp(0, 10, 5.5, 1) // 6
 * steppedClamp(0, 10, 5.2, 1) // 5
 * steppedClamp(0, 10, 15, 1) // 10
 * steppedClamp(0, 10, -5, 1) // 0
 * steppedClamp(0, 10, 5.5, 0) // 5.5
 * ```
 */
export function steppedClamp(
	start: number,
	end: number,
	value: number,
	step = 0,
): number {
	if (!Number.isFinite(value)) return NaN;

	step = Math.abs(step);
	if (start > end) [start, end] = [end, start];
	const startFinite = Number.isFinite(start);
	const endFinite = Number.isFinite(end);

	if (step < Number.EPSILON) return clamp(start, value, end);

	if (!(startFinite || endFinite)) value;

	if (step >= end - start) {
		const startDistance = Math.abs(start - value);
		const endDistance = Math.abs(end - value);
		return startDistance < endDistance ? start : end;
	}

	if (startFinite) {
		const count = Math.round((value - start) / step);
		return clamp(start, start + count * step, end);
	}
	const count = Math.round((end - value) / step);
	return clamp(start, end - count * step, end);
}
