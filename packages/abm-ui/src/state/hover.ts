import { callTask, type Fn } from 'abm-utils';
import { $off, $on } from '../infra/event';

/** 悬停状态处理器 */
export type HoverStateHandler<T extends HTMLElement = HTMLElement> = Fn<
	[hover: boolean],
	any,
	T
>;

const subscriptions = new WeakMap<HTMLElement, Set<HoverStateHandler<any>>>();
const activated = new Set<HTMLElement>();

//#region Helper
function activate(target: HTMLElement) {
	activated.add(target);
	target.toggleAttribute('hover', true);
}

function deactivate(target: HTMLElement) {
	activated.delete(target);
	target.toggleAttribute('hover', false);
}

function emit(target: HTMLElement, hover: boolean) {
	const handlers = subscriptions.get(target);
	if (!handlers) return;
	for (const handler of handlers) {
		callTask(handler, target, hover);
	}
}

//#region Handler
function pointerEnterHandler(event: PointerEvent) {
	if (event.pointerType === 'touch') return;
	if (event.buttons !== 0) return;
	const target = event.currentTarget as HTMLElement;
	if (!target || activated.has(target)) return;
	activate(target);
	emit(target, true);
	$on(target, 'pointerleave', pointerLeaveHandler);
}

function pointerLeaveHandler(event: PointerEvent) {
	if (event.pointerType === 'touch') return;
	const target = event.currentTarget as HTMLElement;
	if (!(target && activated.has(target))) return;
	deactivate(target);
	emit(target, false);
	$off(target, 'pointerleave', pointerLeaveHandler);
}

//#region Exports
/** 将目标元素加入悬停状态处理 */
export function add<T extends HTMLElement>(target: T): void {
	if (subscriptions.has(target)) return;
	subscriptions.set(target, new Set());
	$on(target, 'pointerenter', pointerEnterHandler);
}

/** 移除目标元素悬停状态处理 */
export function rm<T extends HTMLElement>(target: T): void {
	subscriptions.delete(target);
	deactivate(target);
	$off(target, 'pointerenter', pointerEnterHandler);
	$off(target, 'pointerleave', pointerLeaveHandler);
}

/** 添加悬停状态处理器到目标元素 */
export function on<T extends HTMLElement>(
	target: T,
	handler: HoverStateHandler<T>,
): void {
	let handlers = subscriptions.get(target);
	if (!handlers) {
		handlers = new Set();
		subscriptions.set(target, handlers);
		$on(target, 'pointermove', pointerEnterHandler);
	}
	handlers.add(handler);
}

/** 从目标元素移除悬停状态处理器 */
export function off<T extends HTMLElement>(
	target: T,
	handler: HoverStateHandler<T>,
): void {
	subscriptions.get(target)?.delete(handler);
}

/** 设置目标元素悬停状态 */
export function set(target: HTMLElement, hover: boolean) {
	if (!subscriptions.has(target)) return;
	if (hover) {
		if (activated.has(target)) return;
		activate(target);
	} else {
		if (!activated.has(target)) return;
		deactivate(target);
	}
	emit(target, hover);
}
