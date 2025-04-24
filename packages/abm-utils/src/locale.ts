import {
	EventBase,
	EventBaseInit,
	EventHandler,
	Events,
	EventsList,
	IEventSource,
} from './events';
import { PromiseOr, runTask } from './function';

export interface LocaleDriver {
	getString(key: string, params?: LocaleParams, namespace?: string): string;
	addUpdateListener(listener: (namespace: string) => any): void;
	rmUpdateListener(listener: (namespace: string) => any): void;
}

/**
 * 扁平资源类型
 * @template LookupResult 查找结果类型
 * @template Key 键名类型
 */
export type FlatLocaleSource<LookupResult, Key extends string = string> = {
	[key in Key]: LookupResult;
};

/**
 * 嵌套资源类型
 * @template LookupResult 查找结果类型
 */
export type NestedLocaleSource<LookupResult> = {
	[key in string]: LookupResult | NestedLocaleSource<LookupResult>;
};

/**
 * 模板参数
 */
export type LocaleParams<Key extends string = string> = {
	[key in Key]: any;
};

//#region Base

/**
 * 基础本地化初始化配置接口
 * @template Source 资源数据类型
 * @template LookupResult 查找结果类型
 * @template Key 键名类型 (默认为 string)
 * @template Locale 区域代码类型 (默认为 string)
 * @template This 当前类类型 (用于 this 类型推断)
 */
export interface BaseLocalizationInit<
	Source,
	LookupResult,
	Key extends string = string,
	Locale extends string = string,
	This extends BaseLocalization<
		Source,
		LookupResult,
		Key,
		Locale
	> = BaseLocalization<Source, LookupResult, Key, Locale>,
> {
	/**
	 * 资源加载器函数
	 * @param locale 要加载的区域代码
	 * @returns 返回 Promise 或同步值，表示加载的资源数据或 null
	 */
	sourceLoader: (this: This, locale: Locale) => PromiseOr<Source | null>;
	/**
	 * 资源合成器函数，用于合并多个资源
	 * @param sources 要合并的资源数组
	 * @returns 返回 Promise 或同步值，表示合并后的资源
	 */
	sourceComposer?: (this: This, sources: Source[]) => PromiseOr<Source>;
	/**
	 * 资源查找函数
	 * @param source 要查找的资源
	 * @param key 查找的键名
	 * @returns 返回查找结果或 null
	 */
	lookup: (this: This, source: Source, key: Key) => LookupResult | null;
	/**
	 * 模板后处理函数
	 * @param template 查找得到的模板
	 * @param params 可选的模板参数
	 * @returns 返回处理后的字符串
	 */
	postProcess: (
		this: This,
		template: LookupResult,
		params?: LocaleParams,
	) => string;
	/** 默认资源 */
	defaultSources?: Source[];
	/** 默认区域代码 */
	defaultLocales?: Locale[];
}

interface BaseLocalizationEventsInit {
	update: EventBaseInit<BaseLocalization<any, any, any, any>>;
}

export interface BaseLocalizationEvents
	extends EventsList<BaseLocalizationEventsInit> {}

function checkLocales(locales?: string[]): boolean {
	return Array.isArray(locales) && locales.every((v) => typeof v === 'string');
}

/**
 * 基础本地化类
 * @template Source 资源数据类型
 * @template LookupResult 查找结果类型
 * @template Key 键名类型 (默认为 string)
 * @template Locale 区域代码类型 (默认为 string)
 */
export class BaseLocalization<
	Source,
	LookupResult,
	Key extends string = string,
	Locale extends string = string,
