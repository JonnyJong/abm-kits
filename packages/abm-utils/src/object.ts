import { Debounce } from './timer';

/** 构造器类型 */
export type Constructor<T, Args extends any[] = any[]> = {
	new (...args: Args): T;
};

/** 检查值是否不是 `null` 和 `undefined` */
export function notNil<T>(value: T | undefined | null): value is T {
	if (value === null) return false;
	if (value === undefined) return false;
	return true;
}

/** 将输入的参数标准化为 `Error` 对象 */
export function normalizeError(error: unknown): Error {
	if (error instanceof Error) return error;
	if (typeof error === 'string') return new Error(error);
	return new Error('Failed attempt to execute function', { cause: error });
}

//#region Proxy
export interface ProxyObjectOptions<T extends object> {
	/** 更新时的回调函数 */
	update: (target: T, p: string | symbol, value?: any) => any;
	/** 防抖延迟时间 */
	debounceDelay?: number;
	/** 代理对象的处理器 */
	handler?: ProxyHandler<T>;
}

/**
 * 创建一个代理对象，该对象在属性被设置或删除时调用指定的更新函数
 *
 * @template T 要代理的对象类型
 * @param options 配置选项
 * @param obj 要代理的对象，默认为空对象
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
