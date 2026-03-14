import { normalizeError } from './object';

export type Fn<P extends any[] = [], R = unknown, T = unknown> = ((
	this: T,
	...args: P
) => R) &
	Function;
export type PromiseOr<R> = R | Promise<R>;

/** 串行化 */
export function sequential<R, A extends any[]>(fn: (...args: A) => Promise<R>) {
	let prevPromise: Promise<R> | undefined;
	return (...args: A): Promise<R> => {
		if (prevPromise) {
			prevPromise = prevPromise.then(
				() => fn(...args),
				() => fn(...args),
			);
		} else prevPromise = fn(...args);
		return prevPromise;
	};
}

//#region Run
/**
 * 异步运行一个函数，并返回其结果或错误
 *
 * @param fn 要运行的函数
 * @param args 传递给函数的参数数组
 *
 * @returns 一个 `Promise`，解析为函数的返回值或错误
 */
export async function run<T>(
	fn: T,
	...args: T extends Fn<infer P> ? P : any
): Promise<T extends Fn<any, infer R> ? R | Error : any> {
	try {
		return await (fn as any)(...args);
	} catch (error) {
		return normalizeError(error) as any;
	}
}

/**
 * 同步运行一个函数，并返回结果或错误
 *
 * @param fn 要运行的函数
 * @param args 传递给函数的参数数组
 *
 * @returns 返回函数的执行结果或错误
 */
export function runSync<T>(
	fn: T,
	...args: T extends Fn<infer P> ? P : any[]
): T extends Fn<any, infer R> ? R | Error : any {
	try {
		return (fn as any)(...args);
	} catch (error) {
		return normalizeError(error) as any;
	}
}

/**
 * 将函数加入微任务队列中运行
 *
 * @template P 函数参数类型数组
 *
 * @param fn 要运行的函数
 * @param args 传递给函数的参数数组
 */
export function runTask<T>(
	fn: T,
	...args: T extends Fn<infer P> ? P : any[]
): void {
	if (typeof fn !== 'function') return;
	queueMicrotask(() => fn(...args));
}

//#region Call
/**
 * 异步运行一个函数，并返回其结果或错误
 *
 * @param fn 要运行的函数
 * @param thisArg 目标函数 `this` 上下文
 * @param args 传递给函数的参数数组
 *
 * @returns 一个 `Promise`，解析为函数的返回值或错误
 */
export async function call<T>(
	fn: T,
	thisArg: T extends Fn<any, any, infer C> ? C : any,
	...args: T extends Fn<infer P> ? P : any
): Promise<T extends Fn<any, infer R> ? R | Error : any> {
	try {
		return await (fn as any).call(thisArg, ...args);
	} catch (error) {
		return normalizeError(error) as any;
	}
}

/**
 * 同步运行一个函数，并返回结果或错误
 *
 * @param fn 要运行的函数
 * @param thisArg 目标函数 `this` 上下文
 * @param args 传递给函数的参数数组
 *
 * @returns 返回函数的执行结果或错误
 */
export function callSync<T>(
	fn: T,
	thisArg: T extends Fn<any, any, infer C> ? C : any,
	...args: T extends Fn<infer P> ? P : any[]
): T extends Fn<any, infer R> ? R | Error : any {
	try {
		return (fn as any).call(thisArg, ...args);
	} catch (error) {
		return normalizeError(error) as any;
	}
}

/**
 * 将函数加入微任务队列中运行
 *
 * @param fn 要运行的函数
 * @param thisArg 目标函数 `this` 上下文
 * @param args 传递给函数的参数数组
 */
export function callTask<T>(
	fn: T,
	thisArg: T extends Fn<any, any, infer C> ? C : any,
	...args: T extends Fn<infer P> ? P : any[]
): void {
	if (typeof fn !== 'function') return;
	queueMicrotask(() => fn.call(thisArg, ...args));
}

//#region Wrap
/**
 * 将函数包装为异步函数，如果函数执行出错，则返回 `Promise<Error>`
 *
 * @template P 函数参数类型数组
 * @template R 函数返回类型
 *
 * @param fn 要转换的函数
 * @param thisArg 可选参数，指定函数执行时的 this 值
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
 * @param fn 要转换的函数
 * @param thisArg 可选参数，指定函数执行时的 this 值
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

//#region Chain
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

//#region Serial
interface SerialTask<Args extends any[], Result> {
	args: Args;
	resolve: (result: Result) => void;
	reject: (error: unknown) => void;
}

/**
 * @description
 * 串行任务执行器，保证任务按添加顺序依次执行
 */
export class SerialExecutor<Args extends any[], Result> {
	#exe: Fn<Args, Result | Promise<Result>>;
	#tasks: SerialTask<Args, Result>[] = [];
	/**
	 * @param exe - 实际执行任务的函数
	 */
	constructor(exe: Fn<Args, Result | Promise<Result>>) {
		this.#exe = exe;
	}
	#running = false;
	async #run() {
		this.#running = true;
		while (true) {
			const task = this.#tasks.shift();
			if (!task) break;
			try {
				// biome-ignore lint/performance/noAwaitInLoops: Need to ensure serial execution
				task.resolve(await this.#exe(...task.args));
			} catch (error) {
				task.reject(error);
			}
		}
		this.#running = false;
	}
	/**
	 * 提交新任务到执行队列
	 *
	 * @param args 任务参数
	 * @returns 返回一个 Promise，在任务执行完成时 resolve/reject
	 *
	 * @description
	 * 任务会被加入队列并按添加顺序依次执行
	 */
	process(...args: Args): Promise<Result> {
		return new Promise((resolve, reject) => {
			this.#tasks.push({ args, resolve, reject });
			if (!this.#running) this.#run();
		});
	}
}

//#region SerialCB
/**
 * @description
 * 串行任务执行器，保证任务按添加顺序依次执行
 */
export class SerialCallbackExecutor<Args extends any[], Result> {
	#exe: Fn<Args, Result | Promise<Result>>;
	#callback: Fn<[Result] | [undefined, Error]>;
	#tasks: Args[] = [];
	#promise: Promise<void> | null = null;
	/**
	 * @param exe 实际执行任务的函数
	 */
	constructor(
		exe: Fn<Args, Result | Promise<Result>>,
		callback: Fn<[Result] | [undefined, Error]>,
	) {
		this.#exe = exe;
		this.#callback = callback;
	}
	#run() {
		if (this.#promise) return;
		if (this.#tasks.length === 0) return;
		const task = this.#tasks.shift()!;
		this.#promise = new Promise<Result>((resolve) => resolve(this.#exe(...task)))
			.then((result) => {
				runTask(this.#callback, result);
				this.#promise = null;
				this.#run();
			})
			.catch((reason) => {
				const error = new Error('Error while executing', { cause: reason });
				runTask(this.#callback, undefined, error);
				this.#promise = null;
				this.#run();
			});
	}
	/**
	 * 提交新任务到执行队列
	 *
	 * @param args 任务参数
	 *
	 * @description
	 * 任务会被加入队列并按添加顺序依次执行
	 */
	process(...args: Args) {
		this.#tasks.push(args);
		this.#run();
	}
	/** 提交多个任务到执行队列 */
	processMany(...tasks: Args[]) {
		this.#tasks.push(...tasks);
		this.#run();
	}
}
