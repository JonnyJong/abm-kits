export type Fn<P extends unknown[] = unknown[], R = unknown, T = unknown> =
	| ((this: T, ...args: P) => R)
	| Function;
export type PromiseOr<R> = R | Promise<R>;

/**
 * 将输入的参数标准化为 Error 对象
 */
export function normalizeError(error: unknown): Error {
	if (error instanceof Error) return error;
	if (typeof error === 'string') return new Error(error);
	return new Error('Failed attempt to execute function', { cause: error });
}

/**
 * 异步运行一个函数，并返回其结果或错误
 *
 * @template P - 函数参数类型数组
 * @template R - 函数返回类型
 *
 * @param fn - 要运行的函数
 * @param args - 传递给函数的参数数组
 *
 * @returns 一个Promise，解析为函数的返回值或错误
 */
export async function run<P extends any[] = any[], R = any>(
	fn: Fn<P, PromiseOr<R>>,
	...args: P
): Promise<R | Error>;
export async function run(fn: Function, ...args: any): Promise<any>;
export async function run(...args: any): Promise<any>;
export async function run(fn: any, ...args: any): Promise<any> {
	try {
		return await fn(...args);
	} catch (error) {
		return normalizeError(error);
	}
}

/**
 * 同步运行一个函数，并返回结果或错误
 *
 * @template P - 函数参数类型数组
 * @template R - 函数返回类型
 *
 * @param fn - 要运行的函数
 * @param args - 传递给函数的参数数组
 *
 * @returns 返回函数的执行结果或错误
 */
export function runSync<P extends any[] = any[], R = any>(
	fn: Fn<P, R>,
	...args: P
): R | Error;
export function runSync(fn: Function, ...args: any): any;
export function runSync(...args: any): any;
export function runSync(fn: any, ...args: any): any {
	try {
		return fn(...args);
	} catch (error) {
		return normalizeError(error);
	}
}
/**
 * 将函数加入微任务队列中运行
 *
 * @template P - 函数参数类型数组
 *
 * @param fn - 要运行的函数
 * @param args - 传递给函数的参数数组
 */
export function runTask<P extends any[] = any[]>(fn: Fn<P>, ...args: P): void;
export function runTask(fn: Function, ...args: any): void;
export function runTask(...args: any): void;
export function runTask(fn: any, ...args: any): void {
	if (typeof fn !== 'function') return;
	queueMicrotask(() => fn(...args));
}

/**
 * 异步运行一个函数，并返回其结果或错误
 *
 * @template P - 函数参数类型数组
 * @template R - 函数返回类型
 * @template T - 函数上下文类型
 *
 * @param fn - 要运行的函数
 * @param args - 传递给函数的参数数组
 *
 * @returns 一个Promise，解析为函数的返回值或错误
 */
export async function call<P extends any[] = any[], R = any, T = any>(
	fn: Fn<P, PromiseOr<R>, T>,
	thisArg: T,
	...args: P
): Promise<R | Error>;
export async function call(
	fn: Function,
	thisArg: any,
	...args: any
): Promise<any>;
export async function call(...args: any): Promise<any>;
export async function call(fn: any, thisArg: any, ...args: any): Promise<any> {
	try {
		return await fn.call(thisArg, ...args);
	} catch (error) {
		return normalizeError(error);
	}
}

/**
 * 同步运行一个函数，并返回结果或错误
 *
 * @template P - 函数参数类型数组
 * @template R - 函数返回类型
 * @template T - 函数上下文类型
 *
 * @param fn - 要运行的函数
 * @param args - 传递给函数的参数数组
 *
 * @returns 返回函数的执行结果或错误
 */
export function callSync<P extends any[] = any[], R = any, T = any>(
	fn: Fn<P, R, T>,
	thisArg: T,
	...args: P
): R | Error;
export function callSync(fn: Function, thisArg: any, ...args: any): any;
export function callSync(...args: any): any;
export function callSync(fn: any, thisArg: any, ...args: any): any {
	try {
		return fn.call(thisArg, ...args);
	} catch (error) {
		return normalizeError(error);
	}
}
/**
 * 将函数加入微任务队列中运行
 *
 * @template P - 函数参数类型数组
 * @template T - 函数上下文类型
 *
 * @param fn - 要运行的函数
 * @param args - 传递给函数的参数数组
 */
export function callTask<P extends any[] = any[], T = any>(
	fn: Fn<P, any, T>,
	thisArg: T,
	...args: P
): void;
export function callTask(fn: Function, thisArg: any, ...args: any): void;
export function callTask(...args: any): void;
export function callTask(fn: any, thisArg: any, ...args: any): void {
	if (typeof fn !== 'function') return;
	queueMicrotask(() => fn.call(thisArg, ...args));
}

/**
 * 将函数包装为异步函数，如果函数执行出错，则返回 `Promise<Error>`
 *
 * @template P - 函数参数类型数组
 * @template R - 函数返回类型
 *
 * @param fn - 要转换的函数
 * @param thisArg - 可选参数，指定函数执行时的 this 值
 *
 * @returns 包装后的异步函数，如果执行出错，则返回 `Promise<Error>`
 */
export function warp<P extends any[], R = any>(
	fn: (...args: P) => R | Promise<R>,
	thisArg?: any,
): (...args: P) => Promise<R | Error>;
export function warp<P extends any[], R = any>(
	fn: Function,
	thisArg?: any,
): (...args: P) => Promise<R | Error> {
	if (thisArg) fn = fn.bind(thisArg);
	return async (...args: P) => run(fn, ...args);
}

