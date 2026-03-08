//#region TwoKeyMap

import { asIter, type Iter, type IterOr } from './iter';

/**
 * 二维映射表，使用两个键（K1, K2）来索引值（V）
 * 相当于 Map<K1, Map<K2, V>> 的封装，提供更方便的操作接口
 * @template K1 第一维键的类型
 * @template K2 第二维键的类型
 * @template V 存储的值的类型
 */
export class TwoKeyMap<K1, K2, V> {
	#map = new Map<K1, Map<K2, V>>();
	/**
	 * 检查是否存在由两个键指定的值
	 * @param k1 第一维键
	 * @param k2 第二维键
	 * @returns 如果两个键对应的值存在则返回 true，否则返回 false
	 */
	has(k1: K1, k2: K2): boolean {
		return this.#map.get(k1)?.has(k2) ?? false;
	}
	/**
	 * 根据两个键获取对应的值
	 * @param k1 第一维键
	 * @param k2 第二维键
	 * @returns 对应的值，如果不存在则返回 undefined
	 */
	get(k1: K1, k2: K2): V | undefined {
		return this.#map.get(k1)?.get(k2);
	}
	/**
	 * 设置指定键对应的值
	 * @param k1 第一维键
	 * @param k2 第二维键
	 * @param value 要设置的值
	 * @returns 返回当前实例，支持链式调用
	 */
	set(k1: K1, k2: K2, value: V): this {
		let inner = this.#map.get(k1);
		if (!inner) {
			inner = new Map();
			this.#map.set(k1, inner);
		}
		inner.set(k2, value);
		return this;
	}
	/**
	 * 删除由两个键指定的值
	 * @param k1 第一维键
	 * @param k2 第二维键
	 * @returns 如果成功删除返回 true，如果键不存在则返回 false
	 */
	delete(k1: K1, k2: K2): boolean {
		const inner = this.#map.get(k1);
		if (!inner) return false;
		return inner.delete(k2);
	}
	/**
	 * 检查是否存在指定第一维键对应的内部 Map
	 * @param k1 第一维键
	 * @returns 如果存在对应内部 Map 则返回 true，否则返回 false
	 */
	hasInnerMap(k1: K1): boolean {
		return this.#map.has(k1);
	}
	/**
	 * 获取第一维键对应的内部 Map（包含所有第二维键值对）
	 * @param k1 第一维键
	 * @returns 对应的内部 Map，如果不存在则返回 undefined
	 */
	getInnerMap(k1: K1): Map<K2, V> | undefined {
		return this.#map.get(k1);
	}
	/**
	 * 设置第一维键对应的内部 Map
	 * @param k1 第一维键
	 * @param innerMap 要设置的内部 Map
	 * @returns 返回当前实例，支持链式调用
	 * @throws {TypeError} 如果传入的参数不是 Map 实例
	 */
	setInnerMap(k1: K1, innerMap: Map<K2, V>): this {
		if (!(innerMap instanceof Map)) {
			throw new TypeError('innerMap must be an instance of Map');
		}
		this.#map.set(k1, innerMap);
		return this;
	}
	/**
	 * 删除第一维键对应的整个内部 Map
	 * @param k1 第一维键
	 * @returns 如果成功删除返回 true，如果键不存在则返回 false
	 */
	deleteInnerMap(k1: K1): boolean {
		return this.#map.delete(k1);
	}
	/** 返回外层映射的默认迭代器，遍历第一维键及其对应的内部 Map */
	[Symbol.iterator](): Iter<[K1, Map<K2, V>]> {
		return this.#map.entries();
	}
	/** 返回外层映射的默认迭代器，遍历第一维键及其对应的内部 Map */
	entries(): Iter<[K1, Map<K2, V>]> {
		return this.#map.entries();
	}
	/** 遍历所有内部映射的键值对，生成第二维键和值的迭代器 */
	*innerEntries(): Iter<[K2, V]> {
		for (const inner of this.#map.values()) {
			for (const [k, v] of inner) {
				yield [k, v];
			}
		}
	}
	/** 遍历所有条目，生成完整的三元组迭代器 */
	*allEntries(): Iter<[K1, K2, V]> {
		for (const [k1, inner] of this.#map) {
			for (const [k2, v] of inner) {
				yield [k1, k2, v];
			}
		}
	}
	/** 返回所有第一维键的迭代器 */
	keys1(): Iter<K1> {
		return this.#map.keys();
	}
	/** 遍历所有第二维键，生成其迭代器 */
	*keys2(): Iter<K2> {
		for (const inner of this.#map.values()) {
			for (const k of inner.keys()) {
				yield k;
			}
		}
	}
	/** 遍历所有存储的值，生成其迭代器 */
	*values(): Iter<V> {
		for (const inner of this.#map.values()) {
			for (const v of inner.values()) {
				yield v;
			}
		}
	}
}

