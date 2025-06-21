import { runTask } from './function';

//#region API: Base
/**
 * 基础事件接口，包含事件类型和时间戳
 * @template Type - 事件类型的字符串字面量类型
 */
export interface IEventBasic<Type extends string = string> {
	/** 事件类型标识 */
	readonly type: Type;
	/** 事件触发时间的时间戳 */
	readonly timestamp: number;
}

/**
 * 事件基础初始化参数
 * @template Target - 事件目标对象类型
 */
export interface EventBaseInit<Target = any> {
	/** 事件关联的目标对象 */
	readonly target: Target;
}

/**
 * 基础事件接口
 * @template Type - 事件类型的字符串字面量类型
 * @template Target - 事件目标对象类型
 */
export interface IEventBase<Type extends string = string, Target = any>
	extends EventBaseInit<Target>,
		IEventBasic<Type> {}

/**
 * 基础事件类
 * @template Type - 事件类型的字符串字面量类型
 * @template Target - 事件目标对象类型
 */
export class EventBase<Type extends string = string, Target = any>
	implements IEventBase<Type, Target>
{
	#type: Type;
	#target: Target;
	#timestamp = Date.now();
	/**
	 * 创建事件实例
	 * @param type - 事件类型
	 * @param options - 事件初始化参数
	 */
	constructor(type: Type, options: EventBaseInit<Target>) {
		this.#type = type;
		this.#target = options.target;
	}
	/** 获取事件类型 */
	get type(): Type {
		return this.#type;
	}
	/** 获取事件目标对象 */
	get target(): Target {
		return this.#target;
	}
	/** 获取事件时间戳 */
	get timestamp() {
		return this.#timestamp;
	}
}

//#region Events
type Keys<List extends Record<string, any>> = keyof List & string;

/**
 * 事件初始化列表类型
 * @template List - 事件类型映射表
 * @template Target - 事件目标对象类型
 */
export type EventsInitList<
	List extends Record<string, EventBaseInit<Target>>,
	Target = any,
> = {
	[Type in Keys<List>]: EventBaseInit<Target>;
};

/**
 * 完整事件列表类型（包含基础事件属性）
 * @template List - 事件初始化列表
 */
export type EventsList<List extends EventsInitList<List>> = {
	[Type in Keys<List>]: List[Type] & IEventBasic<Type>;
};

/**
 * 事件处理器函数类型
 * @template Type - 事件类型
 * @template Event - 事件对象类型
 * @template Target - 事件目标对象类型
 */
export type EventHandler<
	Type extends string,
	Event extends EventBaseInit<Target>,
	Target = any,
> = (event: Event & IEventBasic<Type>) => any;

/**
 * 事件订阅集合类型
 * @template List - 事件初始化列表
 */
export type EventSubscriptions<List extends EventsInitList<List>> = {
	[Type in Keys<List>]: Set<EventHandler<Type, List[Type]>>;
};

/**
 * 事件源接口，提供事件监听方法
 * @template List - 事件初始化列表
 */
export interface IEventSource<List extends EventsInitList<List>> {
	/**
	 * 注册事件监听器
	 * @param type - 要监听的事件类型
	 * @param handler - 事件处理函数
	 */
	on<Type extends Keys<List>>(
		type: Type,
		handler: EventHandler<Type, List[Type]>,
	): void;
	/**
	 * 注册一次性事件监听器
	 * @param type - 要监听的事件类型
	 * @param handler - 事件处理函数
	 */
	once<Type extends Keys<List>>(
		type: Type,
		handler: EventHandler<Type, List[Type]>,
	): void;
	/**
	 * 移除事件监听器
	 * @param type - 要移除的事件类型
	 * @param handler - 要移除的事件处理函数
	 */
	off<Type extends Keys<List>>(
		type: Type,
		handler: EventHandler<Type, List[Type]>,
	): void;
}

/**
 * 事件管理类
 * @template List - 事件初始化列表
 * @template Types - 事件类型集合
 */
export class Events<
	List extends EventsInitList<List>,
	Types extends Keys<List> = Keys<List>,
> implements IEventSource<List>
{
	#subscriptions: EventSubscriptions<List> = {} as any;
	#onceSubscriptions: EventSubscriptions<List> = {} as any;
	/**
	 * 创建事件管理器实例
	 * @param eventTypes - 支持的事件类型数组
	 */
	constructor(eventTypes: Types[]) {
		for (const type of eventTypes) {
			this.#subscriptions[type] = new Set();
			this.#onceSubscriptions[type] = new Set();
		}
	}
	/**
	 * 触发指定事件
	 * @param event - 要触发的事件对象
	 */
	emit<Type extends Keys<List>>(event: List[Type] & IEventBasic<Type>) {
		for (const handler of this.#onceSubscriptions[event.type] ?? []) {
			runTask(handler, event);
		}
		for (const handler of this.#subscriptions[event.type] ?? []) {
			runTask(handler, event);
		}
		this.#onceSubscriptions[event.type]?.clear();
	}
	/**
	 * 注册事件监听器
	 * @param type - 要监听的事件类型
	 * @param handler - 事件处理函数
	 */
	on<Type extends Keys<List>>(
		type: Type,
		handler: EventHandler<Type, List[Type]>,
	) {
		this.#subscriptions[type]?.add(handler);
	}
	/**
	 * 注册一次性事件监听器
	 * @param type - 要监听的事件类型
	 * @param handler - 事件处理函数
	 */
	once<Type extends Keys<List>>(
		type: Type,
		handler: EventHandler<Type, List[Type]>,
	) {
		this.#onceSubscriptions[type]?.add(handler);
	}
	/**
	 * 移除事件监听器
	 * @param type - 要移除的事件类型
	 * @param handler - 要移除的事件处理函数
	 */
	off<Type extends Keys<List>>(
		type: Type,
		handler: EventHandler<Type, List[Type]>,
	) {
		this.#subscriptions[type]?.delete(handler);
		this.#onceSubscriptions[type]?.delete(handler);
	}
}

//#region API: Value
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

//#region API: Key
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

//#region API: Vector
export interface EventVectorInit<Target = any> extends EventBaseInit<Target> {
	x: number;
	y: number;
}

export interface IEventVector<Type extends string = string, Target = any>
	extends IEventBase<Type, Target> {
	readonly x: number;
	readonly y: number;
}

export class EventVector<Type extends string = string, Target = any>
	extends EventBase<Type, Target>
	implements IEventVector<Type, Target>
{
	#x: number;
	#y: number;
	constructor(type: Type, options: EventVectorInit<Target>) {
		super(type, options);
		this.#x = options.x;
		this.#y = options.y;
	}
	get x() {
		return this.#x;
	}
	get y() {
		return this.#y;
	}
}

//#region API: Error
export interface EventErrorInit<Target = any, Err extends Error = Error>
	extends EventBaseInit<Target> {
	error: Err;
}

export interface IEventError<
	Type extends string = string,
	Target = any,
	Err extends Error = Error,
> extends IEventBase<Type, Target> {
	readonly error: Err;
}

export class EventError<
		Type extends string = string,
		Target = any,
		Err extends Error = Error,
	>
	extends EventBase<Type, Target>
	implements IEventError<Type, Target, Err>
{
	#error: Err;
	constructor(type: Type, options: EventErrorInit<Target, Err>) {
		super(type, options);
		this.#error = options.error;
	}
	get error() {
		return this.#error;
	}
}

//#region API: Custom
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
