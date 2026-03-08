import { TwoKeyMap } from './collection/map';

export type EventHandler<T extends any[]> = (...args: T) => any;

type Key<T> = keyof T & string;
type Args<T, K extends Key<T>> = T[K] extends any[] ? T[K] : [T[K]];

const KEY = '__ABM_EVENT';

export const kHandler = Symbol();

export interface IEventEmitter<T> {
	/**
	 * 注册事件监听器
	 * @template K 事件名类型
	 * @param event 要监听的事件名
	 * @param handler 事件处理器函数
	 * @remarks 若同一个事件和处理器已经注册过，则不会重复注册
	 */
	on<K extends Key<T>>(event: K, handler: EventHandler<Args<T, K>>): void;
	/**
	 * 注册一次性事件监听器
	 * @template K 事件名类型
	 * @param event 要监听的事件名
	 * @param handler 事件处理器函数
	 * @remarks 事件触发一次后会自动移除监听器
	 */
	once<K extends Key<T>>(event: K, handler: EventHandler<Args<T, K>>): void;
	/**
	 * 移除事件监听器
	 * @template K 事件名类型
	 * @param event 要移除的事件名
	 * @param handler 要移除的事件处理器函数
	 */
	off<K extends Key<T>>(event: K, handler: EventHandler<Args<T, K>>): void;
	/**
	 * 触发指定事件
	 * @template K 事件名类型
	 * @param event 要触发的事件名
	 * @param args 事件参数
	 */
	emit<K extends Key<T>>(event: K, ...args: Args<T, K>): void;
}

/**
 * 事件发射器类
 * @template T 事件映射类型
 * @example
 * interface AppEvents {
 *   'ready': [];
 *   'error': [Error];
 * }
 *
 * const emitter = new EventEmitter<AppEvents>();
 * emitter.on('ready', () => console.log('App is ready'));
 * emitter.on('error', (err) => console.error(err));
 * emitter.emit('ready');
 */
export class EventEmitter<T> extends EventTarget implements IEventEmitter<T> {
	/** 事件处理器 */
	_eventHandlers = new TwoKeyMap<keyof T, EventHandler<any>, AbortController>();
	on<K extends Key<T>>(event: K, handler: EventHandler<Args<T, K>>): void {
		if (this._eventHandlers.has(event, handler)) return;
		const controller = new AbortController();
		const eventListener = (e: CustomEvent<Args<T, K>>) => {
			if (e.target !== this) return;
			handler(...e.detail);
		};
		const option: AddEventListenerOptions = {
			passive: false,
			signal: controller.signal,
		};
		this.addEventListener(`${KEY}:${event}`, eventListener as any, option);
		this._eventHandlers.set(event, handler, controller);
	}
	once<K extends Key<T>>(event: K, handler: EventHandler<Args<T, K>>): void {
		if (this._eventHandlers.has(event, handler)) return;
		const controller = new AbortController();
		const eventListener = (e: CustomEvent<Args<T, K>>) => {
			if (e.target !== this) return;
			this._eventHandlers.delete(event, handler);
			handler(...e.detail);
		};
		const option: AddEventListenerOptions = {
			passive: false,
			signal: controller.signal,
		};
		this.addEventListener(`${KEY}:${event}`, eventListener as any, option);
		this._eventHandlers.set(event, handler, controller);
	}
	off<K extends Key<T>>(event: K, handler: EventHandler<Args<T, K>>): void {
		const controller = this._eventHandlers.get(event, handler);
		if (!controller) return;
		controller.abort();
		this._eventHandlers.delete(event, handler);
	}
	emit<K extends Key<T>>(event: K, ...args: Args<T, K>): void {
		const options: CustomEventInit<Args<T, K>> = {
			detail: args,
			bubbles: true,
			cancelable: false,
			composed: false,
		};
		this.dispatchEvent(new CustomEvent(`${KEY}:${event}`, options));
	}
}
