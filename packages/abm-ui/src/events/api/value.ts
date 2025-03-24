import { EventBase, EventBaseInit, IEventBase } from './base';

export interface EventValueInit<Target = any, Value = any>
	extends EventBaseInit<Target> {
	value: Value;
}

export interface IEventValue<
	Type extends string = string,
	Target = any,
	Value = any,
> extends IEventBase<Type, Target> {
	readonly value: Value;
}

export class EventValue<Type extends string = string, Target = any, value = any>
	extends EventBase<Type, Target>
	implements IEventValue<Type, Target, value>
{
	#value: value;
	constructor(type: Type, options: EventValueInit<Target, value>) {
		super(type, options);
		this.#value = options.value;
	}
	get value() {
		return this.#value;
	}
}
