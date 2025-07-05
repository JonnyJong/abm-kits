import {
	Direction4,
	EventBaseInit,
	EventValueInit,
	EventsList,
	IEventSource,
	Vec2,
} from 'abm-utils';

/** 导航方向 */
export type NavDirection = Direction4 | 'next' | 'prev';
/** 导航回调参数 */
export interface NavigateCallbackOptions {
	/** 导航方向 */
	direction?: NavDirection;
	/** 激活 */
	active?: boolean;
	/** 取消 */
	cancel?: boolean;
}

/** 可导航元素 */
export interface Navigable extends HTMLElement {
	/** 禁用导航 */
	nonNavigable?: boolean;
	/** 导航回调函数 */
	navCallback?: (options: NavigateCallbackOptions) => any;
	/** 父导航元素 */
	navParent?: Navigable;
	/** 子导航元素列表 */
	navChildren?: Navigable[];
}

/** 方向过滤器 */
export type DirectionFilter = (from: Vec2, to: DOMRect) => boolean;

export type Rect = {
	top: number;
	left: number;
	height: number;
	width: number;
};

/** 导航栈元素 */
export type StackItem = [
	root: Navigable,
	current: WeakRef<Navigable> | null,
	lock: WeakRef<Navigable> | null,
];

interface NavigateEventsInit {
	nav: EventBaseInit<INavigate>;
	active: EventValueInit<INavigate, boolean>;
	cancel: EventValueInit<INavigate, boolean>;
	layer: EventBaseInit<INavigate>;
}

export type NavigateEvents = EventsList<NavigateEventsInit>;

export interface INavigate extends IEventSource<NavigateEventsInit> {
	/**
	 * 导航到下一元素
	 * Navigate to the next element
	 */
	nav(direction: NavDirection): void;
	/** 屏蔽键盘输入 */
	blockKeyboard: boolean;
	/** 当前聚焦元素 */
	get current(): HTMLElement | null;
	set current(value: HTMLElement);
	/** 锁定/解锁聚焦元素 */
	lock(value: HTMLElement | null): void;
	/** 获取当前锁定元素 */
	get locking(): boolean;
	/** 添加导航层 */
	addLayer(root: Navigable, current?: Navigable): void;
	/** 移除导航层 */
	rmLayer(root: Navigable): boolean;
}
