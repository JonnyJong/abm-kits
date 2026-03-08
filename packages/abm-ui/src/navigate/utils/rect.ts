import { type Vec2, Vector2 } from 'abm-utils';
import type { CurrentRect, Navigable, Rect, RectNode } from '../types';

const ALLOW_RADIAN_RANGE = Math.PI / 4;

/** 获取元素矩形 */
export function getRect(element: Navigable): RectNode {
	const { top, right, bottom, left, height, width } =
		element.getBoundingClientRect();
	const x = left + width / 2;
	const y = top + height / 2;
	return {
		target: element,
		top,
		right,
		bottom,
		left,
		height,
		width,
		x,
		y,
		distance: NaN,
		radians: NaN,
	};
}

/** 检查矩形是否重叠 */
function isOverlap(a: Rect, b: Rect): boolean {
	if (a.left < b.left && a.right < b.left) return false;
	if (a.left > b.right && a.right > b.right) return false;
	if (a.top < b.top && a.bottom < b.top) return false;
	if (a.top > b.bottom && a.bottom > b.bottom) return false;
	return true;
}

/**
 * 计算从原点中心发射的射线与目标矩形边缘的交点
 * @param origin 原点矩形
 * @param target 目标矩形
 * @param vec 射线向量
 */
export function findRayRectIntersection(
	origin: Rect,
	target: Rect,
	vec: Vec2,
): [x: number, y: number] | null {
	const { top, right, bottom, left } = target;
	const { x: ox, y: oy } = origin;
	const [dx, dy] = vec;

	let minT = Number.POSITIVE_INFINITY;
	let intersection: [number, number] | null = null;

	// 检查顶部
	if (dy) {
		const t = (target.top - oy) / dy;
		const x = ox + t * dx;
		if (t > 0 && x >= left && x <= right && t < minT) {
			minT = t;
			intersection = [x, top];
		}
	}

	// 检查右侧
	if (dx) {
		const t = (target.right - ox) / dx;
		const y = oy + t * dy;
		if (t > 0 && y >= top && y <= bottom && t < minT) {
			minT = t;
			intersection = [right, y];
		}
	}

	// 检查底部
	if (dy) {
		const t = (bottom - oy) / dy;
		const x = ox + t * dx;
		if (t > 0 && x >= left && x <= right && t < minT) {
			minT = t;
			intersection = [x, bottom];
		}
	}

	// 检查左侧
	if (dx) {
		const t = (left - ox) / dx;
		const y = oy + t * dy;
		if (t > 0 && y >= top && y <= bottom && t < minT) {
			minT = t;
			intersection = [left, y];
		}
	}

	return intersection;
}

/**
 * 计算从矩形中点发射的射线接触到矩形边缘的距离
 * @param rect 矩形
 * @param vec 射线向量
 */
function getRayDistanceFromCenterToBorder(rect: Rect, vec: Vec2): number {
	const { width, height } = rect;
	const halfWidth = width / 2;
	const halfHeight = height / 2;
	const x = Math.abs(vec[0]);
	const y = Math.abs(vec[1]);

	if (!x) return halfHeight;
	if (!y) return halfWidth;

	const rectSlope = halfHeight / halfWidth;
	const vecSlope = y / x;

	// 先碰到顶部或底部
	if (vecSlope >= rectSlope) {
		return (halfHeight / y) * Math.sqrt(x * x + y * y);
	}
	// 先碰到左侧或右侧
	return (halfWidth / x) * Math.sqrt(x * x + y * y);
}

/**
 * 计算获取目标元素矩形
 * @description
 * 使用“感知间距”而非中心点距离：
 * 当射线指向目标元素时，使用射线，否则使用中心点连线。
 * 最终距离为连线长度减去在各元素内部线段长度
 * @param origin 原点元素
 * @param target 目标元素
 * @param vec 射线向量
 * @param noLimit 取消角度限制
 * @returns 当元素夹角与目标夹角超出 90 度时返回 null
 */
export function computeTargetRect<T extends boolean>(
	origin: CurrentRect,
	target: Navigable,
	vec: Vec2,
	noLimit?: T,
): T extends true ? RectNode : RectNode | null {
	const rect = getRect(target);
	const { x, y } = origin;

	// 检查矩形是否在以射线与原点矩形交点为起点的扇形中
	if (
		!(
			noLimit ||
			isRectInSector({ x: origin.ox, y: origin.oy }, rect, vec, Math.PI / 2)
		)
	) {
		return null as any;
	}

	/** 射线交点 */
	const intersection = isOverlap(origin, rect)
		? null
		: findRayRectIntersection(origin, rect, vec);
	/** 原点元素到目标元素连线 */
	const line = Vector2.sub(intersection ?? [rect.x, rect.y], [x, y]);

	/** 目标连线弧度与射线弧度差 */
	let relativeRadians = 0;
	if (!noLimit) {
		const radians = Math.atan2(-line[1], line[0]);
		const vecRadians = Math.atan2(-vec[1], vec[0]);
		let diff = radians - vecRadians;
		while (diff > Math.PI) diff -= 2 * Math.PI;
		while (diff < -Math.PI) diff += 2 * Math.PI;
		relativeRadians = Math.abs(diff);
		// 检查弧度差是否过大
		if (relativeRadians > ALLOW_RADIAN_RANGE) return null as any;
	}

	/** 目标连线长度 */
	const distance = Vector2.length(line);
	/** 原点元素内部距离 */
	const originInnerDistance = getRayDistanceFromCenterToBorder(origin, line);
	/** 目标元素每部距离 */
	const targetInnerDistance = intersection
		? 0
		: getRayDistanceFromCenterToBorder(rect, line);
	/** 修正距离 */
	const d = distance - originInnerDistance - targetInnerDistance;

	rect.distance = d;
	rect.radians = relativeRadians;
	return rect as any;
}

