export type IterOr<T> = Iterable<T> | Iterator<T> | T;
export type Iter<T> = Iterable<T> & Iterator<T>;

function* toIter<T>(value: T): Generator<T, void, undefined> {
	yield value;
}

function* fromIterator<T>(iter: {
	next(): IteratorResult<T>;
}): Generator<T, void, undefined> {
	while (true) {
		const result = iter.next();
		if (result.done) return;
		yield result.value;
	}
}

function* fromIterable<T>(iter: Iterable<T>): Generator<T, void, undefined> {
	for (const item of iter) yield item;
}

export function asIter<T>(value: IterOr<T>): Iter<T> {
	if (!(value instanceof Object)) return toIter(value);
	if (Symbol.iterator in value) return fromIterable(value);
	if (typeof value.next !== 'function') return toIter(value as T);
	return fromIterator(value);
}

/**
 * 同时遍历多个可迭代对象或迭代器
 * @description
 * 该函数接收多个可迭代对象或迭代器作为参数，返回一个生成器。
 * 每次迭代会从每个输入中取出下一个值，组成一个元组返回。
 * 遍历会在任一输入耗尽时停止。
 *
 * @param iterables 需要同时遍历的多个可迭代对象或迭代器（至少一个）
 * @returns 返回生成器，每次产生对应位置的下一个值组成的元组
 *
 * @example
 * // 基本数组用法
 * const numbers = [1, 2, 3];
 * const letters = ['a', 'b', 'c'];
 * for (const [num, char] of zip(numbers, letters)) {
 *   console.log(num, char); // 依次输出 [1, 'a'], [2, 'b'], [3, 'c']
 * }
 *
 * @example
 * // 混合可迭代对象类型
 * const set = new Set([10, 20, 30]);
 * const array = [100, 200, 300];
 * const mapIterator = new Map([['a', 1], ['b', 2]]).values();
 *
 * for (const [s, a, m] of zip(set, array, mapIterator)) {
 *   console.log(s, a, m); // 依次输出 [10, 100, 1], [20, 200, 2]
 * }
 */
export function* zip<Iters extends (Iterable<any> | Iterator<any>)[]>(
	...iterables: Iters
): Generator<
	{
		[K in keyof Iters]: Iters[K] extends Iterable<infer T>
			? T
			: Iters[K] extends Iterator<infer T>
				? T
				: never;
	},
	void,
	unknown
> {
	const iters: Iterator<any>[] = [];
	for (const it of iterables) {
		if (Symbol.iterator in it) iters.push(it[Symbol.iterator]());
		else iters.push(it);
	}
	while (true) {
		const result: any[] = [];
		for (const iter of iters) {
			const next = iter.next();
			if (next.done) return;
			result.push(next.value);
		}
		yield result as any;
	}
}
