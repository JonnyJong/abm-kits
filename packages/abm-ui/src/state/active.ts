import { callTask, type Fn } from 'abm-utils';
import { $off, $on } from '../infra/event';
import {
	type InteractionSource,
	toInteractionSource,
} from '../infra/interaction';

/** 激活状态处理器 */
export type ActiveStateHandler<T extends HTMLElement = HTMLElement> = Fn<
	[active: boolean, cancel: boolean, source: InteractionSource],
	any,
	T
>;

const subscriptions = new WeakMap<HTMLElement, Set<ActiveStateHandler<any>>>();

const activated = new Map<HTMLElement, InteractionSource>();

/**
 * 触摸开始到首次移动的最大允许时间（毫秒）
 * @default 200
 */
const HOLD_DURATION_THRESHOLD = 200;
/**
 * 滑动判定阈值（像素/毫秒）
 * @default 0.5
 */
const SWIPE_THRESHOLD = 0.5;

//#region Helper
function activate(target: HTMLElement, source: InteractionSource) {
	activated.set(target, source);
	target.toggleAttribute('active', true);
	if (source === 'nav') return;
	if (typeof source === 'string') {
		$on(target, 'pointerup', pointerUpHandler);
		$on(target, 'pointerleave', pointerLeaveHandler);
		return;
	}
	$on(target, 'touchend', touchEndHandler);
	$on(target, 'touchmove', touchMoveHandler);
}

function deactivate(target: HTMLElement) {
	activated.delete(target);
	target.toggleAttribute('active', false);
	$off(target, 'pointerup', pointerUpHandler);
	$off(target, 'pointerleave', pointerLeaveHandler);
	$off(target, 'touchmove', touchMoveHandler);
	$off(target, 'touchend', touchEndHandler);
}

function emit(
	target: HTMLElement,
	active: boolean,
	cancel: boolean,
	source: InteractionSource,
) {
	const handlers = subscriptions.get(target);
	if (!handlers) return;
	for (const handler of handlers) {
		callTask(handler, target, active, cancel, source);
	}
}

function bind(target: HTMLElement) {
	$on(target, 'pointerdown', pointerDownHandler);
	$on(target, 'touchstart', touchStartHandler);
}

function unbind(target: HTMLElement) {
	$off(target, 'pointerdown', pointerDownHandler);
	$off(target, 'pointerup', pointerUpHandler);
	$off(target, 'pointerleave', pointerLeaveHandler);
	$off(target, 'touchstart', touchStartHandler);
	$off(target, 'touchmove', touchMoveHandler);
	$off(target, 'touchend', touchEndHandler);
}

//#region Handler
function pointerDownHandler(event: PointerEvent) {
	if (event.pointerType === 'touch') return;
	if (event.button !== 0) return;
	const target = event.currentTarget as HTMLElement;
	if (!target || activated.has(target)) return;
	activate(target, toInteractionSource(event));
	emit(target, true, false, -1);
}

function pointerUpHandler(event: PointerEvent) {
	if (event.pointerType === 'touch') return;
	if (event.button !== 0) return;
	const target = event.currentTarget as HTMLElement;
	if (!(target && activated.has(target))) return;
	deactivate(target);
	emit(target, false, false, -1);
}

function pointerLeaveHandler(event: PointerEvent) {
	if (event.pointerType === 'touch') return;
	const target = event.currentTarget as HTMLElement;
	if (!(target && activated.has(target))) return;
	deactivate(target);
	emit(target, false, true, -1);
}

let touchStartTime = 0;
let touchStartX = 0;
let touchStartY = 0;
function touchStartHandler(event: TouchEvent) {
	// 若页面正在滚动，则不处理
	if (!event.cancelable) return;

	const target = event.currentTarget as HTMLElement;
	if (target.hasAttribute('disabled')) return;
	if (!target || activated.has(target)) return;

	const { identifier, clientX, clientY } = event.changedTouches[0];

	touchStartTime = Date.now();
	touchStartX = clientX;
	touchStartY = clientY;

	activate(target, identifier);
	emit(target, true, false, identifier);
}

function touchMoveHandler(event: TouchEvent) {
	const target = event.currentTarget as HTMLElement;
	const source = activated.get(target);
	if (!(target && typeof source === 'number')) return;
	const touch = [...event.changedTouches].find(
		({ identifier }) => identifier === source,
	);
	if (!touch) return;
	const { left, right, top, bottom } = target.getBoundingClientRect();
	const { clientX, clientY } = touch;
	let isSwipe = false;
	if (touchStartTime !== 0) {
		const duration = Date.now() - touchStartTime;
		const distance = Math.sqrt(
			(clientX - touchStartX) ** 2 + (clientY - touchStartY) ** 2,
		);
		const speed = distance / duration;
		isSwipe = duration < HOLD_DURATION_THRESHOLD && speed >= SWIPE_THRESHOLD;
		touchStartTime = 0;
	}
	if (
		!isSwipe &&
		clientX >= left &&
		clientX <= right &&
		clientY >= top &&
		clientY <= bottom
	) {
		event.preventDefault();
		return;
	}
	deactivate(target);
	emit(target, false, true, source);
}

function touchEndHandler(event: TouchEvent) {
	const target = event.currentTarget as HTMLElement;
	const source = activated.get(target);
	if (!(target && typeof source === 'number')) return;
	const touch = [...event.changedTouches].find(
		({ identifier }) => identifier === source,
	);
	if (!touch) return;
	deactivate(target);
	emit(target, false, false, source);
}

//#region Exports
/** 将目标元素加入激活状态处理 */
export function add<T extends HTMLElement>(target: T): void {
	if (subscriptions.has(target)) return;
	subscriptions.set(target, new Set());
	bind(target);
}

/** 移除目标元素激活状态处理 */
export function rm<T extends HTMLElement>(target: T): void {
	subscriptions.delete(target);
	deactivate(target);
	unbind(target);
}

/** 添加激活状态处理器到目标元素 */
export function on<T extends HTMLElement>(
	target: T,
	handler: ActiveStateHandler<T>,
): void {
	let handlers = subscriptions.get(target);
	if (!handlers) {
		handlers = new Set();
		subscriptions.set(target, handlers);
		bind(target);
	}
	handlers.add(handler);
}

/** 从目标元素移除激活状态处理器 */
export function off<T extends HTMLElement>(
	target: T,
	handler: ActiveStateHandler<T>,
): void {
	subscriptions.get(target)?.delete(handler);
}

/** 设置目标元素激活状态 */
export function set(target: HTMLElement, active: boolean, cancel?: boolean) {
	if (!subscriptions.has(target)) return;
	if (active) {
		if (activated.has(target)) return;
		activate(target, 'nav');
	} else {
		if (!activated.has(target)) return;
		deactivate(target);
	}
	emit(target, active, active ? false : !!cancel, -2);
}
