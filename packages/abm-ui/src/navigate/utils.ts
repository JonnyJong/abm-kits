import { $$, Direction4, Vec2, Vector2 } from 'abm-utils';
import { DirectionFilter, Navigable, Rect } from './types';

//#region Contain

/**
 * 检查子元素是否是给定父元素的后代或本身
 * @description
 * 为 `Node.contains` 的增强，可向有定义 navChildren 的元素内查找
 * 参考：https://developer.mozilla.org/docs/Web/API/Node/contains
 * @param parent - 父元素
 * @param child - 子元素
 */
export function isContains(parent: Navigable, child: Navigable): boolean {
	if (parent.contains(child)) return true;
	const children = parent.navChildren;
	if (children) {
		for (const c of children) {
			if (c.contains(child)) return true;
		}
		return false;
	}
	return $$<Navigable>('[ui-nav-group]', parent).some((p) =>
		isContains(p, child),
	);
}

/**
 * 检查目标元素是否有效
 * @description
 * 为 `isContains` 的增强，向外查找，可穿过 ShadowRoot
 * @returns
 */
export function isAvailable(
	target?: Navigable | null,
	preferParent: HTMLElement = document.body,
): boolean {
	while (target) {
		if (isContains(preferParent, target)) return true;
		target = ((target as unknown as ShadowRoot)?.host ??
			(target?.getRootNode() as ShadowRoot)?.host) as Navigable;
	}
	return false;
}

//#region Vector

/** 计算矩形视觉距离 */
function getDistance(rectA: Rect, rectB: Rect): number {
	const { width: widthA, height: heightA, top: topA, left: leftA } = rectA;
	const { width: widthB, height: heightB, top: topB, left: leftB } = rectB;
	const xA = leftA + widthA / 2;
	const yA = topA + heightA / 2;
	const xB = leftB + widthB / 2;
	const yB = topB + heightB / 2;

	const vec = new Vector2(Math.abs(xB - xA), Math.abs(yB - yA));
	const length = vec.length;

	if (vec.x === 0) {
		return vec.y - (heightA + heightB) / 2;
	}
	if (vec.y === 0) {
		return vec.x - (widthA + widthB) / 2;
	}

	const sin = vec.y / length;
	const cos = vec.x / length;
	return (
		length -
		Math.min(heightA / 2 / sin, widthA / 2 / cos) -
		Math.min(heightB / 2 / sin, widthB / 2 / cos)
	);
}

/** 检查矩形是否在范围内 */
function isInside([x, y]: Vec2, { top, bottom, left, right }: DOMRect) {
	return x >= left && x <= right && y >= top && y <= bottom;
}

/** 方向过滤器 */
const DIRECTION_FILTERS: {
	[key in Direction4]: DirectionFilter;
} = {
	up: (from, to) => to.bottom < from[1],
	right: (from, to) => from[0] < to.left,
	down: (from, to) => from[1] < to.top,
	left: (from, to) => to.right < from[0],
};

//#region Nav Search

/**
 * 查找最近可导航元素
 * @param begin - 起始矩形
 * @param direction - 方向
 */
function NearestFinder(begin: Rect, direction: Direction4) {
	const position: Vec2 = [
		begin.left + begin.width / 2,
		begin.top + begin.height / 2,
	];
	let distance = Infinity;
	return function next(nextRect: DOMRect): boolean {
		if (
			nextRect.x === 0 &&
			nextRect.y === 0 &&
			nextRect.width === 0 &&
			nextRect.height === 0
		)
			return false;
		const nextDistance = getDistance(begin, nextRect);
		if (nextDistance >= distance) return false;
		if (
			!(
				DIRECTION_FILTERS[direction](position, nextRect) ||
				isInside(position, nextRect)
			)
		)
			return false;
		distance = nextDistance;
		return true;
	};
}

/**
 * 过滤出可导航元素
 * @param from - 起始元素
 */
