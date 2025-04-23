import { runTask } from 'abm-utils';
import { EventBaseInit, IEventBasic } from './api/base';
//#region Self-Host Events API

type Keys<List extends Record<string, any>> = keyof List & string;

export type EventsInitList<
	List extends Record<string, EventBaseInit<Target>>,
	Target = any,
> = {
	[Type in Keys<List>]: EventBaseInit<Target>;
};

export type EventsList<List extends EventsInitList<List>> = {
	[Type in Keys<List>]: List[Type] & IEventBasic<Type>;
};

export type EventHandler<
	Type extends string,
	Event extends EventBaseInit<Target>,
	Target = any,
> = (event: Event & IEventBasic<Type>) => any;

export type EventSubscriptions<List extends EventsInitList<List>> = {
	[Type in Keys<List>]: Set<EventHandler<Type, List[Type]>>;
};

export interface IEventSource<List extends EventsInitList<List>> {
	on<Type extends Keys<List>>(
		type: Type,
		handler: EventHandler<Type, List[Type]>,
	): void;
	once<Type extends Keys<List>>(
		type: Type,
		handler: EventHandler<Type, List[Type]>,
	): void;
	off<Type extends Keys<List>>(
		type: Type,
		handler: EventHandler<Type, List[Type]>,
	): void;
}

export class Events<
	List extends EventsInitList<List>,
	Types extends Keys<List> = Keys<List>,
> implements IEventSource<List>
{
	#subscriptions: EventSubscriptions<List> = {} as any;
	#onceSubscriptions: EventSubscriptions<List> = {} as any;
	constructor(eventTypes: Types[]) {
		for (const type of eventTypes) {
			this.#subscriptions[type] = new Set();
			this.#onceSubscriptions[type] = new Set();
		}
	}
	emit<Type extends Keys<List>>(event: List[Type] & IEventBasic<Type>) {
		for (const handler of this.#onceSubscriptions[event.type] ?? []) {
			runTask(handler, event);
		}
		for (const handler of this.#subscriptions[event.type] ?? []) {
			runTask(handler, event);
		}
		this.#onceSubscriptions[event.type]?.clear();
	}
	on<Type extends Keys<List>>(
		type: Type,
		handler: EventHandler<Type, List[Type]>,
	) {
		this.#subscriptions[type]?.add(handler);
	}
	once<Type extends Keys<List>>(
		type: Type,
		handler: EventHandler<Type, List[Type]>,
	) {
		this.#onceSubscriptions[type]?.add(handler);
	}
	off<Type extends Keys<List>>(
		type: Type,
		handler: EventHandler<Type, List[Type]>,
	) {
		this.#subscriptions[type]?.delete(handler);
		this.#onceSubscriptions[type]?.delete(handler);
	}
}
