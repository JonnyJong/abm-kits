import { $ } from '../../infra/dom';
import type { Navigable } from '../types';

/** 检查元素是否隐藏 */
export function isHidden(target: Navigable): boolean {
	return target.offsetWidth === 0 && target.offsetHeight === 0;
}

/** 检查目标元素是否包含可导航元素 */
export function hasNavigable(target: Navigable): boolean {
	const children = navChildren(target);
	if (children) {
		return children.filter((child) => !child.nonNavigable).length > 0;
	}
	return !!$('[nav],[nav-group]', target);
}

/** 获取父元素 */
function parentElement(current: Navigable): Navigable | undefined {
	return (
		current.navParent ??
		(current.parentElement as Navigable) ??
		(current.getRootNode() as ShadowRoot)?.host
	);
}

function children(target: Navigable): Navigable[] {
	return (target.navChildren ?? [...target.children]).filter(
		(child) => child instanceof HTMLElement,
	);
}

function navChildren(target?: Navigable): Navigable[] | undefined {
	return target?.navChildren?.filter((child) => child instanceof HTMLElement);
}

/** 获取首个子元素 */
export function firstChildElement(current: Navigable): Navigable | undefined {
	return children(current)[0];
}

/** 获取最后一个子元素 */
export function lastChildElement(current: Navigable): Navigable | undefined {
	return children(current).at(-1);
}

function nextSibling(from: Navigable): Navigable | undefined {
	const sibling = navChildren(parentElement(from));
	if (!sibling) return from.nextElementSibling as any;
	return sibling[sibling.indexOf(from) + 1];
}

/** 获取相邻的下一个元素 */
export function nextElement(current?: Navigable): Navigable | undefined {
	if (!current) return;
	let target: Navigable | undefined = nextSibling(current);
	if (target) return target;
	target = parentElement(current);
	while (target) {
		const next = nextSibling(target);
		if (next) return next as Navigable;
		target = parentElement(target);
	}
	return;
}

function prevSibling(from: Navigable): Navigable | undefined {
	const sibling = navChildren(parentElement(from));
	if (!sibling) return from.previousElementSibling as any;
	return sibling[sibling.indexOf(from) - 1];
}

/** 获取相邻的上一个元素 */
export function prevElement(current?: Navigable): Navigable | undefined {
	if (!current) return;
	let target: Navigable | undefined = prevSibling(current);
	if (target) return target;
	target = parentElement(current);
	while (target) {
		const next = prevSibling(target);
		if (next) return next as Navigable;
		target = parentElement(target);
	}
	return;
}

/** 目标元素是否在根元素内 */
export function isContains(root: Navigable, target?: Navigable): boolean {
	while (target) {
		if (target instanceof ShadowRoot) target = target.host as Navigable;
		if (root.contains(target)) return true;
		const node = target.getRootNode();
		if (!(node instanceof ShadowRoot)) return false;
		target = node.host as Navigable;
	}
	return false;
}

/**
 * 创建 DOM 遍历器
 * @param root 根节点
 * @param reverse 反向遍历
 */
export function traverser(
	root: Navigable,
	current?: Navigable | null,
	reverse?: boolean,
) {
	if (!current) current = root;
	return {
		/**
		 * 移动到当前元素的子元素。
		 * 若无子元素则返回 null，指针不变
		 */
		child(): Navigable | undefined | null {
			if (!current) return;
			const child = reverse
				? lastChildElement(current)
				: firstChildElement(current);
			if (!child) return null;
			current = child;
			return child;
		},
		/**
		 * 移动到当前元素的下一个兄弟元素，
		 * 支持跨层级向上查找，直到 root 为止。
		 * 找到则移动指针，否则返回 null
		 */
		nextSibling(): Navigable | undefined | null {
			if (!current) return;
			current = reverse ? prevElement(current) : nextElement(current);
			if (current === root) current = null;
			return current;
		},
		/**
		 * 深度优先的下一步：
		 * - 先尝试 `child()`
		 * - 若无子元素则尝试 `nextSibling()`
		 */
		nextNode(): Navigable | undefined | null {
			if (current?.nonNavigable) return this.nextSibling();
			return this.child() ?? this.nextSibling();
		},
	};
}
