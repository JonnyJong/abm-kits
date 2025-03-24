import { Fn, run } from './function';

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

export class AnimationFrameController {
	#fn: FrameRequestCallback;
	#requestId: number = NaN;
	#ignoreErrors = false;
	#async: boolean;
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
	start() {
		if (this.isRunning) return;
		this.#requestNextFrame();
	}
	stop() {
		if (!this.isRunning) return;
		cancelAnimationFrame(this.#requestId);
		this.#requestId = NaN;
	}
	get isRunning() {
		return !isNaN(this.#requestId);
	}
	get ignoreErrors() {
		return this.#ignoreErrors;
	}
	set ignoreErrors(value: boolean) {
		this.#ignoreErrors = !!value;
	}
	get fn() {
		return this.#fn;
	}
	set fn(fn: FrameRequestCallback) {
		this.#fn = fn;
	}
	get async() {
		return this.#async;
	}
	set async(value: boolean) {
		this.#async = !!value;
	}
}

export class IntervalController<T = unknown> {
	fn: Fn<[], any, T>;
	thisArgs: T;
	#interval: number;
	#intervalId: number | null = null;
	constructor(fn: Fn<[], any, T>, interval: number, thisArgs?: T) {
		this.fn = fn;
		this.#interval = interval;
		this.thisArgs = thisArgs as any;
	}
	start() {
		if (this.#intervalId !== null) return;
		this.#intervalId = setInterval(
			() => (this.fn as any).call(this.thisArgs),
			this.#interval,
		);
	}
	stop() {
		if (this.#intervalId === null) return;
		clearInterval(this.#intervalId);
		this.#intervalId = null;
	}
	get isRunning() {
		return this.#intervalId !== null;
	}
	get interval() {
		return this.#interval;
	}
	set interval(value) {
		this.#interval = value;
		if (!this.isRunning) return;
		this.stop();
		this.start();
	}
}
