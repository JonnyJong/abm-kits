import { type Fn, run } from './function';

/**
 * 生成一个指定时间后 resolve 的 `Promise`
 *
 * @param ms 等待时间，以毫秒为单位
 * @returns 一个在指定时间后 resolve 的 `Promise`
 */
export function sleep(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, Math.max(ms, 0));
	});
}

//#region Debounce
/**
 * 防抖函数类
 * @template P 参数类型
 * @template R 返回值类型
 * @template T `this` 上下文类型
 */
export class Debounce<
	P extends unknown[] = unknown[],
	R = unknown,
	T = unknown,
> {
	#fn: (this: T, ...args: P) => R;
	#bindFn!: (...args: P) => R;
	#args: P = [] as any;
	/** 执行结果 */
	result?: R;
	#timer: number | null = null;
	#delay: number;
	#thisArg?: T;
	/**
	 * @param fn 需要执行的函数
	 * @param thisArg `this` 上下文
	 * @param delay 延迟时间，默认 100 毫秒
	 */
	constructor(fn: Fn<P, R, T>, thisArg?: T, delay = 100) {
		this.#fn = fn as any;
		this.thisArg = thisArg;
		this.#delay = delay;
	}
	/** `this` 上下文 */
	get thisArg() {
		return this.#thisArg;
	}
	set thisArg(value) {
		this.#thisArg = value;
		this.#bindFn = this.#fn.bind(this.#thisArg!);
	}
	/** 清除定时器 */
	clean() {
		if (this.#timer !== null) clearTimeout(this.#timer);
		this.#timer = null;
	}
	/**
	 * 执行函数
	 * @param args 参数
	 */
	exe(...args: P) {
		this.#args = args;
		this.exec();
	}
	/** 执行函数 */
	exec() {
		this.clean();
		this.#timer = setTimeout(() => {
			this.clean();
			this.result = this.#bindFn(...this.#args);
		}, this.#delay);
	}
	/**
	 * 创建一个防抖函数
	 * @template P 参数类型
	 * @template T `this` 上下文类型
	 *
	 * @param fn 需要执行的函数
	 * @param delay 延迟时间，默认 100 毫秒
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

//#region Throttle
/**
 * 节流函数类
 *
 * @template P 参数类型
 * @template R 返回值类型
 * @template T `this` 上下文类型
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
	/** `this` 上下文 */
	thisArg: T;
	/**
	 * @param fn 需要执行的函数
	 * @param thisArg `this` 上下文
	 * @param delay 延迟时间，默认 100 毫秒
	 */
	constructor(fn: Fn<P, R, T>, thisArg: T, delay = 100) {
		this.fn = fn as any;
		this.thisArg = thisArg;
		this.delay = delay;
	}
	/** 清除定时器 */
	clean() {
		if (this.#timer !== null) clearTimeout(this.#timer);
		this.#timer = null;
	}
	/**
	 * 执行函数
	 * @param args 参数
	 */
	exe(...args: P) {
		this.args = args;
		this.exec();
	}
	/** 执行函数 */
	exec() {
		if (this.#timer !== null) return;

		this.#timer = setTimeout(() => {
			this.result = this.fn.call(this.thisArg, ...this.args);
			this.clean();
		}, this.delay);
	}
	/**
	 * 创建一个节流函数
	 * @template P 参数类型
	 * @template T `this` 上下文类型
	 *
	 * @param fn 要执行的函数
	 * @param delay 节流延迟时间，默认为 100 毫秒
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

//#region Interval
/**
 * @description
 * 管理 setInterval 定时器的启动/停止，支持动态调整间隔时间
 */
export class Interval<T = unknown> {
	/**
	 * 定时执行的目标函数
	 */
	fn: Fn<[], any, T>;
	/** 目标函数的 this 绑定对象 */
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
	/** 启动定时器 */
	start() {
		if (this.#intervalId !== null) return;
		this.#intervalId = setInterval(
			() => (this.fn as any).call(this.thisArgs),
			this.#interval,
		);
	}
	/** 停止定时器 */
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

//#region Timeout
/**
 * 延迟定时器
 * @description
 * 管理 setTimeout 定时器的启动/停止
 */
export class Timeout<T = unknown> {
	/** 定时执行的目标函数 */
	fn: Fn<[], any, T>;
	/** 目标函数的 this 绑定对象 */
	thisArgs: T;
	#timeout: number;
	#timeoutId: number | null = null;
	/**
	 * @param fn 要定时执行的函数
	 * @param timeout 执行延迟时间（毫秒），默认为 0
	 * @param thisArgs 函数的 this 绑定对象，可选
	 */
	constructor(fn: Fn<[], any, T>, timeout = 0, thisArgs?: T) {
		this.fn = fn;
		this.#timeout = timeout;
		this.thisArgs = thisArgs as any;
	}
	#execute = () => {
		this.stop();
		this.fn.call(this.thisArgs);
	};
	/**
	 * 启动定时器
	 * @description
	 * 若定时器不存在则创建定时器
	 * @param timeout 覆盖原延迟时间
	 * @returns 是否成功创建定时器
	 */
	start(timeout?: number): boolean {
		if (this.#timeoutId !== null) return false;
		this.#timeoutId = setTimeout(this.#execute, timeout ?? this.#timeout);
		return true;
	}
	/**
	 * 停止定时器
	 * @returns 若无定时器则返回 false
	 */
	stop(): boolean {
		if (this.#timeoutId === null) return false;
		clearTimeout(this.#timeoutId);
		this.#timeoutId = null;
		return true;
	}
	/**
	 * 重启定时器
	 * @param timeout 覆盖原延迟时间
	 */
	restart(timeout?: number): void {
		if (this.#timeoutId !== null) clearTimeout(this.#timeoutId);
		this.#timeoutId = setTimeout(this.#execute, timeout ?? this.#timeout);
	}
	/**
	 * 是否正在运行定时器
	 * @readonly
	 */
	get running() {
		return this.#timeoutId !== null;
	}
	/**
	 * 当前定时器延迟时间（毫秒）
	 * @description
	 * 修改此属性不会自动重启定时器
	 */
	get timeout() {
		return this.#timeout;
	}
	set timeout(value) {
		if (typeof value !== 'number') return;
		if (value < 0) return;
		this.#timeout = value;
	}
}

//#region RepeatingTrigger
/**
 * @description
 * 模拟按键长按重复触发
 */
export class RepeatingTriggerController {
	#fn: Fn<[], any>;
	#initialDelay = 500;
	#repeatInterval = 100;
	#repeating = false;
	#timer: any = null;
	/**
	 * @param fn - 要执行的函数
	 * @param initialDelay - 初始延迟时间，可选，默认为 500 毫秒
	 * @param repeatInterval - 重复触发的时间间隔，可选，默认为 100 毫秒
	 */
	constructor(fn: Fn<[], any>, initialDelay?: number, repeatInterval?: number) {
		if (typeof fn !== 'function') throw new TypeError('fn must be a function');
		this.#fn = fn;
		if (initialDelay) this.initialDelay = initialDelay;
		if (repeatInterval) this.repeatInterval = repeatInterval;
	}
	/** 开始触发 */
	start(): void {
		if (this.isRunning) return;
		run(this.#fn);
		this.#timer = setTimeout(() => {
			this.#timer = setInterval(() => run(this.#fn), this.#repeatInterval);
		}, this.#initialDelay);
	}
	/** 停止触发 */
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
	/** 要执行的函数 */
	get fn(): Fn<[], any> {
		return this.#fn;
	}
	set fn(fn: Fn<[], any>) {
		if (typeof fn !== 'function') return;
		this.#fn = fn;
	}
	/** 初始延迟 */
	get initialDelay() {
		return this.#initialDelay;
	}
	set initialDelay(value: number) {
		if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0)
			return;
		this.#initialDelay = value;
	}
	/**重复触发的时间间隔 */
	get repeatInterval() {
		return this.#repeatInterval;
	}
	set repeatInterval(value: number) {
		if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0)
			return;
		this.#repeatInterval = value;
	}
}

//#region AnimationFrame
/**
 * 动画帧处理器
 * @param time 当前时间
 * @param diff 与上一帧相差时间（控制器启动后第一帧为 0）
 */
export type AnimationFrameHandler = (
	time: DOMHighResTimeStamp,
	diff: DOMHighResTimeStamp,
) => any;

/**
 * @description
 * 管理 requestAnimationFrame 的启动/停止，支持同步/异步回调
 */
export class AnimationFrameController {
	#fn: AnimationFrameHandler;
	#requestId: number = NaN;
	#ignoreErrors = false;
	#async: boolean;
	#prev = 0;
	/**
	 * @param fn - 每帧要执行的回调函数，参数为时间戳
	 * @param async - 是否异步执行回调函数，可选，默认为 `false`
	 */
	constructor(fn: AnimationFrameHandler, async?: boolean) {
		this.#fn = fn;
		this.#async = !!async;
	}
	#frameRequestCallback = (time: DOMHighResTimeStamp) => {
		try {
			const diff = this.#prev ? time - this.#prev : 0;
			this.#prev = time;
			this.#fn(time, diff);
		} catch (error) {
			this.#handleError(error);
		}
		if (!this.isRunning) return;
		this.#requestNextFrame();
	};
	#frameRequestCallbackAsync = async (time: DOMHighResTimeStamp) => {
		try {
			const diff = this.#prev ? this.#prev - time : 0;
			this.#prev = time;
			await this.#fn(time, diff);
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
		this.#prev = 0;
	}
	/** 停止动画帧循环 */
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
	/** 当前帧回调函数 */
	get fn() {
		return this.#fn;
	}
	set fn(fn) {
		this.#fn = fn;
	}
	/** 是否以异步模式运行回调函数 */
	get async() {
		return this.#async;
	}
	set async(value: boolean) {
		this.#async = !!value;
	}
}

//#region Timer
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