//#region SetMap
/**
 * 多值映射集合，将键映射到值的集合
 * 每个键对应一个不重复的值集合，适用于一对多关系的数据结构
 * @template K 键的类型
 * @template V 值的类型
 */
export class SetMap<K, V> {
	#map = new Map<K, Set<V>>();
	constructor(iterable?: Iterable<readonly [K, Iterable<V>]>) {
		if (!iterable) return;
		for (const [k, v] of iterable) this.set(k, v);
	}
	/**
	 * 检查是否包含指定的键
	 * @param key 要检查的键
	 * @returns 如果包含该键则返回 true，否则返回 false
	 */
	hasKey(key: K): boolean {
		return this.#map.has(key);
	}
	/**
	 * 检查是否包含指定的键值对
	 * @param key 要检查的键
	 * @param value 要检查的值
	 * @returns 如果包含该键值对则返回 true，否则返回 false
	 */
	has(key: K, value: V): boolean {
		return this.#map.get(key)?.has(value) ?? false;
	}
	/**
	 * 获取指定键对应的值集合
	 * @param key 要查询的键
	 * @returns 对应的值集合，如果键不存在则返回 undefined
	 */
	get(key: K): Set<V> | undefined {
		return this.#map.get(key);
	}
	/**
	 * 获取指定键对应的值集合中的任意一个值
	 * @description
	 * 由于 Set 是无序集合，返回的值不确定但固定（在集合不变的情况下）
	 * 适用于只需要获取一个元素的场景，如获取首个元素或任意元素
	 * @param key 要查询的键
	 * @returns 对应的值集合中的任意一个值，如果键不存在或值集合为空则返回 undefined
	 */
	getOne(key: K): V | undefined {
		const set = this.#map.get(key);
		if (!set) return;
		for (const value of set) {
			return value;
		}
		return;
	}
	/**
	 * 设置指定键对应的值集合（替换现有值）
	 * @param key 要设置的键
	 * @param values 要设置的值集合（可迭代对象）
	 * @returns 当前 SetMap 实例（支持链式调用）
	 */
	set(key: K, values: Iterable<V>): this {
		this.#map.set(key, new Set(values));
		return this;
	}
	/**
	 * 向指定键对应的值集合中添加一个值
	 * @param key 要添加值的键
	 * @param value 要添加的值
	 * @returns 当前 SetMap 实例（支持链式调用）
	 */
	add(key: K, value: V): this {
		let set = this.#map.get(key);
		if (!set) {
			set = new Set();
			this.#map.set(key, set);
		}
		set.add(value);
		return this;
	}
	/**
	 * 从指定键对应的值集合中删除一个值
	 * @param key 要删除值的键
	 * @param value 要删除的值
	 * @returns 当前 SetMap 实例（支持链式调用）
	 */
	delete(key: K, value: V): this {
		this.#map.get(key)?.delete(value);
		return this;
	}
	/**
	 * 删除整个键及其对应的值集合
	 * @param key 要删除的键
	 * @returns 当前 SetMap 实例（支持链式调用）
	 */
	deleteKey(key: K): this {
		this.#map.delete(key);
		return this;
	}
	/**
	 * 获取当前映射中键的数量
	 * @returns 键的数量
	 */
	get size() {
		return this.#map.size;
	}
	/**
	 * 清空所有映射关系
	 * @returns 当前 SetMap 实例（支持链式调用）
	 */
	clear(): this {
		this.#map.clear();
		return this;
	}
	/**
	 * 获取默认迭代器，用于遍历键值对
	 * @returns 返回键值对的迭代器，其中每个值是 Set<V>
	 */
	[Symbol.iterator](): Iterator<[K, Set<V>]> {
		return this.#map.entries();
	}
	/**
	 * 获取键值对的迭代器
	 * @returns 返回键值对的迭代器，其中每个值是 Set<V>
	 */
	entries(): Iterator<[K, Set<V>]> {
		return this.#map.entries();
	}
	/**
	 * 获取所有键的迭代器
	 * @returns 返回键的迭代器
	 */
	keys(): Iterator<K> {
		return this.#map.keys();
	}
	/**
	 * 获取所有值集合的迭代器
	 * @returns 返回值集合的迭代器
	 */
	values(): Iterator<Set<V>> {
		return this.#map.values();
	}
}

