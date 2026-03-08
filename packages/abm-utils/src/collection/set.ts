/**
 * 检查两个集合是否相等
 * @param a 第一个集合
 * @param b 第二个集合
 * @returns 如果两个集合相等，则返回 true，否则返回 false
 */
export function areSetEqual(a: Set<any>, b: Set<any>): boolean {
	const pool = new Set([...a]);
	for (const i of b) {
		if (!pool.delete(i)) return false;
	}
	return pool.size === 0;
}

/** 在 Set 中查找元素，同 `Array.prototype.find` */
export function find<T>(
	set: Set<T>,
	predicate: (item: T) => boolean,
): T | null {
	for (const item of set) {
		if (predicate(item)) return item;
	}
	return null;
}

//#region WeakSet
/**
 * 一个实现了 Set 接口的 IterableWeakSet 类，用于存储对对象的弱引用。
 * 当对象被垃圾回收时，它们将从集合中自动删除。
 */
export class IterableWeakSet<T extends WeakKey = WeakKey> implements Set<T> {
	#refs = new Set<WeakRef<T>>();
	#registry = new FinalizationRegistry<WeakRef<T>>((ref) => {
		this.#refs.delete(ref);
	});
	/**
	 * 构造函数，接受一个可选的初始值数组
	 * @param values 要添加到集合中的初始值数组
	 */
	constructor(values?: readonly T[] | null) {
		if (!values) return;
		for (const value of values) {
			this.add(value);
		}
	}
	/**
	 * 向集合中添加一个值
	 * @param value 要添加的值
	 */
	add(value: T): this {
		if (this.has(value)) return this;

		const ref = new WeakRef(value);
		this.#refs.add(ref);
		this.#registry.register(value, ref);

		return this;
	}
	/** 清空集合 */
	clear(): void {
		for (const ref of this.#refs) {
			this.#registry.unregister(ref);
		}
		this.#refs.clear();
	}
	/**
	 * 从集合中删除一个值
	 * @param value 要删除的值
	 * @returns 如果值被成功删除，则返回 true，否则返回 false
	 */
	delete(value: T): boolean {
		let deleted = false;
		for (const ref of this.#refs) {
			if (ref.deref() === value) {
				this.#refs.delete(ref);
				this.#registry.unregister(ref);
				deleted = true;
			}
		}
		return deleted;
	}
	/**
	 * 遍历集合中的每个元素，并对每个元素执行回调函数
	 * @param callbackfn 对每个元素执行的回调函数
	 * @param thisArg 回调函数中的 this 值
	 */
	forEach(
		callbackfn: (value: T, value2: T, set: Set<T>) => void,
		thisArg?: any,
	): void {
		for (const ref of this.#refs) {
			const obj = ref.deref();
			if (!obj) {
				this.#refs.delete(ref);
				continue;
			}
			callbackfn.call(thisArg, obj, obj, this);
		}
	}
	/**
	 * 检查集合中是否包含某个值
	 * @param value 要检查的值
	 * @returns 如果集合中包含该值，则返回 true，否则返回 false
	 */
	has(value: T): boolean {
		for (const ref of this.#refs) {
			if (ref.deref() === value) return true;
		}
		return false;
	}
	/** 集合大小 */
	get size(): number {
		let count = 0;
		for (const ref of this.#refs) {
			if (ref.deref()) count++;
		}
		return count;
	}
	/**
	 * 返回一个迭代器，用于遍历集合中的所有元素
	 * @yields 集合中的每个元素
	 */
	*entries(): SetIterator<[T, T]> {
		for (const ref of this.#refs) {
			const obj = ref.deref();
			if (obj) yield [obj, obj];
			else this.#refs.delete(ref);
		}
	}
	/**
	 * 返回一个迭代器，用于遍历集合中的所有键
	 * @returns 集合中的所有键
	 */
	keys(): SetIterator<T> {
		return this.values();
	}
	/**
	 * 返回一个迭代器，用于遍历集合中的所有值
	 * @yields 集合中的每个值
	 */
	*values(): SetIterator<T> {
		for (const ref of this.#refs) {
			const obj = ref.deref();
			if (obj) yield obj;
			else this.#refs.delete(ref);
		}
	}
	/**
	 * 返回一个迭代器，用于遍历集合中的所有值
	 * @returns 集合中的所有值
	 */
	[Symbol.iterator](): SetIterator<T> {
		return this.values();
	}
	get [Symbol.toStringTag](): string {
		return 'IterableWeakSet';
	}
	/** 返回满足提供的测试函数的第一个值。否则返回 `undefined` */
	find<S extends T>(
		predicate: (value: T, object: this) => value is S,
	): S | undefined;
	find(predicate: (value: T, object: this) => unknown): T | undefined;
	find(predicate: (value: T, object: this) => unknown): T | undefined {
		for (const value of this.values()) {
			if (predicate(value, this)) return value;
		}
		return;
	}
	/** 返回满足提供的测试函数的所有值 */
	findAll<S extends T>(predicate: (value: T, object: this) => value is S): S[];
	findAll(predicate: (value: T, object: this) => unknown): T[];
	findAll(predicate: (value: T, object: this) => unknown): T[] {
		const values: T[] = [];
		for (const value of this.values()) {
			if (predicate(value, this)) values.push(value);
		}
		return values;
	}
}
