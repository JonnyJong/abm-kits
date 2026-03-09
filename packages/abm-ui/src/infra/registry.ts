import type { Constructor } from 'abm-utils';

// biome-ignore lint/suspicious/noEmptyInterface: 使用空接口以便合并声明
export interface Registry {}

const map = new Map<string, Constructor<any>>();

/** 注册为已知组件 */
export function register<N extends keyof Registry, E extends Registry[N]>(
	name: N,
): (target: Constructor<E>) => void {
	return (target) => {
		map.set(name, target);
	};
}

/** 注册表 */
export const registry = {
	is<N extends keyof Registry, E extends Registry[N]>(
		name: N,
		element: HTMLElement,
	): element is E {
		const proto = map.get(name);
		if (!proto) return false;
		return element instanceof proto;
	},
};