//#region BiMap
/** 双向映射图 */
export class BiMap<L, R> {
	#left: Map<L, R>;
	#right: Map<R, L>;
	#inverse: BiMap<R, L>;
	#initialized = false;
	constructor(iter?: IterOr<[L, R]>) {
		if (iter instanceof BiMap && !iter.#initialized) {
			this.#left = iter.#right;
			this.#right = iter.#left;
			this.#inverse = iter;
			this.#initialized = true;
			return;
		}
		this.#left = new Map();
		this.#right = new Map();
		this.#inverse = new BiMap(this) as any;
		this.#initialized = true;
		if (!iter) return;
		for (const [l, r] of asIter(iter)) this.set(l, r);
	}
	/** 反向视图 */
	get inverse() {
		return this.#inverse;
	}
	/** 清空所有键值对 */
	clear(): void {
		this.#left.clear();
		this.#right.clear();
	}
	/**
	 * 通过左键删除对应的键值对
	 * @param left 要删除的左键
	 * @returns 如果存在并删除了该键值对则返回 `true`，否则返回 `false`
	 */
	delete(left: L): boolean {
		if (!this.#left.has(left)) return false;
		const right = this.#left.get(left)!;
		this.#left.delete(left);
		this.#right.delete(right);
		return true;
	}
	/**
	 * 遍历 BiMap 中的所有键值对
	 * @param callbackfn 为每个键值对调用的函数，接收三个参数：右值、左键和 BiMap 本身
	 * @param thisArg 执行 callbackfn 时使用的 this 值
	 */
	forEach(
		callbackfn: (right: R, left: L, map: BiMap<L, R>) => void,
		thisArg?: any,
	): void {
		for (const [l, r] of this.#left) {
			callbackfn.call(thisArg, r, l, this);
		}
	}
	/**
	 * 通过左键获取对应的右值
	 * @param left 要查找的左键
	 * @returns 如果存在则返回对应的右值，否则返回 `undefined`
	 */
	get(left: L): R | undefined {
		return this.#left.get(left);
	}
	/**
	 * 检查 BiMap 中是否存在指定的左键
	 * @param left 要检查的左键
	 * @returns 如果存在则返回 `true`，否则返回 `false`
	 */
	has(left: L): boolean {
		return this.#left.has(left);
	}
	/**
	 * 设置或更新一个键值对
	 * @description
	 * 如果左键已存在，会先删除旧的映射关系
	 * @param left 左键
	 * @param right 右值
	 * @returns 返回 BiMap 实例本身，支持链式调用
	 */
	set(left: L, right: R): this {
		if (this.#left.has(left)) {
			const right = this.#left.get(left)!;
			this.#right.delete(right);
		}
		this.#left.set(left, right);
		this.#right.set(right, left);
		return this;
	}
	/** 获取键值对的数量 */
	get size(): number {
		return this.#left.size;
	}
	/** 返回一个包含所有 [左键, 右值] 对的迭代器 */
	*entries(): Iterator<[L, R]> {
		for (const lr of this.#left) {
			yield lr;
		}
	}
	/** 返回一个包含所有左键的迭代器 */
	*keys(): Iterator<L> {
		for (const l of this.#left.keys()) {
			yield l;
		}
	}
	/** 返回一个包含所有右值的迭代器 */
	*values(): Iterator<R> {
		for (const r of this.#left.values()) {
			yield r;
		}
	}
	/** 返回一个包含所有 [左键, 右值] 对的迭代器 */
	[Symbol.iterator](): Iterator<[L, R]> {
		return this.entries();
	}
	get [Symbol.toStringTag](): string {
		return 'BiMap';
	}
}