/** 计算矩形间距 */
function distanceBetweenRects(rect1: Rect, rect2: Rect): number {
	const h = Math.max(0, rect2.left - rect1.right, rect1.left - rect2.right);
	const v = Math.max(0, rect2.top - rect1.bottom, rect1.top - rect2.bottom);

	if (!(h && v)) return Math.max(h, v);
	return Math.sqrt(h * h + v * v);
}

/** 检查角度是否在给定范围内（处理角度循环） */
function isAngleInRange(angle: number, start: number, end: number): boolean {
	const normalizedAngle =
		((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
	const normalizedStart =
		((start % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
	const normalizedEnd = ((end % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

	if (normalizedStart <= normalizedEnd) {
		return normalizedAngle >= normalizedStart && normalizedAngle <= normalizedEnd;
	}
	return normalizedAngle >= normalizedStart || normalizedAngle <= normalizedEnd;
}

/** 检查射线是否与线段相交 */
function isRayIntersectLineSegment(
	origin: Vec2,
	direction: Vec2,
	segmentStart: Vec2,
	segmentEnd: Vec2,
): boolean {
	const rDx = direction[0];
	const rDy = direction[1];
	const sDx = segmentEnd[0] - segmentStart[0];
	const sDy = segmentEnd[1] - segmentStart[1];

	const denominator = rDx * sDy - rDy * sDx;

	if (!denominator) return false;

	const t =
		(sDx * (segmentStart[1] - origin[1]) - sDy * (segmentStart[0] - origin[0])) /
		denominator;
	const u =
		(rDx * (segmentStart[1] - origin[1]) - rDy * (segmentStart[0] - origin[0])) /
		denominator;

	return t >= 0 && u >= 0 && u <= 1;
}

/**
 * 判断目标矩形是否在以原点为中心、射线方向为正方向的扇形区域内
 * @param origin 原点
 * @param target 目标矩形
 * @param vec 射线向量
 */
function isRectInSector(
	origin: { x: number; y: number },
	target: Rect,
	vec: Vec2,
	range: number = ALLOW_RADIAN_RANGE,
): boolean {
	const rayAngle = Math.atan2(vec[1], vec[0]);

	const startAngle = rayAngle - range;
	const endAngle = rayAngle + range;

	const vertices: Vec2[] = [
		[target.left, target.top],
		[target.right, target.top],
		[target.right, target.bottom],
		[target.left, target.bottom],
	];

	for (const vertex of vertices) {
		const dx = vertex[0] - origin.x;
		const dy = vertex[1] - origin.y;
		const angle = Math.atan2(dy, dx);
		if (isAngleInRange(angle, startAngle, endAngle)) return true;
	}

	const dx = target.x - origin.x;
	const dy = target.y - origin.y;
	const centerAngle = Math.atan2(dy, dx);
	if (isAngleInRange(centerAngle, startAngle, endAngle)) return true;

	const startVec: Vec2 = [Math.cos(startAngle), Math.sin(startAngle)];
	const endVec: Vec2 = [Math.cos(endAngle), Math.sin(endAngle)];
	const edges: [Vec2, Vec2][] = [
		[vertices[0], vertices[1]],
		[vertices[1], vertices[2]],
		[vertices[2], vertices[3]],
		[vertices[3], vertices[0]],
	];

	const center: Vec2 = [origin.x, origin.y];
	for (const [p1, p2] of edges) {
		if (isRayIntersectLineSegment(center, startVec, p1, p2)) return true;
		if (isRayIntersectLineSegment(center, endVec, p1, p2)) return true;
	}

	if (origin.x < target.left) return false;
	if (origin.x > target.right) return false;
	if (origin.y < target.top) return false;
	if (origin.y > target.bottom) return false;

	return true;
}

/**
 * 快速计算目标元素距离
 * @param origin 原点元素
 * @param target 目标元素
 * @param vec 射线向量
 * @param noLimit 取消角度限制
 * @returns 若不在范围内，返回 null；若重叠，返回负无穷；否则返回间距
 */
export function computeTargetDistance<T extends boolean>(
	origin: Rect,
	target: Navigable,
	vec: Vec2,
	noLimit?: T,
): T extends true ? number : number | null {
	const rect = getRect(target);
	if (isOverlap(origin, rect)) return Number.NEGATIVE_INFINITY;
	if (!noLimit) return distanceBetweenRects(origin, rect);
	if (!isRectInSector(origin, rect, vec)) return null as any;
	return distanceBetweenRects(origin, rect);
}