> implements IEventSource<BaseLocalizationEventsInit>
{
	#events = new Events<BaseLocalizationEventsInit>(['update']);
	#sources: Source[] = [];
	#selectedLocales: Locale[] = [];
	#loadedLocales: Locale[] = [];
	#defaultLocales: Locale[] = [];
	#sourceLoader: (this: this, locale: Locale) => PromiseOr<Source | null>;
	#sourceComposer?: (this: this, sources: Source[]) => PromiseOr<Source>;
	#lookup: (this: this, source: Source, key: Key) => LookupResult | null;
	#postProcess: (
		this: this,
		template: LookupResult,
		params?: LocaleParams,
	) => string;
	/**
	 * 创建本地化实例
	 * @param init 初始化配置对象
	 * @throws 当参数不符合要求时抛出 TypeError
	 */
	constructor(init: BaseLocalizationInit<Source, LookupResult, Key, Locale>) {
		if (typeof init !== 'object') throw new TypeError('init must be an object');
		if (typeof init.sourceLoader !== 'function')
			throw new TypeError('sourceLoader must be a function');
		if (typeof init.lookup !== 'function')
			throw new TypeError('lookup must be a function');
		if (typeof init.postProcess !== 'function')
			throw new TypeError('postProcess must be a function');

		this.#sourceLoader = init.sourceLoader;
		this.#lookup = init.lookup;
		this.#postProcess = init.postProcess;
		if (typeof init.sourceComposer === 'function') {
			this.#sourceComposer = init.sourceComposer;
		}
		if (Array.isArray(init.defaultSources)) {
			this.#sources.push(...init.defaultSources);
		}
		if (checkLocales(init.defaultLocales)) {
			this.#selectedLocales.push(...init.defaultLocales!);
			this.#loadedLocales.push(...init.defaultLocales!);
			this.#defaultLocales.push(...init.defaultLocales!);
		}
	}
	//#region Events
	on<Type extends keyof BaseLocalizationEventsInit>(
		type: Type,
		handler: EventHandler<Type, BaseLocalizationEventsInit[Type], any>,
	): void {
		this.#events.on(type, handler);
	}
	once<Type extends keyof BaseLocalizationEventsInit>(
		type: Type,
		handler: EventHandler<Type, BaseLocalizationEventsInit[Type], any>,
	): void {
		this.#events.once(type, handler);
	}
	off<Type extends keyof BaseLocalizationEventsInit>(
		type: Type,
		handler: EventHandler<Type, BaseLocalizationEventsInit[Type], any>,
	): void {
		this.#events.off(type, handler);
	}
	//#region Source
	/**
	 * 更新区域设置并加载对应资源
	 * @param locales 新的区域代码数组
	 * @returns 返回 Promise，解析为错误对象或 undefined
	 */
	async updateLocales(locales: Locale[]): Promise<Error | undefined> {
		if (!checkLocales(locales))
			return new TypeError('locales must be a array of string');
		const prepend = [...locales, ...this.#defaultLocales].filter(
			(v, i, a) => a.indexOf(v) === i,
		);
		let sources: Source[] = [];
		const loaded: Locale[] = [];
		for (const locale of prepend) {
			const source = await this.#sourceLoader(locale);
			if (source === null) continue;
			loaded.push(locale);
			sources.push(source);
		}
		if (this.#sourceComposer) {
			sources = [await this.#sourceComposer(sources)];
		}
		this.#selectedLocales = [...locales];
		this.#loadedLocales = loaded;
		this.#sources = sources;
		this.#events.emit(new EventBase('update', { target: this }));
		return;
	}
	/**
	 * 重新加载当前选定的区域资源
	 * @returns 返回 Promise，解析为错误对象或 undefined
	 */
	reloadLocales() {
		return this.updateLocales(this.#selectedLocales);
	}
	/** 获取当前选定的区域代码数组 (副本) */
	get selectedLocales(): Locale[] {
		return [...this.#selectedLocales];
	}
	/** 获取已成功加载的区域代码数组 (副本) */
	get loadedLocales(): Locale[] {
		return [...this.#loadedLocales];
	}
	/** 获取默认区域代码数组 (副本) */
	get defaultLocales(): Locale[] {
		return [...this.#defaultLocales];
	}
	/** 设置默认区域代码数组 */
	set defaultLocales(value: Locale[]) {
		if (!checkLocales(value)) return;
		this.#defaultLocales = [...value];
	}
	//#region Lookup
	/**
	 * 查找模板
	 * @protected
	 * @param key 要查找的键名
	 * @returns 返回查找结果或 null
	 */
	private lookup(key: Key): LookupResult | null {
		for (const source of this.#sources) {
			const template = this.#lookup(source, key);
			if (template === null) continue;
			return template;
		}
		return null;
	}
	/**
	 * 获取本地化字符串
	 * @description 如果找不到对应的本地化字符串，则返回 null
	 * @param key 要查找的键名
	 * @param params 可选的模板参数
	 * @returns 返回处理后的字符串或 null (未找到时)
	 */
	getStringOrNull(key: Key, params?: LocaleParams): string | null {
		const template = this.lookup(key);
		if (!template) return null;
		return this.#postProcess(template, params);
	}
	/**
	 * 获取本地化字符串
	 * @description 如果找不到对应的本地化字符串，则返回键名
	 * @param key 要查找的键名
	 * @param params 可选的模板参数
	 * @returns 返回处理后的字符串，如果找不到则返回键名
	 */
	getString(key: Key, params?: LocaleParams): string {
		return this.getStringOrNull(key, params) ?? key;
	}
	//#region Static
	/**
	 * 简单资源查找器
	 * @description 直接从平面对象中查找键值
	 * @template LookupResult 查找结果类型
	 * @template Key 键名类型
	 * @template Source 资源类型 (默认为 Record<Key, LookupResult>)
	 * @param source 资源对象
	 * @param key 要查找的键名
	 * @returns 返回查找结果或 null (未找到时)
	 */
	static FLAT_LOOKUP<
		LookupResult,
		Key extends string = string,
		Source extends
			FlatLocaleSource<LookupResult> = FlatLocaleSource<LookupResult>,
	>(source: Source, key: Key): LookupResult | null {
		if (key in source) return source[key];
		return null;
	}
	/**
	 * 创建嵌套资源查找器
	 * @description 支持通过分隔符查找嵌套对象中的值
	 * @template LookupResult 查找结果类型
	 * @template Key 键名类型
	 * @template Source 资源类型 (默认为 NestedSource<LookupResult, Key>)
	 * @param separator 键名分隔符 (字符串或正则表达式)
	 * @param validator 值验证器函数，用于验证找到的值是否有效
	 * @returns 返回配置好的查找函数
	 */
	static createNestedLookup<
		LookupResult,
		Key extends string = string,
		Source extends
			NestedLocaleSource<LookupResult> = NestedLocaleSource<LookupResult>,
	>(separator: string | RegExp, validator: (data: unknown) => boolean) {
		return (source: Source, key: Key): LookupResult | null => {
			const keys = key.split(separator);
			let target: any = source;
			for (const key of keys) {
				if (typeof target !== 'object') return null;
				target = target[key];
			}
			if (validator(target)) return target;
			return null;
		};
	}
	/**
	 * 默认模板变量匹配正则表达式
	 * @description 用于匹配 ${key} 格式的模板变量
	 */
	static DEFAULT_TEMPLATE_VARIABLE_PATTERN = /(?<!\\)\${(.+?)}/g;
	/**
	 * 默认模板变量键提取器
	 * @description 从匹配的模板变量中提取键名
	 * @param _substring 匹配到的完整字符串
	 * @param args 正则匹配的捕获组
	 * @returns 返回提取的键名或 null
	 */
	static DEFAULT_VARIABLE_KEY_EXTRACTOR(
		_substring: string,
		...args: any[]
	): string | null {
		return args[0] ?? null;
	}
	/**
	 * 默认值格式化器
	 * @description 将各种类型的值格式化为字符串
	 * @param value 要格式化的值
	 * @returns 返回格式化后的字符串
	 */
	static DEFAULT_VALUE_FORMATTER(value: unknown): string {
		switch (typeof value) {
			case 'string':
			case 'number':
			case 'bigint':
			case 'boolean':
			case 'symbol':
			case 'function':
				return value.toString();
			case 'undefined':
				return 'undefined';
			case 'object':
				if (value === null) return 'null';
				try {
					if ('toString' in value) return value.toString();
				} catch {}
				return String(value);
		}
	}
	/**
	 * 创建模板处理器
	 * @description 生成一个处理模板字符串的函数，替换其中的变量占位符
	 * @template LookupResult 模板类型 (默认为 string)
	 * @param removeUnmatched 是否移除未匹配的变量 (默认保留)
	 * @param pattern 变量匹配正则表达式 (默认为 DEFAULT_TEMPLATE_VARIABLE_PATTERN)
	 * @param keyExtractor 键名提取函数 (默认为 defaultVariableKeyExtractor)
	 * @param formatter 值格式化函数 (默认为 defaultValueFormatter)
	 * @returns 返回配置好的模板处理函数
	 */
	static createTemplateProcessor<LookupResult extends string = string>(
		removeUnmatched?: boolean,
		pattern: RegExp = BaseLocalization.DEFAULT_TEMPLATE_VARIABLE_PATTERN,
		keyExtractor: (
			substring: string,
			...args: any[]
		) => string | null = BaseLocalization.DEFAULT_VARIABLE_KEY_EXTRACTOR,
		formatter: (
			value: unknown,
			key: string,
		) => string = BaseLocalization.DEFAULT_VALUE_FORMATTER,
	) {
		return (template: LookupResult, params?: LocaleParams): string => {
			return template.replace(pattern, (substring, ...args) => {
				const key = keyExtractor(substring, ...args);
				if (key === null) return substring;
				if (!(params && key in params)) return removeUnmatched ? '' : substring;
				return formatter(params[key], key);
			});
		};
	}
}

//#region Namespaced

/**
 * 带命名空间的本地化初始化配置接口
 * @template Source 资源数据类型
 * @template LookupResult 查找结果类型
 * @template Key 键名类型 (默认为 string)
 * @template Locale 区域代码类型 (默认为 string)
 * @template This 当前类类型 (用于 this 类型推断)
 */
export interface NamespacedLocalizationInit<
	Source,
	LookupResult,
	Key extends string = string,
	Locale extends string = string,
	This extends NamespacedLocalization<
		Source,
		LookupResult,
		Key,
		Locale
	> = NamespacedLocalization<Source, LookupResult, Key, Locale>,
> {
	/**
	 * 资源加载器函数
	 * @param namespace 命名空间
	 * @param locale 要加载的区域代码
	 * @returns 返回 Promise 或同步值，表示加载的资源数据或 null
	 */
	sourceLoader: (
		this: This,
		namespace: string,
		locale: Locale,
	) => PromiseOr<Source | null>;
	/**
	 * 资源合成器函数，用于合并多个资源
	 * @param sources 要合并的资源数组
	 * @returns 返回 Promise 或同步值，表示合并后的资源
	 */
	sourceComposer?: (this: This, sources: Source[]) => PromiseOr<Source>;
	/**
	 * 资源查找函数
	 * @param source 要查找的资源
	 * @param key 查找的键名
	 * @returns 返回查找结果或 null
	 */
	lookup: (this: This, source: Source, key: Key) => LookupResult | null;
	/**
	 * 模板后处理函数
	 * @param template 查找得到的模板
	 * @param params 可选的模板参数
	 * @returns 返回处理后的字符串
	 */
	postProcess: (
		this: This,
		template: LookupResult,
		params?: LocaleParams,
	) => string;
	/** 默认资源 */
	defaultSources?: Map<string, Source[]>;
	/** 默认区域代码 */
	defaultLocales?: Locale[];
	/** 默认命名空间 */
	defaultNamespace?: string;
}

export type NamespacedLocalizationUpdateHandler = EventHandler<
	string,
	EventBaseInit<NamespacedLocalization<any, any, any, any>>,
	any
>;

/**
 * 带命名空间的本地化管理类
 * @template Source 资源数据类型
 * @template LookupResult 查找结果类型
 * @template Key 键名类型 (默认为 string)
 * @template Locale 区域代码类型 (默认为 string)
 */
export class NamespacedLocalization<
	Source,
	LookupResult,
	Key extends string = string,
	Locale extends string = string,
> implements
		LocaleDriver,
		IEventSource<{
			[namespace: string]: EventBaseInit<
				NamespacedLocalization<any, any, any, any>
			>;
		}>
{
	#updateListener = new Set<(namespace: string) => any>();
	#subscriptions = new Map<string, Set<NamespacedLocalizationUpdateHandler>>();
	#onceSubscriptions = new Map<
		string,
		Set<NamespacedLocalizationUpdateHandler>
	>();
	#source = new Map<
		string,
		BaseLocalization<Source, LookupResult, Key, Locale>
	>();
	#selectedLocales: Locale[] = [];
	#defaultLocales: Locale[] = [];
	#defaultNamespace = '';
	#sourceLoader: (
		this: this,
		namespace: string,
		locale: Locale,
	) => PromiseOr<Source | null>;
	#sourceComposer?: (this: this, sources: Source[]) => PromiseOr<Source>;
	#lookup: (this: this, source: Source, key: Key) => LookupResult | null;
	#postProcess: (
		this: this,
		template: LookupResult,
		params?: LocaleParams,
	) => string;
	/**
	 * 创建带命名空间的本地化实例
	 * @param init 初始化配置对象
	 * @throws 当参数不符合要求时抛出 TypeError
	 */
	constructor(
		init: NamespacedLocalizationInit<Source, LookupResult, Key, Locale>,
	) {
		if (typeof init !== 'object') throw new TypeError('init must be an object');
		if (typeof init.sourceLoader !== 'function')
			throw new TypeError('sourceLoader must be a function');
		if (typeof init.lookup !== 'function')
			throw new TypeError('lookup must be a function');
		if (typeof init.postProcess !== 'function')
			throw new TypeError('postProcess must be a function');

		this.#sourceLoader = init.sourceLoader;
		this.#lookup = init.lookup;
		this.#postProcess = init.postProcess;
		if (typeof init.sourceComposer === 'function') {
			this.#sourceComposer = init.sourceComposer;
		}
		if (checkLocales(init.defaultLocales)) {
			this.#selectedLocales.push(...init.defaultLocales!);
			this.#defaultLocales.push(...init.defaultLocales!);
		}
		if (typeof init.defaultNamespace === 'string') {
			this.#defaultNamespace = init.defaultNamespace;
		}
		if (!(init.defaultSources instanceof Map)) return;
		for (const [namespace, sources] of init.defaultSources) {
			if (typeof namespace !== 'string') continue;
			this.#createSource(namespace, sources);
		}
	}
	//#region Events
	/**
	 * 触发指定命名空间的更新事件
	 * @private
	 * @param namespace 要触发事件的命名空间
	 */
	#emit(namespace: string) {
		for (const listener of this.#updateListener) {
			runTask(listener, namespace);
		}
		const event = new EventBase(namespace, { target: this });
		for (const handler of this.#onceSubscriptions.get(namespace) ?? []) {
			runTask(handler, event);
		}
		for (const handler of this.#subscriptions.get(namespace) ?? []) {
			runTask(handler, event);
		}
		this.#onceSubscriptions.delete(namespace);
	}
	/**
	 * 注册命名空间更新事件监听器
	 * @template Namespace 命名空间类型
	 * @param namespace 要监听的命名空间
	 * @param handler 事件处理函数
	 */
	on<Namespace extends string>(
		namespace: string,
		handler: EventHandler<
			Namespace,
			EventBaseInit<NamespacedLocalization<any, any, any, any>>,
			any
		>,
	): void {
		let handlers = this.#subscriptions.get(namespace);
		if (!handlers) {
			handlers = new Set();
			this.#subscriptions.set(namespace, handlers);
		}
		handlers.add(handler as NamespacedLocalizationUpdateHandler);
	}
	/**
	 * 注册一次性命名空间更新事件监听器
	 * @template Namespace 命名空间类型
	 * @param namespace 要监听的命名空间
	 * @param handler 事件处理函数
	 */
	once<Namespace extends string>(
		namespace: Namespace,
		handler: EventHandler<
			Namespace,
			EventBaseInit<NamespacedLocalization<any, any, any, any>>,
			any
		>,
	): void {
		let handlers = this.#onceSubscriptions.get(namespace);
		if (!handlers) {
			handlers = new Set();
			this.#onceSubscriptions.set(namespace, handlers);
		}
		handlers.add(handler as NamespacedLocalizationUpdateHandler);
	}
	/**
	 * 移除命名空间更新事件监听器
	 * @template Namespace 命名空间类型
	 * @param namespace 要移除监听的命名空间
	 * @param handler 要移除的事件处理函数
	 */
	off<Namespace extends string>(
		namespace: Namespace,
		handler: EventHandler<
			Namespace,
			EventBaseInit<NamespacedLocalization<any, any, any, any>>,
			any
		>,
	): void {
		this.#subscriptions
			.get(namespace)
			?.delete(handler as NamespacedLocalizationUpdateHandler);
		this.#onceSubscriptions
			.get(namespace)
			?.delete(handler as NamespacedLocalizationUpdateHandler);
	}
	addUpdateListener(listener: (namespace: string) => any): void {
		this.#updateListener.add(listener);
	}
	rmUpdateListener(listener: (namespace: string) => any): void {
		this.#updateListener.delete(listener);
	}
	//#region Source
	/**
	 * 创建指定命名空间的资源实例
	 * @private
	 * @param namespace 命名空间名称
	 * @param sources 默认资源数组
	 * @returns 返回创建的 BaseLocalization 实例
	 */
	#createSource(namespace: string, sources?: Source[]) {
		const locale = new BaseLocalization<Source, LookupResult, Key, Locale>({
			sourceLoader: (locale) => this.#sourceLoader(namespace, locale),
			sourceComposer: this.#sourceComposer
				? (sources) => this.#sourceComposer!(sources)
				: undefined,
			lookup: (source, key) => this.#lookup(source, key),
			postProcess: (template, params) => this.#postProcess(template, params),
			defaultSources: sources,
			defaultLocales: this.#defaultLocales,
		});
		locale.on('update', () => this.#emit(namespace));
		this.#source.set(namespace, locale);
		return locale;
	}
	/**
	 * 更新所有命名空间的区域设置
	 * @param locales 新的区域代码数组
	 * @returns 返回 Promise，解析为错误对象或 undefined
	 */
	async updateLocales(locales: Locale[]): Promise<Error | undefined> {
		if (!checkLocales(locales))
			return new TypeError('locales must be a array of string');
		this.#selectedLocales = [...locales];
		for (const locale of this.#source.values()) {
			await locale.updateLocales(locales);
		}
		return;
	}
	/**
	 * 重新加载指定命名空间的区域资源
	 * @param namespaces 要重新加载的命名空间数组 (不传则重新加载所有命名空间)
	 * @returns 返回 Promise
	 */
	async reloadLocales(namespaces?: string[]): Promise<void> {
		if (!Array.isArray(namespaces)) namespaces = [...this.#source.keys()];
		for (const namespace of namespaces) {
			await this.#source.get(namespace)?.updateLocales(this.#selectedLocales);
		}
	}
	/** 获取当前选定的区域代码数组 (副本) */
	get selectedLocales(): Locale[] {
		return [...this.#selectedLocales];
	}
	/** 获取默认区域代码数组 (副本) */
	get defaultLocales(): Locale[] {
		return [...this.#defaultLocales];
	}
	/** 设置默认区域代码数组 */
	set defaultLocales(value: Locale[]) {
		if (!checkLocales(value)) return;
		this.#defaultLocales = [...value];
	}
	/** 获取各命名空间已加载的区域代码映射表 */
	get loadedLocales(): Map<string, Locale[]> {
		const result = new Map<string, Locale[]>();
		for (const [namespace, locale] of this.#source) {
			result.set(namespace, locale.loadedLocales);
		}
		return result;
	}
	/** 默认命名空间 */
	get defaultNamespace(): string {
		return this.#defaultNamespace;
	}
	set defaultNamespace(value: string) {
		if (typeof value !== 'string') return;
		this.#defaultNamespace = value;
	}
	/** 当前所有命名空间名称数组 */
	get namespaces(): string[] {
		return [...this.#source.keys()];
	}
	set namespaces(value: string[]) {
		if (!Array.isArray(value)) return;
		const namespaces = value.filter(
			(v, i, a) => typeof v === 'string' && a.indexOf(v) === i,
		);
		for (const namespace of [...this.#source.keys()]) {
			if (namespaces.includes(namespace)) continue;
			this.#source.delete(namespace);
		}
		for (const namespace of namespaces) {
			if (this.#source.has(namespace)) continue;
			const locale = this.#createSource(namespace);
			locale.updateLocales(this.#defaultLocales);
		}
	}
	//#region Lookup
	/**
	 * 获取指定命名空间的本地化字符串
	 * @description 如果找不到对应的本地化字符串，则返回 null
	 * @param key 要查找的键名 (支持 "namespace:key" 格式)
	 * @param params 可选的模板参数
	 * @param namespace 指定命名空间 (可选，如果不指定则从 key 中解析或使用默认命名空间)
	 * @returns 返回处理后的字符串或 null (未找到时)
	 */
	getStringOrNull(
		key: Key,
		params?: LocaleParams,
		namespace?: string,
	): string | null {
		if (typeof namespace !== 'string') {
			const i = key.indexOf(':');
			if (i !== -1) {
				namespace = key.slice(0, i);
				key = key.slice(i + 1) as Key;
			} else {
				namespace = this.#defaultNamespace;
			}
		}
		return this.#source.get(namespace)?.getStringOrNull(key, params) ?? null;
	}
	/**
	 * 获取指定命名空间的本地化字符串
	 * @description 如果找不到对应的本地化字符串，则返回键名 (带命名空间前缀)
	 * @param key 要查找的键名 (支持 "namespace:key" 格式)
	 * @param params 可选的模板参数
	 * @param namespace 指定命名空间 (可选，如果不指定则从 key 中解析或使用默认命名空间)
	 * @returns 返回处理后的字符串，如果找不到则返回带命名空间的键名
	 */
	getString(key: Key, params?: LocaleParams, namespace?: string): string {
		let result = this.getStringOrNull(key, params, namespace);
		if (result !== null) return result;
		result = '';
		if (namespace) result += `${namespace}:`;
		result += key;
		return result;
	}
}

export async function createSimpleLocaleDriver<
	Source extends FlatLocaleSource<string> = FlatLocaleSource<string>,
	Key extends string = string,
	Locale extends string = string,
>(
	sourceLoader: (namespace: string, locale: Locale) => PromiseOr<Source | null>,
) {
	const defaultLocales = navigator.languages.map(
		(v) => v.split('-')[0] as Locale,
	);
	const defaultSources: Source[] = [];
	for (const locale of defaultLocales) {
		const sources = await sourceLoader('', locale);
		if (sources) defaultSources.push(sources);
	}
	const map = new Map<string, Source[]>();
	map.set('', defaultSources);
	return new NamespacedLocalization<Source, string, Key, Locale>({
		sourceLoader,
		lookup: BaseLocalization.FLAT_LOOKUP,
		postProcess: BaseLocalization.createTemplateProcessor(),
		defaultSources: map,
		defaultLocales,
	});
}
