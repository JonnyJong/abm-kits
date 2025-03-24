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
	constructor(eventTypes: Types[]) {
		for (const type of eventTypes) {
			this.#subscriptions[type] = new Set();
		}
	}
	emit<Type extends Keys<List>>(event: List[Type] & IEventBasic<Type>) {
		for (const handler of this.#subscriptions[event.type] ?? []) {
			runTask(handler, event);
		}
	}
	on<Type extends Keys<List>>(
		type: Type,
		handler: EventHandler<Type, List[Type]>,
	) {
		this.#subscriptions[type]?.add(handler);
	}
	off<Type extends Keys<List>>(
		type: Type,
		handler: EventHandler<Type, List[Type]>,
	) {
		this.#subscriptions[type]?.delete(handler);
	}
}
