/** `EventTarget.addEventListener()` 别名 */
export function $on<T extends Element, K extends keyof ElementEventMap>(
	target: T,
	type: K,
	handle: (this: T, ev: ElementEventMap[K]) => any,
	options?: AddEventListenerOptions | boolean,
): void;
export function $on<T extends HTMLElement, K extends keyof HTMLElementEventMap>(
	target: T,
	type: K,
	handle: (this: T, ev: HTMLElementEventMap[K]) => any,
	options?: AddEventListenerOptions | boolean,
): void;
export function $on<T extends SVGElement, K extends keyof SVGElementEventMap>(
	target: T,
	type: K,
	handle: (this: T, ev: SVGElementEventMap[K]) => any,
	options?: AddEventListenerOptions | boolean,
): void;
export function $on<T extends Document, K extends keyof DocumentEventMap>(
	target: T,
	type: K,
	handle: (this: T, ev: DocumentEventMap[K]) => any,
	options?: AddEventListenerOptions | boolean,
): void;
export function $on<T extends Window, K extends keyof WindowEventMap>(
	target: T,
	type: K,
	handle: (this: T, ev: WindowEventMap[K]) => any,
	options?: AddEventListenerOptions | boolean,
): void;
export function $on<T extends EventTarget, E extends Event>(
	target: T,
	type: string,
	handle: (this: T, ev: E) => any,
	options?: AddEventListenerOptions | boolean,
): void;
export function $on<T extends EventTarget, E extends Event>(
	target: T,
	type: string,
	handle: (this: T, ev: E) => any,
	options?: AddEventListenerOptions | boolean,
): void {
	target.addEventListener(type, handle as any, options);
}

/** `EventTarget.addEventListener()` 别名 */
export function $once<T extends Element, K extends keyof ElementEventMap>(
	target: T,
	type: K,
	handle: (this: T, ev: ElementEventMap[K]) => any,
	options?: AddEventListenerOptions,
): void;
export function $once<
	T extends HTMLElement,
	K extends keyof HTMLElementEventMap,
>(
	target: T,
	type: K,
	handle: (this: T, ev: HTMLElementEventMap[K]) => any,
	options?: AddEventListenerOptions,
): void;
export function $once<T extends SVGElement, K extends keyof SVGElementEventMap>(
	target: T,
	type: K,
	handle: (this: T, ev: SVGElementEventMap[K]) => any,
	options?: AddEventListenerOptions,
): void;
export function $once<T extends Document, K extends keyof DocumentEventMap>(
	target: T,
	type: K,
	handle: (this: T, ev: DocumentEventMap[K]) => any,
	options?: AddEventListenerOptions,
): void;
export function $once<T extends Window, K extends keyof WindowEventMap>(
	target: T,
	type: K,
	handle: (this: T, ev: WindowEventMap[K]) => any,
	options?: AddEventListenerOptions,
): void;
export function $once<T extends EventTarget, E extends Event>(
	target: T,
	type: string,
	handle: (this: T, ev: E) => any,
	options?: AddEventListenerOptions,
): void;
export function $once<T extends EventTarget, E extends Event>(
	target: T,
	type: string,
	handle: (this: T, ev: E) => any,
	options?: AddEventListenerOptions,
): void {
	target.addEventListener(type, handle as any, { ...options, once: true });
}

/** `EventTarget.removeEventListener()` 别名 */
export function $off<T extends Element, K extends keyof ElementEventMap>(
	target: T,
	type: K,
	handle: (this: T, ev: ElementEventMap[K]) => any,
	options?: EventListenerOptions | boolean,
): void;
export function $off<
	T extends HTMLElement,
	K extends keyof HTMLElementEventMap,
>(
	target: T,
	type: K,
	handle: (this: T, ev: HTMLElementEventMap[K]) => any,
	options?: EventListenerOptions | boolean,
): void;
export function $off<T extends SVGElement, K extends keyof SVGElementEventMap>(
	target: T,
	type: K,
	handle: (this: T, ev: SVGElementEventMap[K]) => any,
	options?: EventListenerOptions | boolean,
): void;
export function $off<T extends Document, K extends keyof DocumentEventMap>(
	target: T,
	type: K,
	handle: (this: T, ev: DocumentEventMap[K]) => any,
	options?: EventListenerOptions | boolean,
): void;
export function $off<T extends Window, K extends keyof WindowEventMap>(
	target: T,
	type: K,
	handle: (this: T, ev: WindowEventMap[K]) => any,
	options?: EventListenerOptions | boolean,
): void;
export function $off<T extends EventTarget, E extends Event>(
	target: T,
	type: string,
	handle: (this: T, ev: E) => any,
	options?: EventListenerOptions | boolean,
) {
	target.removeEventListener(type, handle as any, options);
}