/**
 * 将函数包装为同步函数，如果函数执行出错，则返回 `Error`
 *
 * @template P 函数参数类型数组
 * @template R 函数返回值类型
 *
 * @param fn - 要转换的函数
 * @param thisArg - 可选参数，指定函数执行时的 this 值
 *
 * @returns 包装后的同步函数，如果执行出错，则返回 `Error`
 */
export function warpSync<P extends any[], R = any>(
	fn: (...args: P) => R,
	thisArg?: any,
): (...args: P) => R | Error;
export function warpSync<P extends any[], R = any>(
	fn: Function,
	thisArg?: any,
): (...args: P) => R | Error {
	if (thisArg) fn = fn.bind(thisArg);
	return (...args: P) => runSync(fn, ...args);
}

/**
 * 防抖函数类
 * @template P - 参数类型
 * @template R - 返回值类型
 * @template T - this 上下文类型
 */
export class Debounce<
	P extends unknown[] = unknown[],
	R = unknown,
	T = unknown,
> {
	#fn: (this: T, ...args: P) => R;
	#args: P = [] as any;
	/** 执行结果 */
	result?: R;
	#timer: number | null = null;
	#delay: number;
	/** this 上下文 */
	thisArg: T;
	/**
	 * @param fn - 需要执行的函数
	 * @param thisArg - this 上下文
	 * @param delay - 延迟时间，默认 100 毫秒
	 */
	constructor(fn: Fn<P, R, T>, thisArg: T, delay = 100) {
		this.#fn = fn as any;
		this.thisArg = thisArg;
		this.#delay = delay;
	}
	/**
	 * 清除定时器
	 */
	clean() {
		if (this.#timer !== null) clearTimeout(this.#timer);
		this.#timer = null;
	}
	/**
	 * 执行函数
	 * @param args - 参数
	 */
	exe(...args: P) {
		this.#args = args;
		this.exec();
	}
	/**
	 * 执行函数
	 */
	exec() {
		this.clean();
		this.#timer = setTimeout(() => {
			this.result = this.#fn.call(this.thisArg, ...this.#args);
			this.clean();
		}, this.#delay);
	}
	/**
	 * 创建一个防抖函数
	 * @template P - 参数类型
	 * @template T - this 上下文类型
	 *
	 * @param fn - 需要执行的函数
	 * @param delay - 延迟时间，默认100毫秒
	 * @returns 防抖函数
	 */
	static new<T = unknown, P extends unknown[] = unknown[]>(
		fn: Fn<P, unknown, T>,
		delay = 100,
	): (this: T, ...args: P) => void {
		let timer: number | null = null;
		return function (this: T, ...args: P) {
			if (timer !== null) clearTimeout(timer);

			timer = setTimeout(() => {
				(fn as Function).call(this, ...args);
				if (timer !== null) clearTimeout(timer);
				timer = null;
			}, delay);
		};
	}
}

/**
 * 节流函数类
 *
 * @template P - 参数类型
 * @template R - 返回值类型
 * @template T - this 上下文类型
 */
export class Throttle<
	P extends unknown[] = unknown[],
	R = unknown,
	T = unknown,
> {
	fn: (this: T, ...args: P) => R;
	args: P = [] as any;
	/** 执行结果 */
	result?: R;
	#timer: number | null = null;
	delay: number;
	/** this 上下文 */
	thisArg: T;
	/**
	 * @param fn - 需要执行的函数
	 * @param thisArg - this 上下文
	 * @param delay - 延迟时间，默认 100 毫秒
	 */
	constructor(fn: Fn<P, R, T>, thisArg: T, delay = 100) {
		this.fn = fn as any;
		this.thisArg = thisArg;
		this.delay = delay;
	}
	/**
	 * 清除定时器
	 */
	clean() {
		if (this.#timer !== null) clearTimeout(this.#timer);
		this.#timer = null;
	}
	/**
	 * 执行函数
	 *
	 * @param args - 参数
	 */
	exe(...args: P) {
		this.args = args;
		this.exec();
	}
	/**
	 * 执行函数
	 */
	exec() {
		if (this.#timer !== null) return;

		this.#timer = setTimeout(() => {
			this.result = this.fn.call(this.thisArg, ...this.args);
			this.clean();
		}, this.delay);
	}
	/**
	 * 创建一个节流函数
	 *
	 * @template P - 参数类型
	 * @template T - this 上下文类型
	 *
	 * @param fn - 要执行的函数
	 * @param delay - 节流延迟时间，默认为 100 毫秒
	 *
	 * @returns 节流函数
	 */
	static new<T = unknown, P extends unknown[] = unknown[]>(
		fn: Fn<P, unknown, T>,
		delay = 100,
	): (this: T, ...args: P) => void {
		let timer: number | null = null;
		return function (this: T, ...args: P) {
			if (timer !== null) return;

			timer = setTimeout(() => {
				(fn as Function).call(this, ...args);
				if (timer !== null) clearTimeout(timer);
				timer = null;
			}, delay);
		};
	}
}

/** 链式执行节点 */
export class ChainNode<R, T> {
	#fn: Fn<[T], R>;
	#param: T;
	#executed = false;
	#value!: R;
	constructor(fn: Fn<[T], R>, param: T) {
		this.#fn = fn;
		this.#param = param;
	}
	get result() {
		if (this.#executed) return this.#value;
		this.#value = this.#fn(this.#param);
		this.#executed = true;
		return this.#value;
	}
	run<N>(fn: Fn<[R], N>) {
		return new ChainNode<N, R>(fn, this.result);
	}
}

/** 链式执行 */
export function chain<T>(value: T): ChainNode<T, T> {
	return new ChainNode((value) => value, value);
}
