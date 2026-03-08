import {
	AnimationFrameController,
	EventEmitter,
	type Vec2,
	Vector2,
} from 'abm-utils';
import { $path, $rect } from './dom';

const SCROLL_FACTOR = 10;
const MAX_ACCELERATION = 6000;
const PADDING = 64;

const views = new WeakMap<Element, Vec2>();
let tracked: Element | undefined;

const controller = new AnimationFrameController((_, timeDiff) =>
	track(timeDiff),
);
const emitter = new EventEmitter<{ scrolled: [] }>();

const CSS_SCROLL_VALUE: string[] = ['auto', 'scroll', 'overlay'];
function getScrollState(target: Element): { x: boolean; y: boolean } | null {
	const { overflowX, overflowY } = getComputedStyle(target);
	let x = CSS_SCROLL_VALUE.includes(overflowX);
	let y = CSS_SCROLL_VALUE.includes(overflowY);
	if (x) {
		const { scrollWidth, clientWidth } = target;
		x = scrollWidth > clientWidth;
	}
	if (y) {
		const { scrollHeight, clientHeight } = target;
		y = scrollHeight > clientHeight;
	}
	return { x, y };
}

function getViews(
	target: Element,
): { view: Element; x: boolean; y: boolean }[] {
	return $path(target)
		.slice(1)
		.map((view) => {
			const state = getScrollState(view);
			if (!state) return null;
			return { ...state, view };
		})
		.filter((v): v is { view: Element; x: boolean; y: boolean } => !!v);
}

function computeSpeed(
	viewStart: number,
	viewEnd: number,
	start: number,
	end: number,
	speed: number,
): number {
	const viewSize = viewEnd - viewStart;
	const targetSize = end - start;

	// 1. 计算需要移动的距离 (Distance / Offset)
	// 目标是让这个 offset 变为 0
	let distanceToTarget = 0;

	if (targetSize + PADDING * 2 > viewSize) {
		// 元素比视口大 -> 居中对齐
		const viewCenter = viewStart + viewSize / 2;
		const targetCenter = start + targetSize / 2;
		distanceToTarget = targetCenter - viewCenter;
	} else if (start - PADDING < viewStart) {
		// 元素在视口左/上方（或跨越左/上边界） -> 对齐 Start (Top/Left)
		distanceToTarget = start - viewStart - PADDING;
	} else if (end + PADDING > viewEnd) {
		// 元素在视口右/下方（或跨越右/下边界） -> 对齐 End (Bottom/Right)
		distanceToTarget = end - viewEnd + PADDING;
	} else {
		// 元素完整出现在视口中 -> 不需要移动
		distanceToTarget = 0;
	}

	// 2. 计算期望速度 (Desired Velocity)
	// 使用比例控制 (P-Control)：距离越远，期望速度越快。
	// distanceToTarget > 0 表示目标在视口右/下方，需要向右/下滚动（速度为正）。
	const desiredSpeed = distanceToTarget * SCROLL_FACTOR;

	// 3. 应用加速度限制 (Clamp Acceleration)
	// 计算当前速度到期望速度的差值
	const diff = desiredSpeed - speed;

	// 如果需要的速度变化量在最大加速度范围内，直接达到期望速度
	// 这也处理了“逐渐将速度降低到 0”的逻辑（当 distanceToTarget 为 0 时，desiredSpeed 为 0）
	if (Math.abs(diff) <= MAX_ACCELERATION) {
		return desiredSpeed;
	}

	// 否则，仅向期望速度方向调整 MAX_ACCELERATION 的量
	return speed + Math.sign(diff) * MAX_ACCELERATION;
}

export function track(timeDiff: DOMHighResTimeStamp, fallback?: Element) {
	const target = tracked ?? fallback;
	if (!target?.isConnected) return;

	const { top, right, bottom, left } = $rect(target);

	let scrolled = false;
	for (const { view, x, y } of getViews(target)) {
		const rect = $rect(view);
		const speed = views.get(view) ?? Vector2.zero();

		if (x) speed[0] = computeSpeed(rect.left, rect.right, left, right, speed[0]);
		else speed[0] = 0;

		if (y) speed[1] = computeSpeed(rect.top, rect.bottom, top, bottom, speed[1]);
		else speed[1] = 0;

		if (Vector2.isZero(speed)) {
			views.delete(view);
			continue;
		}

		scrolled = true;
		views.set(view, speed);
		view.scrollLeft += (speed[0] * timeDiff) / 1000;
		view.scrollTop += (speed[1] * timeDiff) / 1000;
	}
	if (scrolled) emitter.emit('scrolled');
}

function lock(element: Element): void {
	if (tracked === element) return;
	tracked = element;
	controller.start();
}

function unlock(element: Element): void {
	if (tracked !== element) return;
	tracked = undefined;
}

function on(type: 'scrolled', handler: () => any): void {
	emitter.on(type, handler);
}

function off(type: 'scrolled', handler: () => any): void {
	emitter.off(type, handler);
}

/**
 * 视口追踪器
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/infra/viewport-tracker)
 */
export const viewportTracker = { lock, unlock, on, off };
