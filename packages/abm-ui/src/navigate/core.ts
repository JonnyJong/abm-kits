import {
	AnimationFrameController,
	callSync,
	type Direction8,
	runSync,
	type Vec2,
	Vector2,
} from 'abm-utils';
import { state } from '../state';
import { tooltip } from '../widget/tooltip';
import {
	getCurrent,
	getCurrentLayer,
	getLock,
	getRoot,
	setCurrent,
	unlock,
} from './layer';
import type { CurrentRect, Navigable, NavState, Rect } from './types';
import {
	getRect,
	isContains,
	searchByDirection,
	searchByDOMOrder,
	searchClosest,
} from './utils/index';
import { view } from './view';

const DIRECTION: Record<Direction8, Vec2> = {
	up: [0, -1],
	'right-up': [1, -1],
	right: [1, 0],
	'right-down': [1, 1],
	down: [0, 1],
	'left-down': [-1, 1],
	left: [-1, 0],
	'left-up': [-1, -1],
};

export const coreConfig: { disableRootCallback: boolean; onBack?: () => any } =
	{
		disableRootCallback: false,
	};

let rect: Rect | undefined;

/** 获取带默认值的矩形 */
function getRectWithDefault(): Rect {
	if (rect) return rect;
	const h = innerHeight / 2;
	const w = innerWidth / 2;
	return {
		top: h,
		right: w,
		bottom: h,
		left: w,
		width: 0,
		height: 0,
		x: w,
		y: h,
	};
}

/** 设置当前矩形 */
function setCurrentRect(target: Navigable): void {
	state.hover.set(target, true);
	tooltip.lock(target);
	setCurrent(target);
	callSync(target.navCallback, target, { type: 'focus' });
	const { top, right, bottom, left, width, height, x, y } = getRect(target);
	rect = { top, right, bottom, left, width, height, x, y };
}

/** 获取当前矩形 */
function getCurrentRect(): CurrentRect {
	const target = getCurrent();
	if (target) {
		const rect = getRect(target);
		return { ...rect, ox: rect.x, oy: rect.y };
	}
	const rect = getRectWithDefault();
	return { ...rect, target: getCurrent(), ox: rect.x, oy: rect.y };
}

/** 取消目标元素的焦点 */
export function blur(target: Navigable): void;
/** 取消焦点 */
export function blur(): void;
export function blur(target?: Navigable) {
	if (target) {
		state.hover.set(target, false);
		state.active.set(target, false, true);
		tooltip.unlock(target);
		callSync(target.navCallback, target, { type: 'blur' });
		return;
	}
	target = getCurrent();
	if (!target) return;
	setCurrent();
	frameController.stop();
	view.hide();
	state.hover.set(target, false);
	state.active.set(target, false, true);
	tooltip.unlock(target);
	callSync(target.navCallback, target, { type: 'blur' });
	if (!rect) return;
	rect.height = 0;
	rect.width = 0;
	rect.left = rect.x;
	rect.right = rect.x;
	rect.top = rect.y;
	rect.bottom = rect.y;
}

/** 移动当前矩形 */
export function moveRect(x: number, y: number) {
	view.move(x, y);
	rect = { width: 0, height: 0, left: x, right: x, top: y, bottom: y, x, y };
}

const frameController = new AnimationFrameController((_, timeDiff) => {
	const { root, current, lock } = getCurrentLayer();
	if (!isContains(root, lock)) unlock();
	if (
		!isContains(root, current) ||
		current?.nonNavigable ||
		!current?.hasAttribute('nav')
	) {
		if (current) blur(current);
		return targetMissingHandler();
	}
	view.update(current!, timeDiff);
});

/** 目标丢失处理器 */
function targetMissingHandler() {
	const root = getRoot();
	const next = searchClosest(root, getRectWithDefault());
	if (next) return setCurrentRect(next);
	blur();
}

/** 触发导航回调 */
export function emit(state: NavState) {
	const lock = getLock();
	if (lock) {
		callSync(lock.navCallback, lock, state);
		return;
	}
	const current = getCurrent();
	if (current?.navCallback) {
		callSync(current.navCallback, current, state);
		return;
	}
	// HACK：当前元素触发时不发出事件到根
	if (current?.hasAttribute('active')) return;
	if (coreConfig.disableRootCallback) return;
	const root = getRoot();
	callSync(root.navCallback, root, state);
}

function emitFromNav(direction: Vec2 | Direction8 | 'prev' | 'next') {
	switch (direction) {
		case 'up':
		case 'right':
		case 'down':
		case 'left':
			return emit({ type: 'direction', direction: DIRECTION[direction] });
		case 'prev':
		case 'next':
			return emit({ type: 'nav', direction });
		case 'left-down':
		case 'left-up':
		case 'right-down':
		case 'right-up':
			return;
		default:
			return emit({ type: 'direction', direction });
	}
}

/**
 * 向指定方向导航
 * @param direction 方向向量
 * @returns 导航焦点发生变化
 */
export function nav(direction: Vec2): boolean;
/**
 * 向指定方向导航
 * @param direction 方向
 */
export function nav(direction: Direction8): boolean;
/**
 * 按 DOM 顺序导航
 * @param direction DOM 顺序
 */
export function nav(direction: 'prev' | 'next', from?: Navigable): boolean;
/** 导航 */
export function nav(
	direction: Vec2 | Direction8 | 'prev' | 'next',
	from?: Navigable,
): boolean {
	if (getLock()) {
		emitFromNav(direction);
		return false;
	}
	const root = getRoot();
	const origin = getCurrentRect();

	let next: Navigable | null | undefined;
	if (direction === 'prev') {
		next = searchByDOMOrder(root, from ?? origin.target, true);
	} else if (direction === 'next') {
		next = searchByDOMOrder(root, from ?? origin.target);
	} else if (typeof direction === 'string') {
		const vec = DIRECTION[direction];
		if (!vec) return false;
		next = searchByDirection(root, origin, vec);
	} else if (Vector2.isVec2(direction) && !Vector2.isZero(direction)) {
		next = searchByDirection(root, origin, direction);
	}
	if (!next) {
		if (origin.target) {
			callSync(origin.target.navCallback, origin.target, { type: 'focus' });
		}
		return false;
	}

	if (origin.target) blur(origin.target);
	setCurrentRect(next);
	view.show();
	frameController.start();
	return true;
}

/**
 * 全局返回
 * @returns 焦点是否发生变化
 */
export function back(): boolean {
	const { root, current, lock } = getCurrentLayer();

	if (lock) callSync(lock.navCallback, lock, { type: 'back' });
	else if (root === document.body) runSync(coreConfig.onBack);
	else callSync(root.navCallback, root, { type: 'back' });

	const layer = getCurrentLayer();
	if (layer.root !== root) return true;
	if (layer.current !== current) return true;
	return false;
}
