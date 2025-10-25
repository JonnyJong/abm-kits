import {
	type EventHandler,
	Events,
	type EventsInitList,
	type IEventSource,
} from 'abm-utils';

type Keys<List extends Record<string, any>> = keyof List & string;

export interface PrefabInit<EventTypes extends string[]> {
	/** 事件类型列表，`undefined` 时禁用事件机制 */
	eventTypes?: EventTypes;
}

export abstract class Prefab<
	E extends EventsInitList<E> = {},
	EventTypes extends Keys<E> = Keys<E>,
> implements IEventSource<E>
{
	protected events: Events<E> = null as any;
	constructor({ eventTypes }: PrefabInit<EventTypes[]> = {}) {
		if (!eventTypes) return;
		this.events = new Events<E>(eventTypes);
	}
	on<Type extends keyof E & string>(
		type: Type,
		handler: EventHandler<Type, E[Type], any>,
	): void {
		this.events.on(type, handler);
	}
	once<Type extends keyof E & string>(
		type: Type,
		handler: EventHandler<Type, E[Type], any>,
	): void {
		this.events.once(type, handler);
	}
	off<Type extends keyof E & string>(
		type: Type,
		handler: EventHandler<Type, E[Type], any>,
	): void {
		this.events.off(type, handler);
	}
}