function NavItemFilter(from?: any) {
	const SAME = (item: Element) => item === from;
	const NAVIGABLE = (item: Element) =>
		!(item as Navigable).nonNavigable &&
		(item.clientHeight !== 0 || item.clientWidth !== 0);
	const IS_NAV_ITEM = (item: Element) => item.hasAttribute('ui-nav');
	// Group Check
	const IS_GROUP_DIRECT = (item: Element) =>
		(item as Navigable).navChildren?.some(NAVIGABLE);
	const IS_GROUP_A = (item: Element) => $$('[ui-nav]', item).some(NAVIGABLE);
	const IS_GROUP_B = (item: Element) =>
		$$<Navigable>('[ui-nav-group]', item).some((group) =>
			group.navChildren?.some(NAVIGABLE),
		);

	return function filter(item: Element) {
		if (SAME(item)) return false;
		if (!NAVIGABLE(item)) return false;
		if (IS_NAV_ITEM(item)) return true;

		if (IS_GROUP_DIRECT(item)) return true;
		if (IS_GROUP_A(item)) return true;
		if (IS_GROUP_B(item)) return true;

		return false;
	};
}

/**
 * 向内寻找可导航元素
 * @param root - 根元素
 * @param direction - 方向
 * @param begin - 起始位置/元素
 */
export function searchInwards(
	root: Navigable,
	direction: Direction4,
	begin: Rect | HTMLElement,
): Navigable | null {
	const children = [...(root.navChildren ?? root.children)].filter(
		NavItemFilter(begin),
	);
	if (children.length === 0) return null;

	const rect =
		begin instanceof HTMLElement ? begin.getBoundingClientRect() : begin;
	const finder = NearestFinder(rect, direction);
	let item: Navigable | null = null;
	for (const child of children) {
		if (child === begin) continue;
		if (finder(child.getBoundingClientRect())) item = child as Navigable;
	}

	if (!item) return null;
	if (item.hasAttribute('ui-nav')) return item;
	return searchInwards(item, direction, rect);
}

/**
 * 向外查找可导航元素
 * @param border - 边界元素
 * @param direction - 方向
 * @param rect - 起始矩形
 * @param from - 起始元素
 */
export function searchOutwards(
	border: HTMLElement,
	direction: Direction4,
	rect: Rect,
	from: Navigable,
) {
	const root = from.navParent ?? (from.parentNode as Navigable);
	if (!(root && isAvailable(root, border))) return null;

	const children = [...(root.navChildren ?? root.children)].filter(
		NavItemFilter(from),
	);
	if (children.length === 0)
		return searchOutwards(border, direction, rect, root);

	const finder = NearestFinder(rect, direction);
	let item: Navigable | null = null;
	for (const child of children) {
		if (finder(child.getBoundingClientRect())) item = child as Navigable;
	}

	if (!item) return searchOutwards(border, direction, rect, root);
	if (item.hasAttribute('ui-nav')) return item;
	return searchInwards(item, direction, rect);
}

/**
 * 按顺序查找可导航元素
 * @param root - 根元素
 * @param direction - 方向
 * @param from - 起始元素
 * @returns
 */
export function searchByOrder(
	root: Navigable,
	direction: 'next' | 'prev',
	from?: Navigable | null,
): Navigable | null {
	const children = [...(root.navChildren ?? root.children)].filter(
		NavItemFilter(),
	) as Navigable[];
	if (children.length === 0) return null;

	const increment = direction === 'next' ? 1 : -1;
	let i = direction === 'next' ? 0 : children.length - 1;
	let blocked = !!from;
	for (; i < children.length && i >= 0; i += increment) {
		const target = children[i];
		const contains = from && isContains(target, from);
		// Filter
		if (blocked) {
			if (!contains) continue;
			blocked = false;
			if (target === from) continue;
		}
		// Search
		if (target.hasAttribute('ui-nav')) return target;
		const result = searchByOrder(target, direction, contains ? from : null);
		if (result) return result;
	}

	return null;
}
