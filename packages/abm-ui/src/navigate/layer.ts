import type { Layer, LayerRaw, Navigable } from './types';
import { checkNavigable, checkRootType, isContains } from './utils/index';

const layers: LayerRaw[] = [];

//#region Private

/** 初始化导航层 */
export function initLayers() {
	layers.push({ root: document.body });
}

/** 获取当前层 */
export function getCurrentLayer(): Layer {
	const { root, current, lock } = layers.at(-1)!;
	return { root, current: current?.deref(), lock: lock?.deref() };
}

/** 获取当前层根元素 */
export function getRoot(): Navigable {
	return layers.at(-1)!.root;
}

/** 获取当前聚焦元素 */
export function getCurrent(): Navigable | undefined {
	return layers.at(-1)?.current?.deref();
}

/** 设置当前聚焦元素 */
export function setCurrent(target?: Navigable): void {
	const layer = layers.at(-1)!;
	layer.current = target ? new WeakRef(target) : undefined;
}

//#region Public

/**
 * 添加一层导航层
 * @param root 根元素
 * @param current 焦点元素
 * @throws
 * - 根元素不为 HTMLElement 或 ShadowRoot 的实例
 * - 根元素未连接 DOM
 */
export function addLayer(root: Navigable, current?: Navigable): void {
	checkRootType(root);
	if (!isContains(document.body, root)) {
		throw new Error('Nav layer root must be connected to the DOM');
	}
	if (!(checkNavigable(current) && isContains(root, current))) {
		current = undefined;
	}
	const currentRef = current ? new WeakRef(current) : undefined;

	const index = layers.findIndex(({ root: r }) => r === root);
	if (index === -1) {
		layers.push({ root, current: currentRef });
	} else {
		const [layer] = layers.splice(index, 1);
		layer.current = currentRef;
		layer.lock = undefined;
		layers.push(layer);
	}
}

/**
 * 移除一层导航层
 * @param root 根元素
 * @returns 是否成功移除
 */
export function rmLayer(root: Navigable): boolean {
	const index = layers.findIndex(({ root: r }) => r === root);
	if (index === -1) return false;
	layers.splice(index, 1);
	return true;
}

/** 锁定 */
export function lock(target: Navigable): boolean {
	const layer = layers.at(-1)!;
	if (!isContains(layer.root, target)) return false;
	layer.lock = new WeakRef(target);
	return true;
}
/** 解锁 */
export function unlock(): void {
	layers.at(-1)!.lock = undefined;
}
/** 获取锁定的元素 */
export function getLock(): Navigable | undefined {
	return layers.at(-1)?.lock?.deref();
}
