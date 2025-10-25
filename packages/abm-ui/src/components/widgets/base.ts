import { SignalWatcher } from '@lit-labs/signals';
import {
	type EventHandler,
	Events,
	type EventsInitList,
	type IEventSource,
	IterableWeakSet,
} from 'abm-utils';
import { LitElement } from 'lit';
import type { Navigable } from '../../navigate';

type Keys<List extends Record<string, any>> = keyof List & string;

/** UI 组件初始化参数 */
export interface WidgetInit<EventTypes extends string[]> {
	/** 事件类型列表，`undefined` 时禁用事件机制 */
	eventTypes?: EventTypes;
	/** 是否可导航 */
	nav?: boolean;
	/** 是否为导航组 */
	navGroup?: boolean;
}

export const navigableWidgets = new IterableWeakSet<Widget>();

/**
 * UI 组件
 * @description
 * 基础组件，提供事件机制、`nonNavigable` 接口
 */
export abstract class Widget<
		E extends EventsInitList<E> = {},
		EventTypes extends Keys<E> = Keys<E>,
	>
	extends SignalWatcher(LitElement)
	implements IEventSource<E>, Navigable
{
	protected events: Events<E> = null as any;
	#nav?: boolean;
	#navGroup?: boolean;
	constructor({ nav, navGroup, eventTypes }: WidgetInit<EventTypes[]> = {}) {
		super();

		this.#nav = nav;
		this.#navGroup = navGroup;
		if (nav) navigableWidgets.add(this);

		if (!eventTypes) return;
		this.events = new Events<E>(eventTypes);
	}
	connectedCallback(): void {
		super.connectedCallback();
		if (this.#nav) this.toggleAttribute('ui-nav', true);
		if (this.#navGroup) this.toggleAttribute('ui-nav-group', true);
	}
	/** 添加事件处理器 */
	on<Type extends keyof E & string>(
		type: Type,
		handler: EventHandler<Type, E[Type], this>,
	): void {
		this.events.on(type, handler);
	}
	/** 添加一次性事件处理器 */
	once<Type extends keyof E & string>(
		type: Type,
		handler: EventHandler<Type, E[Type], this>,
	): void {
		this.events.once(type, handler);
	}
	/** 移除事件处理器 */
	off<Type extends keyof E & string>(
		type: Type,
		handler: EventHandler<Type, E[Type], this>,
	): void {
		this.events.off(type, handler);
	}
	/** 不可导航 */
	get nonNavigable(): boolean {
		return this.hasAttribute('disabled');
	}
	/**
	 * 菜单行为
	 * @description
	 * - `undefined` | `false`：忽略
	 * - `true`：允许打开菜单
	 */
	get contextMenuBehavior(): boolean | undefined {
		// biome-ignore lint/suspicious/useGetterReturn: Return nothing by default
		return;
	}
}
