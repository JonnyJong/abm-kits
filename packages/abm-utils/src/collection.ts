import { Debounce, Fn } from './function';
import { wrapInRange } from './math';

export type ArrayOr<T> = T | T[];

const NUMBER_REGEX = /^\d+$/;

function getIndex(p: string | symbol) {
	if (typeof p !== 'string') return null;
	if (!NUMBER_REGEX.test(p)) return null;
	return parseInt(p);
}

export function asArray<T>(value: ArrayOr<T>): T[] {
	if (Array.isArray(value)) return value;
	return [value];
}

/**
 * 返回一个数组，其中包含从0到数组长度减1的整数。
 *
 * @param array - 输入的数组。
 * @returns 一个包含从0到数组长度减1的整数的数组。
 */
export function range(array: any[]): number[];
/**
 * 生成一个从 0 到 to，步长为 1 的数字数组
 *
 * @param to - 数组的结束值。
 * @returns 从 0 到 to，步长为 1 的数字数组
 */
export function range(to: number): number[];
/**
 * 生成一个从 from 到 to，步长为 1 的数字数组
 *
 * @param from - 数组的起始值。
 * @param to - 数组的结束值。
 * @returns 从 from 到 to，步长为 1 的数字数组
 */
export function range(from: number, to: number): number[];
/**
 * 生成一个从 from 到 to，步长为 step 的数字数组
 *
 * @param from - 数组的起始值。
 * @param to - 数组的结束值。
 * @param step - 数组中每个元素之间的步长。
 * @returns 从 from 到 to，步长为 step 的数字数组
 */
export function range(from: number, to: number, step: number): number[];
export function range(
	arg0: number | any[],
	to?: number,
	step?: number,
): number[] {
	if (Array.isArray(arg0)) {
		return range(arg0.length);
	}
	if (to === undefined) {
		to = arg0;
		arg0 = 0;
	}
	if (step === undefined) {
		step = arg0 < to ? 1 : -1;
	}
	const result: number[] = [];
	for (let i = arg0; arg0 < to ? i < to : i > to; i += step) {
		result.push(i);
	}
	return result;
}

/**
 * 随机打乱数组中的元素顺序
 * @param array 要打乱顺序的数组
 * @returns 打乱顺序后的数组
 */
