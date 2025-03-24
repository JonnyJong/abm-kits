import { EventBase, EventBaseInit, IEventBase } from './base';

export interface EventKeyInit<Target = any, Key extends string = string>
	extends EventBaseInit<Target> {
	key: Key;
}

export interface IEventKey<
	Type extends string = string,
	Target = any,
	Key extends string = string,
> extends IEventBase<Type, Target> {
	readonly key: Key;
}

export class EventKey<
		Type extends string = string,
		Target = any,
		Key extends string = string,
	>
	extends EventBase<Type, Target>
	implements IEventKey<Type, Target, Key>
{
	#key: Key;
	constructor(type: Type, options: EventKeyInit<Target, Key>) {
		super(type, options);
		this.#key = options.key;
	}
	get key() {
		return this.#key;
	}
}
