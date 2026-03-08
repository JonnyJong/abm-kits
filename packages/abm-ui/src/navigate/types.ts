import type { Vec2 } from 'abm-utils';

/** 导航状态 */
export type NavState =
	| { type: 'focus' | 'blur' }
	| { type: 'active' | 'cancel'; down: boolean }
	| { type: 'nav'; direction: 'prev' | 'next' }
	| { type: 'direction'; direction: Vec2 }
	| { type: 'stick'; x: number; y: number }
	| { type: 'back' };

/** 可导航元素 */
export interface Navigable extends HTMLElement {
	/** 禁用导航 */
	nonNavigable?: boolean;
	/** 导航回调函数 */
	navCallback?: (state: NavState) => any;
	/** 父导航元素 */
	navParent?: Navigable;
	/** 子导航元素列表 */
	navChildren?: Navigable[];
}

export interface Rect {
	/** 顶部坐标 */
	top: number;
	/** 右侧坐标 */
	right: number;
	/** 底部坐标 */
	bottom: number;
	/** 左侧坐标 */
	left: number;
	/** 高度 */
	height: number;
	/** 宽度 */
	width: number;
	/** 中心水平坐标 */
	x: number;
	/** 中心垂直坐标 */
	y: number;
}

export interface RectNode extends Rect {
	/** 目标 */
	target: Navigable;
	/** 与原始元素距离 */
	distance: number;
	/** 与目标方向弧度 */
	radians: number;
}

export interface CurrentRect extends Rect {
	/** 目标 */
	target?: Navigable;
	/** 原点水平坐标 */
	ox: number;
	/** 原点垂直坐标 */
	oy: number;
}

export interface LayerRaw {
	root: Navigable;
	current?: WeakRef<Navigable>;
	lock?: WeakRef<Navigable>;
}

export interface Layer {
	root: Navigable;
	current?: Navigable;
	lock?: Navigable;
}
