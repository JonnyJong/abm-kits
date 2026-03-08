import type { Vec2 } from 'abm-utils';
import type { CurrentRect, Navigable, Rect, RectNode } from '../types';
import { hasNavigable, isHidden, traverser } from './dom';
import {
	computeTargetDistance,
	computeTargetRect,
	findRayRectIntersection,
} from './rect';
import { computeScore } from './score';

/**
 * 按方向查找可导航元素
 * @param root 根元素
 * @param origin 起始位置
 * @param vec 方向
 */
export function searchByDirection(
	root: Navigable,
	origin: CurrentRect | Rect,
	vec: Vec2,
): Navigable | null {
	// 计算射线与起始矩形交点
	let intersection = findRayRectIntersection(origin, origin, vec);
	if (!intersection) intersection = [origin.x, origin.y];
	const [ox, oy] = intersection;
	origin = { ...origin, ox, oy };

	let score = Number.POSITIVE_INFINITY;
	let result: RectNode | null = null;

	const iter = traverser(root);
	let target = iter.child();
	while (target) {
		if (target === origin.target || target.nonNavigable) {
			target = iter.nextSibling();
			continue;
		}
		if (target.hasAttribute('nav')) {
			const current = target;
			target = iter.nextSibling();
			if (isHidden(current)) continue;
			const rect = computeTargetRect(origin, current, vec);
			if (!rect) continue;
			const s = computeScore(rect);
			if (s > score) continue;
			score = s;
			result = rect;
			continue;
		}
		if (!hasNavigable(target)) {
			target = iter.nextSibling();
			continue;
		}
		const distance = computeTargetDistance(origin, target, vec);
		if (distance === null || (result && distance > result.distance)) {
			target = iter.nextSibling();
			continue;
		}
		target = iter.nextNode();
	}

	return result?.target ?? null;
}

/**
 * 按 DOM 顺序查找可导航元素
 * @param root 根元素
 * @param origin 起始位置
 * @param reverse 反向查找
 */
export function searchByDOMOrder(
	root: Navigable,
	origin?: Navigable,
	reverse?: boolean,
): Navigable | null {
	const iter = traverser(root, origin, reverse);
	let current = origin ? iter.nextSibling() : iter.child();
	while (current) {
		if (
			!current.nonNavigable &&
			current.hasAttribute('nav') &&
			!isHidden(current)
		) {
			return current;
		}
		if (hasNavigable(current)) current = iter.nextNode();
		else current = iter.nextSibling();
	}
	return null;
}

/**
 * 查找距离最近可导航元素
 * @param root 根元素
 * @param origin 起始位置
 */
export function searchClosest(
	root: Navigable,
	origin: Rect | CurrentRect,
): Navigable | null {
	if (!('ox' in origin)) {
		origin = { ...origin, ox: origin.x, oy: origin.y };
	}

	let score = Number.POSITIVE_INFINITY;
	let result: RectNode | undefined;

	const iter = traverser(root);
	let target = iter.child();

	const vec: Vec2 = [0, 0];
	while (target) {
		if (target.nonNavigable) {
			target = iter.nextSibling();
			continue;
		}
		if (target.hasAttribute('nav')) {
			const current = target;
			target = iter.nextSibling();
			if (isHidden(current)) continue;
			const rect = computeTargetRect(origin, current, vec, true);
			const s = computeScore(rect);
			if (score < s) continue;
			score = s;
			result = rect;
			continue;
		}
		if (!hasNavigable(target)) {
			target = iter.nextSibling();
			continue;
		}
		if (result) {
			const d = computeTargetDistance(origin, target, vec, true);
			if (d > result.distance) {
				target = iter.nextSibling();
				continue;
			}
		}
		target = iter.nextNode();
	}

	return result?.target ?? null;
}

// biome-ignore lint/performance/noBarrelFile: Re-Export
export { isContains } from './dom';
export { getRect } from './rect';
export * from './type';
