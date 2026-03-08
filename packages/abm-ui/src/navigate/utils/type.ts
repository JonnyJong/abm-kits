import type { Navigable } from '../types';

/** 检查根元素类型 */
export function checkRootType(root: unknown): void {
	if (root instanceof HTMLElement) return;
	if (root instanceof ShadowRoot) return;
	throw new TypeError(
		`Nav layer root require instanceof HTMLElement or ShadowRoot, but received ${root}`,
	);
}

/** 检查元素类型 */
export function checkNavigable(target: unknown): target is Navigable {
	return target instanceof HTMLElement;
}
