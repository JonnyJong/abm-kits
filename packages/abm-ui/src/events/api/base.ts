export interface IEventBasic<Type extends string = string> {
	readonly type: Type;
	readonly timestamp: number;
}

export interface EventBaseInit<Target = any> {
	readonly target: Target;
}

export interface IEventBase<Type extends string = string, Target = any>
	extends EventBaseInit<Target>,
		IEventBasic<Type> {}

export class EventBase<Type extends string = string, Target = any>
	implements IEventBase<Type, Target>
{
	#type: Type;
	#target: Target;
	#timestamp = Date.now();
	constructor(type: Type, options: EventBaseInit<Target>) {
		this.#type = type;
		this.#target = options.target;
	}
	get type(): Type {
		return this.#type;
	}
	get target(): Target {
		return this.#target;
	}
	get timestamp() {
		return this.#timestamp;
	}
}
