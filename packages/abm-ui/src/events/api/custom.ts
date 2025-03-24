import { EventBase, EventBaseInit, IEventBase } from './base';

export interface EventCustomInit<Target = any, Details = any>
	extends EventBaseInit<Target> {
	details: Details;
}

export interface IEventCustom<
	Type extends string = string,
	Target = any,
	Details = any,
> extends IEventBase<Type, Target> {
	readonly details: Details;
}

export class EventCustom<
		Type extends string = string,
		Target = any,
		Details = any,
	>
	extends EventBase<Type, Target>
	implements IEventCustom<Type, Target, Details>
{
	#details: Details;
	constructor(type: Type, options: EventCustomInit<Target, Details>) {
		super(type, options);
		this.#details = options.details;
	}
	get details() {
		return this.#details;
	}
}
