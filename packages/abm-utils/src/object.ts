import { Debounce } from './function';

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
	 *
	 * @param values - 要添加到集合中的初始值数组
	 */
	constructor(values?: readonly T[] | null) {
		if (!values) return;
		for (const value of values) {
			this.add(value);
		}
	}
	/**
	 * 向集合中添加一个值
	 *
	 * @param value - 要添加的值
	 */
	add(value: T): this {
		if (this.has(value)) return this;

		const ref = new WeakRef(value);
		this.#refs.add(ref);
		this.#registry.register(value, ref);

		return this;
	}
	/**
	 * 清空集合
	 */
	clear(): void {
		for (const ref of this.#refs) {
			this.#registry.unregister(ref);
		}
		this.#refs.clear();
	}
	/**
	 * 从集合中删除一个值
	 *
	 * @param value - 要删除的值
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
	 *
	 * @param callbackfn - 对每个元素执行的回调函数
	 * @param thisArg - 回调函数中的 this 值
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
	 *
	 * @param value - 要检查的值
	 * @returns 如果集合中包含该值，则返回 true，否则返回 false
	 */
	has(value: T): boolean {
		for (const ref of this.#refs) {
			if (ref.deref() === value) return true;
		}
		return false;
	}
	/**
	 * 获取集合的大小
	 *
	 * @returns 集合的大小
	 */
	get size(): number {
		let count = 0;
		for (const ref of this.#refs) {
			if (ref.deref()) count++;
		}
		return count;
	}
	/**
	 * 返回一个迭代器，用于遍历集合中的所有元素
	 *
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
	 *
	 * @returns 集合中的所有键
	 */
	keys(): SetIterator<T> {
		return this.values();
	}
	/**
	 * 返回一个迭代器，用于遍历集合中的所有值
	 *
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
	 *
	 * @returns 集合中的所有值
	 */
	[Symbol.iterator](): SetIterator<T> {
		return this.values();
	}
	get [Symbol.toStringTag](): string {
		return 'IterableWeakSet';
	}
}

export interface ProxyObjectOptions<T extends object> {
	/**
	 * 更新时的回调函数
	 */
	update: (target: T, p: string | symbol, value?: any) => any;
	/**
	 * 防抖延迟时间（可选）
	 */
	debounceDelay?: number;
	/**
	 * 代理对象的处理器（可选）
	 */
	handler?: ProxyHandler<T>;
}

/**
 * 创建一个代理对象，该对象在属性被设置或删除时调用指定的更新函数
 *
 * @template T - 要代理的对象类型
 * @param options - 配置选项
 * @param obj - 要代理的对象，默认为空对象
 * @returns 代理对象
 */
export function proxyObject<T extends object>(
	options: ProxyObjectOptions<T>,
	obj: T = {} as T,
): T {
	const update = options.debounceDelay
		? Debounce.new(options.update, options.debounceDelay)
		: options.update;

	const handler: ProxyHandler<T> = {
		...options.handler,
	};
	const setter = handler.set;
	const deleteProperty = handler.deleteProperty;

	handler.set;
	handler.deleteProperty;

	return new Proxy(obj, {
		...handler,
		set(target, p, newValue, receiver) {
			const result = setter
				? setter(target, p, newValue, receiver)
				: Reflect.set(target, p, newValue, receiver);
			if (result) update(target, p, newValue);
			return result;
		},
		deleteProperty(target, p) {
			const result = deleteProperty
				? deleteProperty(target, p)
				: Reflect.deleteProperty(target, p);
			if (result) update(target, p);
			return result;
		},
	});
}