export function shuffle<T>(array: T[]): T[] {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.trunc(Math.random() * (i + 1));
		if (i === j) continue;
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

/**
 * 检查两个集合是否相等
 * @param a - 第一个集合
 * @param b - 第二个集合
 * @returns 如果两个集合相等，则返回 true，否则返回 false
 */
export function areSetEqual(a: Set<any>, b: Set<any>): boolean {
	const pool = new Set([...a]);
	for (const i of b) {
		if (!pool.delete(i)) return false;
	}
	return pool.size === 0;
}

export interface ProxyArrayOptions<T> {
	/**
	 * 更新时的回调函数
	 */
	update: (target: T[], p: string | symbol, value?: any) => any;
	/**
	 * 防抖延迟时间（可选）
	 */
	debounceDelay?: number;
	/**
	 * 添加元素时的回调函数（可选）
	 * @param value - 要添加的元素
	 * @param p - 要添加的位置
	 * @returns 添加后的元素
	 */
	set?: (value: T, p: number) => T;
}

/**
 * 创建一个代理数组，该数组在添加或删除元素时会触发更新函数
 *
 * @template T - 数组元素的类型
 * @param options - 配置选项
 * @param arr - 要代理的数组，默认为空数组
 * @returns 代理数组
 */
export function proxyArray<T>(
	options: ProxyArrayOptions<T>,
	arr: T[] = [],
): T[] {
	const set = options.set;
	const update = options.debounceDelay
		? Debounce.new(options.update, options.debounceDelay)
		: options.update;

	return new Proxy(arr, {
		set(target, p, newValue, receiver) {
			if (p === 'length') {
				const result = Reflect.set(target, p, newValue, receiver);
				if (result) update(target, p, newValue);
				return result;
			}
			if (typeof p !== 'string' || !NUMBER_REGEX.test(p)) {
				return Reflect.set(target, p, newValue, receiver);
			}
			const result = Reflect.set(
				target,
				p,
				set ? set(newValue, parseInt(p)) : newValue,
				receiver,
			);
			if (result) update(target, p, newValue);
			return result;
		},
		deleteProperty(target, p) {
			const result = Reflect.deleteProperty(target, p);
			if (result) update(target, p);
			return result;
		},
	});
}

/**
 * 在 Set 中查找元素，同 `Array.prototype.find`
 */
export function find<T>(
	set: Set<T>,
	predicate: (item: T) => boolean,
): T | null {
	for (const item of set) {
		if (predicate(item)) return item;
	}
	return null;
}

/**
 * 将数组中的元素从指定的 from 索引位置移动到 to 索引的位置，并返回处理后的数组
 *
 * @param array - 输入数组，待进行操作。
 * @param from - 从该索引开始移动元素的位置
 * @param to - 目标索引位置，元素将被插入到此处
 * @returns 处理后的数组
 *
 * @example
 * ```ts
 * shift([1, 2, 3, 4, 5], 2, 4); // `[1, 2, 4, 3, 5]` 索引 4 元素前
 * shift([1, 2, 3, 4, 5], 4, 0); // `[5, 1, 2, 3, 4]` 索引 0 元素前
 * shift([1, 2, 3, 4, 5], 1, 5); // `[1, 3, 4, 5, 2]` 索引 4 元素后
 * shift([1, 2, 3, 4, 5], 1, 4); // `[1, 3, 4, 2, 5]` 索引 4 元素前
 * ```
 */
export function shift<T>(array: T[], from: number, to: number): T[] {
	if (array.length < 2) return array;

	from = wrapInRange(from, array.length);
	to = wrapInRange(to, array.length + 1);
	if (from === to) return array;

	if (from < to) to -= 1;

	array.splice(to, 0, ...array.splice(from, 1));

	return array;
}

export interface SyncListInit<Data = unknown, Instance = unknown> {
	/** 获取实例数据 */
	getData(instance: Instance): Data;
	/** 设置实例数据 */
	setData(instance: Instance, data: Data): void;
	/** 创建实例 */
	create(data: Data): Instance;
	/**
	 * 是否可创建实例
	 * @description
	 * 当可创建实例时，会将所以数据创建为实例，并清空数据列表
	 * 当不可创建实例时，会将所以实例的数据提取到数据列表中，并清空实例列表
	 */
	creatable?: boolean;
	/** 列表更新回调 */
	update?: Fn;
	/**
	 * 列表更新防抖延迟
	 * @description
	 * 当列表更新时，会延迟调用更新回调，以减少更新频率
	 */
	updateDelay?: number;
}
/**
 * 同步数据列表与实例列表
 */
export class SyncList<Data = unknown, Instance = unknown> {
	/** 获取实例数据 */
	getData: (instance: Instance) => Data;
	/** 设置实例数据 */
	setData: (instance: Instance, data: Data) => void;
	/** 创建实例 */
	create: (data: Data) => Instance;
	/** 列表更新回调 */
	update?: Fn;
	#creatable = false;
	constructor(options: SyncListInit<Data, Instance>) {
		this.create = options.create;
		this.update = options.update;
		this.#creatable = !!options.creatable;
		this.getData = options.getData;
		this.setData = options.setData;
		if (options.updateDelay)
			this.#update = Debounce.new(() => this.update?.(), options.updateDelay);
		else this.#update = () => this.update?.();
	}
	/**
	 * 是否可创建实例
	 * @description
	 * 当可创建实例时，会将所以数据创建为实例，并清空数据列表
	 * 当不可创建实例时，会将所以实例的数据提取到数据列表中，并清空实例列表
	 */
	get creatable() {
		return this.#creatable;
	}
	set creatable(value: boolean) {
		this.#creatable = value;
		if (!value) {
			this.data = this.instances.map(this.getData);
			this.instances.splice(0, this.instances.length);
			this.#update();
			return;
		}
		this.instances.splice(
			0,
			this.instances.length,
			...this.data.splice(0, this.data.length).map(this.create),
		);
		this.#update();
	}
	/** 实例列表 */
	instances: Instance[] = [];
	/** 数据列表 */
	data: Data[] = [];
	#update: Fn;
	#push = (...args: Data[]): number => {
		if (!this.#creatable) return this.data.push(...args);
		const result = this.instances.push(...args.map(this.create));
		this.#update();
		return result;
	};
	#pop = (): Data | undefined => {
		if (!this.#creatable) return this.data.pop();
		const element = this.instances.pop();
		if (!element) return;
		const result = this.getData(element);
		this.#update();
		return result;
	};
	#shift = (): Data | undefined => {
		if (!this.#creatable) return this.data.shift();
		const element = this.instances.shift();
		if (!element) return;
		const result = this.getData(element);
		this.#update();
		return result;
	};
	#unshift = (...args: Data[]): number => {
		if (!this.#creatable) return this.data.unshift(...args);
		const result = this.instances.unshift(...args.map(this.create));
		this.#update();
		return result;
	};
	#splice = (start: number, deleteCount: number, ...items: Data[]): Data[] => {
		if (!this.#creatable) {
			return this.data.splice(start, deleteCount, ...items);
		}
		const result = this.instances
			.splice(start, deleteCount, ...items.map(this.create))
			.map(this.getData);
		this.#update();
		return result;
	};
	#sort = (compareFn?: (a: Data, b: Data) => number): Data[] => {
		if (this.#creatable) {
			if (compareFn)
				this.instances.sort((a, b) => compareFn!(this.getData(a), this.getData(b)));
			else
				this.instances.sort((a, b) =>
					String(this.getData(a)).localeCompare(String(this.getData(b))),
				);
		} else if (compareFn) this.data.sort(compareFn);
		else this.data.sort();
		this.#update();
		return this.items;
	};
	#reverse = (): Data[] => {
		this.#redirect().reverse();
		this.#update();
		return this.items;
	};
	#redirect() {
		return this.#creatable ? this.instances : this.data;
	}
	#toItems() {
		if (this.#creatable) return this.instances.map(this.getData);
		return this.data;
	}
	/** 数据代理，该列表可被安全的暴露 */
	items: Data[] = new Proxy([], {
		get: (target, p, receiver) => {
			if (p === 'push') return this.#push;
			if (p === 'pop') return this.#pop;
			if (p === 'shift') return this.#shift;
			if (p === 'unshift') return this.#unshift;
			if (p === 'splice') return this.#splice;
			if (p === 'sort') return this.#sort;
			if (p === 'reverse') return this.#reverse;
			if (p === 'length') return this.#redirect().length;
			const index = getIndex(p);
			// Fix: 重定向错误
			if (index === null) {
				const result = Reflect.get(target, p, receiver);
				if (typeof result !== 'function') return result;
				return (...args: any[]) => (this.#toItems() as any)[p as any](...args);
			}
			if (this.#creatable) return this.getData(this.instances[index]);
			return this.data[index];
		},
		set: (target, p, newValue, receiver) => {
			const redirect = this.#redirect();
			let index = getIndex(p);
			if (index === null) return Reflect.set(target, p, newValue, receiver);
			if (index < 0) return true;
			if (index > redirect.length) index = redirect.length;
			// Delete
			if (p === 'length') {
				if (newValue >= redirect.length) return true;
				redirect.length = newValue;
				this.#update();
				return true;
			}
			// Set
			if (index < redirect.length) {
				if (this.#creatable) this.setData(this.instances[index], newValue);
				else this.data[index] = newValue;
				return true;
			}
			// Add
			if (!this.#creatable) {
				this.data.push(newValue);
				return true;
			}
			this.instances.push(this.create(newValue));
			this.#update();
			return true;
		},
	});
	/** 替换整个列表 */
	replace(...items: Data[]) {
		this.#splice(0, this.items.length, ...items);
		this.#update();
	}
}

/**
 * 根据条件对数组中的元素应用操作
 * @param array - 操作的数组
 * @param operate - 操作函数
 * @param condition - 条件规则
 * - `true`：所有元素 `operate(item, true)`
 * - `false`,`null`,`undefined`：所有元素 `operate(item, false)`
 * - `number[]`：指定索引的项 `operate(item, true)`，其余 `operate(item, false)`
 * - `((data: Data)=>boolean)`：根据返回值执行 `operate`
 * @param dataMapper - 代理函数，将元素转换为条件判断所需的数据类型 `D`
 */
export function applyConditionalOperation<T, D = T>(
	array: T[],
	operate: (item: T, shouldApply: boolean) => any,
	condition?: boolean | number[] | ((data: D) => boolean) | null,
	dataMapper?: (item: T) => D,
) {
	if (Array.isArray(condition)) {
		for (const i of range(array.length)) {
			operate(array[i], condition.includes(i));
		}
		return;
	}
	if (typeof condition === 'function') {
		for (const item of array) {
			operate(item, condition(dataMapper ? dataMapper(item) : (item as any)));
		}
		return;
	}
	for (const item of array) {
		operate(item, !!condition);
	}
}

/**
 * 同时遍历多个数组，生成按索引对应的元素元组
 * @description
 * 该函数接收多个数组作为参数，返回一个生成器。每次迭代会生成一个元组，
 * 元组的每个元素对应输入数组的当前索引值。遍历长度以最短的输入数组为准。
 *
 * @template {any[][]} Arrays 输入数组类型，应为二维数组类型
 * @param {...Arrays} arrays 需要同时遍历的多个数组（至少一个）
 * @returns {Generator<{ [K in keyof Arrays]: Arrays[K] extends (infer T)[] ? T : never }, void, unknown>}
 * 返回生成器，每次产生对应索引的元素元组
 *
 * @example
 * const numbers = [1, 2, 3];
 * const letters = ['a', 'b', 'c'];
 * for (const [num, char] of zip(numbers, letters)) {
 *   console.log(num, char); // 依次输出 [1, 'a'], [2, 'b'], [3, 'c']
 * }
 */
export function* zip<Arrays extends any[][] = any[][]>(
	...arrays: Arrays
): Generator<
	{ [K in keyof Arrays]: Arrays[K] extends (infer T)[] ? T : never },
	void,
	unknown
> {
	let i = 0;
	const length = Math.min(...arrays.map((array) => array.length));
	while (i < length) {
		yield arrays.map((array) => array[i]) as any;
		i++;
	}
}

/**
 * 反转给定数组的副本并返回，不改变原数组
 * @param {T} array 需要反转的原始数组
 * @returns {T[number][]} 反转后的新数组（元素类型与原数组保持一致）
 * @example
 * const arr = [1, 2, 3];
 * const reversed = toReversed(arr);
 * console.log(reversed); // [3, 2, 1]
 * console.log(arr);      // 仍保持 [1, 2, 3]
 */
export function toReversed<T extends any[] = any[]>(array: T): T[number][] {
	return [...array].reverse();
}

/**
 * 创建一个指定长度的数组，并通过生成器函数初始化每个元素
 *
 * @param length  数组长度（必须为非负整数）
 * @param generator 元素生成函数，接收三个参数：
 *  - value: 当前元素的值（根据实现可能不同，通常可忽略）
 *  - index: 当前元素的索引（从0开始）
 *  - array: 正在被操作的数组（谨慎使用，避免副作用）
 * @returns 由生成器函数初始化的新数组
 *
 * @example
 * // 创建一个长度为5的数组，元素为索引平方
 * createArray(5, (_, index) => index ** 2); // => [0, 1, 4, 9, 16]
 */
export function createArray<T>(
	length: number,
	generator: (value: unknown, index: number, array: unknown[]) => T,
): T[] {
	return new Array(length).fill(0).map(generator);
}
