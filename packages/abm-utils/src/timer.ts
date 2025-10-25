import { type Fn, run, runTask } from './function';

/**
 * 生成一个指定时间后 resolve 的 `Promise`
 *
 * @param ms - 等待时间，以毫秒为单位
 * @returns 一个在指定时间后 resolve 的 `Promise`
 */
export function sleep(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, Math.max(ms, 0));
	});
}

/**
 * @description
 * 模拟按键长按重复触发
 */
export class RepeatingTriggerController<
	F extends Function | ((...args: any) => any) = Function,
> {
	#fn: F;
	#initialDelay = 500;
	#repeatInterval = 100;
	#repeating = false;
	#timer: any = null;
	/**
	 * @param fn - 要执行的函数
	 * @param initialDelay - 初始延迟时间，可选，默认为 500 毫秒
	 * @param repeatInterval - 重复触发的时间间隔，可选，默认为 100 毫秒
	 */
	constructor(fn: F, initialDelay?: number, repeatInterval?: number) {
		if (typeof fn !== 'function') throw new TypeError('fn must be a function');
		this.#fn = fn;
		if (initialDelay) this.initialDelay = initialDelay;
		if (repeatInterval) this.repeatInterval = repeatInterval;
	}
	/**
	 * 开始触发
	 */
	start(): void {
		if (this.isRunning) return;
		run(this.#fn);
		this.#timer = setTimeout(() => {
			this.#timer = setInterval(() => run(this.#fn), this.#repeatInterval);
		}, this.#initialDelay);
	}
	/**
	 * 停止触发
	 */
	stop(): void {
		if (this.#timer === null) return;
		if (this.#repeating) clearInterval(this.#timer);
		else clearTimeout(this.#timer);
		this.#timer = null;
		this.#repeating = false;
	}
	/** 重启 */
	restart() {
		this.stop();
		this.start();
	}
	/**
	 * 是否正在运行
	 * @readonly
	 */
	get isRunning(): boolean {
		return this.#timer !== null;
	}
	/**
	 * 要执行的函数
	 */
	get fn(): F {
		return this.#fn;
	}
	set fn(fn: F) {
		if (typeof fn !== 'function') return;
		this.#fn = fn;
	}
	/**
	 * 初始延迟
	 */
	get initialDelay() {
		return this.#initialDelay;
	}
	set initialDelay(value: number) {
		if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0)
			return;
		this.#initialDelay = value;
	}
	/**
	 * 重复触发的时间间隔
	 */
	get repeatInterval() {
		return this.#repeatInterval;
	}
	set repeatInterval(value: number) {
		if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0)
			return;
		this.#repeatInterval = value;
	}
}

/**
 * @description
 * 管理 requestAnimationFrame 的启动/停止，支持同步/异步回调
 */
export class AnimationFrameController {
	#fn: FrameRequestCallback;
	#requestId: number = NaN;
	#ignoreErrors = false;
	#async: boolean;
	/**
	 * @param fn - 每帧要执行的回调函数，参数为时间戳
	 * @param async - 是否异步执行回调函数，可选，默认为 `false`
	 */
	constructor(fn: FrameRequestCallback, async?: boolean) {
		this.#fn = fn;
		this.#async = !!async;
	}
	#frameRequestCallback = (time: DOMHighResTimeStamp) => {
		try {
			this.#fn(time);
		} catch (error) {
			this.#handleError(error);
		}
		if (!this.isRunning) return;
		this.#requestNextFrame();
	};
	#frameRequestCallbackAsync = async (time: DOMHighResTimeStamp) => {
		try {
			await this.#fn(time);
		} catch (error) {
			this.#handleError(error);
		}
		if (!this.isRunning) return;
		this.#requestNextFrame();
	};
	#requestNextFrame() {
		this.#requestId = requestAnimationFrame(
			this.#async ? this.#frameRequestCallbackAsync : this.#frameRequestCallback,
		);
	}
	#handleError(error: unknown) {
		console.error(error);
		if (this.#ignoreErrors) return;
		this.#requestId = NaN;
	}
	/**
	 * 启动动画帧循环
	 */
	start() {
		if (this.isRunning) return;
		this.#requestNextFrame();
	}
	/**
	 * 停止动画帧循环
	 */
	stop() {
		if (!this.isRunning) return;
		cancelAnimationFrame(this.#requestId);
		this.#requestId = NaN;
	}
	/**
	 * 是否正在运行动画帧循环
	 * @readonly
	 */
	get isRunning() {
		return !Number.isNaN(this.#requestId);
	}
	/**
	 * 是否忽略回调函数中的错误
	 * @description
	 * 设置为 `true` 时，发生错误不会停止动画帧循环
	 */
	get ignoreErrors() {
		return this.#ignoreErrors;
	}
	set ignoreErrors(value: boolean) {
		this.#ignoreErrors = !!value;
	}
	/**
	 * 当前帧回调函数
	 */
	get fn() {
		return this.#fn;
	}
	set fn(fn: FrameRequestCallback) {
		this.#fn = fn;
	}
	/**
	 * 是否以异步模式运行回调函数
	 */
	get async() {
		return this.#async;
	}
	set async(value: boolean) {
		this.#async = !!value;
	}
}

/**
 * @description
 * 管理 setInterval 定时器的启动/停止，支持动态调整间隔时间
 */
export class IntervalController<T = unknown> {
	/**
	 * 定时执行的目标函数
	 */
	fn: Fn<[], any, T>;
	/**
	 * 目标函数的 this 绑定对象
	 */
	thisArgs: T;
	#interval: number;
	#intervalId: number | null = null;
	/**
	 * @param fn - 要定时执行的函数
	 * @param interval - 执行间隔时间（毫秒）
	 * @param thisArgs - 函数的 this 绑定对象，可选
	 */
	constructor(fn: Fn<[], any, T>, interval: number, thisArgs?: T) {
		this.fn = fn;
		this.#interval = interval;
		this.thisArgs = thisArgs as any;
	}
	/**
	 * 启动定时器
	 */
	start() {
		if (this.#intervalId !== null) return;
		this.#intervalId = setInterval(
			() => (this.fn as any).call(this.thisArgs),
			this.#interval,
		);
	}
	/**
	 * 停止定时器
	 */
	stop() {
		if (this.#intervalId === null) return;
		clearInterval(this.#intervalId);
		this.#intervalId = null;
	}
	/**
	 * 是否正在运行定时器
	 * @readonly
	 */
	get isRunning() {
		return this.#intervalId !== null;
	}
	/**
	 * 当前定时器间隔时间（毫秒）
	 * @description
	 * 修改此属性会自动重启定时器以应用新间隔
	 */
	get interval() {
		return this.#interval;
	}
	set interval(value) {
		if (this.#interval === value) return;
		this.#interval = value;
		if (!this.isRunning) return;
		this.stop();
		this.start();
	}
}

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
	 * @param args - 任务参数
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
	 * @param exe - 实际执行任务的函数
	 */
	constructor(exe: Fn<Args, Result | Promise<Result>>, callback: Fn<[Result]>) {
		this.#exe = exe;
		this.#callback = callback;
	}
	#run() {
		if (this.#promise) return;
		if (this.#tasks.length === 0) return;
		const task = this.#tasks.shift()!;
		this.#promise = new Promise<Result>((resolve) => resolve(this.#exe(...task)))
			.then((result) => {
				runTask(() => this.#callback(result));
				this.#promise = null;
				this.#run();
			})
			.catch((reason) => {
				const error = new Error('Error while executing', { cause: reason });
				runTask(() => this.#callback(undefined, error));
				this.#promise = null;
				this.#run();
			});
	}
	process(...args: Args) {
		this.#tasks.push(args);
		this.#run();
	}
	processMany(...tasks: Args[]) {
		this.#tasks.push(...tasks);
		this.#run();
	}
}

/** 计时器 */
export class Timer {
	#duration = 0;
	#time = 0;
	/** 时长 */
	get duration() {
		if (this.#time) return this.#duration + (Date.now() - this.#time);
		return this.#duration;
	}
	set duration(value) {
		this.#duration = value;
		if (this.#time) this.#time = Date.now();
	}
	/** 开始/继续 */
	start(): boolean {
		if (this.#time) return false;
		this.#time = Date.now();
		return true;
	}
	/** 暂停 */
	pause(): boolean {
		if (!this.#time) return false;
		this.#duration += Date.now() - this.#time;
		this.#time = 0;
		return true;
	}
	/** 停止并清零 */
	clear(): boolean {
		if (this.#time === 0 && this.#duration === 0) return false;
		this.#time = 0;
		this.#duration = 0;
		return true;
	}
	/** 是否正在运行 */
	get isRunning() {
		return this.#time;
	}
}
