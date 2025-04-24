export interface IUIEventBase<
	Type extends string,
	Target extends HTMLElement = HTMLElement,
> {
	readonly type: Type;
	readonly target: Target;
	readonly timestamp: number;
}

export type IUIEventHandler<
	Type extends string,
	Target extends HTMLElement = HTMLElement,
	Event extends IUIEventBase<Type, Target> = IUIEventBase<Type, Target>,
> = (this: Target, event: Event) => any;

export interface IUIEventBaseManage<Type extends string> {
	on<Target extends HTMLElement>(
		target: Target,
		handler: IUIEventHandler<Type>,
	): void;
	off<Target extends HTMLElement>(
		target: Target,
		handler: IUIEventHandler<Type>,
	): void;
	add<Target extends HTMLElement>(target: Target): void;
	rm<Target extends HTMLElement>(target: Target): void;
}
