import { SignalWatcher } from '@lit-labs/signals';
import { LitElement } from 'lit';
import {
	EventHandler,
	Events,
	EventsInitList,
	IEventSource,
} from '../../events/events';
import { Navigable } from '../../navigate';

type Keys<List extends Record<string, any>> = keyof List & string;

/**
 * UI 组件
 * @description
 * 基础组件，提供事件机制、`nonNavigable` 接口
 */
export abstract class Widget<
		Prop extends Record<string, any> = {},
		E extends EventsInitList<E> = {},
		EventTypes extends Keys<E> = Keys<E>,
	>
	extends SignalWatcher(LitElement)
	implements IEventSource<E>, Navigable
{
	protected events: Events<E> = null as any;
	#nav?: boolean;
	/**
	 * 初始化 UI 组件
	 * @param eventTypes 事件类型列表，`undefined` 时禁用事件机制
	 * @param nav 是否可导航
	 */
	constructor(eventTypes?: EventTypes[], nav?: boolean) {
		super();

		this.#nav = nav;

		if (!eventTypes) return;
		this.events = new Events<E>(eventTypes);
	}
	connectedCallback(): void {
		super.connectedCallback();
		if (this.#nav) this.toggleAttribute('ui-nav', true);
	}
	/** 添加事件处理器 */
	on<Type extends keyof E & string>(
		type: Type,
		handler: EventHandler<Type, E[Type], this>,
	): void {
		this.events.on(type, handler);
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
	_prop?: Prop;
}
