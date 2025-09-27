import {
	EventBase,
	EventBaseInit,
	EventError,
	EventErrorInit,
	EventHandler,
	Events,
	EventsList,
	EventValue,
	EventValueInit,
	IEventSource,
} from './events';
import { PromiseOr } from './function';

export type PluralFormatOptions = Partial<
	Record<Exclude<Intl.LDMLPluralRule, 'other'>, string>
> & {
	other: string;
	options?: Intl.NumberFormatOptions;
	type?: Intl.PluralRuleType;
};
export type EnumFormatOptions = Record<string, string>;

type FormatOptions =
	| PluralFormatOptions
	| EnumFormatOptions
	| Intl.DateTimeFormatOptions
	| Intl.ListFormatOptions
	| Intl.NumberFormatOptions
	| Intl.RelativeTimeFormatOptions;

type I18nMessage =
	| string
	| [
			string,
			{
				[key: string]: FormatOptions;
			},
	  ];

export type LocaleDict = {
	[key: string]: LocaleDict | I18nMessage;
};

type ComposedDict = Map<string, [locale: string, I18nMessage]>;

//#region Dict
type IntlOptions<
	Type extends string,
	Name extends string,
> = Type extends 'plural'
	? { [K in Name]: PluralFormatOptions }
	: Type extends 'enum'
		? { [K in Name]: EnumFormatOptions }
		: {
				[K in Name]?: Type extends 'date'
					? Intl.DateTimeFormatOptions
					: Type extends 'list'
						? Intl.ListFormatOptions
						: Type extends 'number'
							? Intl.NumberFormatOptions
							: Type extends 'relative'
								? Intl.RelativeTimeFormatOptions
								: never;
			};

type ParseOptions<T extends string> =
	T extends `${string}{${infer P}}${infer Rest}`
		? P extends `${infer Name}:${infer Type}`
			? IntlOptions<Type, Name> & ParseOptions<Rest>
			: ParseOptions<Rest>
		: unknown;

export function defineTranslation<T extends string, O extends ParseOptions<T>>(
	translation: T,
	options: O,
): [T, O] {
	return [translation, options];
}

export type LocaleDictDefine<D extends LocaleDict> = {
	[K in keyof D]?: D[K] extends [infer T extends string, any]
		? [string, ParseOptions<T>]
		: D[K] extends LocaleDict
			? LocaleDictDefine<D[K]>
			: D[K] extends string
				? string
				: never;
};

//#region Params

type ExtractMessageParams<T extends I18nMessage> = T extends string
	? ParseParams<T, never>
	: T extends [infer S, infer O extends Record<string, any>]
		? S extends string
			? ParseParams<S, O>
			: {}
		: {};

type ParseParams<
	T extends string,
	O extends Record<string, any> | never,
	Acc = {},
> = T extends `${string}{${infer P}}${infer Rest}`
	? P extends `${infer Name}:${infer Type}`
		? ParseParams<
				Rest,
				O,
				Acc &
					(Type extends 'enum'
						? O extends Record<string, any>
							? Name extends keyof O
								? O[Name] extends Record<string, any>
									? { [K in Name]: keyof O[Name] }
									: { [K in Name]: string }
								: { [K in Name]: string }
							: { [K in Name]: string }
						: Type extends keyof BaseTypeMap
							? { [K in Name]: BaseTypeMap[Type] }
							: { [K in Name]: any })
			>
		: ParseParams<Rest, O, Acc & { [K in P]: any }>
	: Acc;

type BaseTypeMap = {
	number: number;
	date: Date;
	plural: number;
	list: any[];
	relative: [number, Intl.RelativeTimeFormatUnit];
};

type FlattenParams<T, Prefix extends string = ''> = {
	[K in keyof T]: T[K] extends I18nMessage
		? {
				[P in `${Prefix}${Prefix extends '' ? '' : '.'}${K & string}`]: ExtractMessageParams<
					T[K]
				>;
			}
		: T[K] extends object
			? FlattenParams<
					T[K],
					`${Prefix}${Prefix extends '' ? '' : '.'}${K & string}`
				>
			: never;
}[keyof T] extends infer U
	? UnionToIntersection<U>
	: never;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
	k: infer I,
) => void
	? I
	: never;

export type FlatLocaleParams<T> = UnionToIntersection<FlattenParams<T>>;

type IsEmptyObject<T> = keyof T extends never ? true : false;
type RequiredParams<T> = IsEmptyObject<T> extends true ? [] : [params: T];

//#region Locale

export class LocaleLoadError extends Error {
	#errors: readonly Readonly<{ locale: string; error: unknown }>[];
	constructor(errors: { locale: string; error: unknown }[]) {
		super('Failed to load locales');
		this.#errors = Object.freeze(errors.map((e) => Object.freeze(e)));
	}
	get errors() {
		return this.#errors;
	}
}

function* flatten(dict: LocaleDict): Generator<[string, I18nMessage]> {
	const stack: { dict: LocaleDict; path: string }[] = [{ dict, path: '' }];

	while (stack.length > 0) {
		const { dict, path } = stack.pop()!;
		for (const [key, value] of Object.entries(dict)) {
			const newPath = path ? `${path}.${key}` : key;
			if (typeof value === 'string' || Array.isArray(value)) {
				yield [newPath, value];
				continue;
			}
			if (typeof value !== 'object') continue;
			if (value === null) continue;
			stack.push({ dict: value, path: newPath });
		}
	}
}

const PATTERN = /\{(.+?)(:.*?)?\}/g;
const PATTERN_SINGLE = /\{?\}/g;

function format(locale: string, type: string, option: any, arg: any): string {
	switch (type) {
		case 'plural': {
			const rules = new Intl.PluralRules(locale, {
				type: (option as PluralFormatOptions).type,
			});
			const replacement =
				(option as PluralFormatOptions)[rules.select(arg)] ??
				(option as PluralFormatOptions).other;
			const formatter = new Intl.NumberFormat(
				locale,
				(option as PluralFormatOptions).options,
			);
			return replacement.replace(PATTERN_SINGLE, formatter.format(arg));
		}
		case 'enum':
			return arg in option ? option[arg] : arg;
		case 'date':
			return new Intl.DateTimeFormat(locale, option).format(arg);
		case 'list':
			return new Intl.ListFormat(locale, option).format(arg);
		case 'number':
			return new Intl.NumberFormat(locale, option).format(arg);
		case 'relative':
			return new Intl.RelativeTimeFormat(locale, option).format(arg[0], arg[1]);
	}
	return String(arg);
}

function render(
	[locale, translate]: [string, I18nMessage],
	params: Record<string, any> = {},
): string {
	let str: string;
	let options: Record<string, FormatOptions>;
	if (typeof translate === 'string') {
		str = translate;
		options = {};
	} else {
		[str, options] = translate;
	}

	const cache = new Map<string, string>();
	return str.replace(PATTERN, (raw, name, _, type) => {
		if (cache.has(name)) return cache.get(name)!;
		if (!(name in params)) {
			cache.set(name, raw);
			return raw;
		}
		const text = format(locale, type, options[name], params[name]);
		cache.set(name, text);
		return text;
	});
}

export interface LocaleInit<D extends LocaleDict = LocaleDict> {
	/** 翻译源加载器 */
	loader: (locale: string) => PromiseOr<D | null>;
	/** 语言列表 */
	locales?: readonly string[];
}

interface LocaleEventsInit {
	/** 更新事件 */
	update: EventBaseInit<any>;
	/** 加载错误事件 */
	error: EventErrorInit<any, LocaleLoadError>;
}

export interface LocaleEvents extends EventsList<LocaleEventsInit> {}

export class Locale<
	D extends LocaleDict = LocaleDict,
	A extends FlatLocaleParams<D> = FlatLocaleParams<D>,
> implements IEventSource<LocaleEventsInit>
{
	#events = new Events<LocaleEventsInit>(['update', 'error']);
	#loader: (locale: string) => PromiseOr<D | null>;
	#locales: readonly string[];
	#loadedLocales: readonly string[] = [];
	#loaded = false;
	#dict: ComposedDict = new Map();
	constructor(init: LocaleInit<D>) {
		this.#loader = init.loader;
		this.#locales = Object.freeze(init.locales ?? []);
		this.reload();
	}
	/** 翻译源加载器 */
	get loader() {
		return this.#loader;
	}
	set loader(value) {
		if (typeof value !== 'function') return;
		this.#loader = value;
	}
	/**
	 * 语言列表
	 * @description
	 * 修改语言列表不会触发重新加载，
	 * 需手动调用 `reload()`
	 */
	get locales() {
		return this.#locales;
	}
	set locales(value) {
		if (!Array.isArray(value)) return;
		this.#locales = Object.freeze(value.filter((v) => typeof v === 'string'));
	}
	/** 加载的语言列表 */
	get loadedLocales() {
		return this.#loadedLocales;
	}
	/** 是否完成加载 */
	get loaded() {
		return this.#loaded;
	}
	/** 重新载入语言 */
	async reload(): Promise<LocaleLoadError | undefined> {
		this.#loaded = false;

		const dict: ComposedDict = new Map();
		const loadedLocales: string[] = [];
		const successLocales: string[] = [];
		const failedLocales: { locale: string; error: unknown }[] = [];
		for (const locale of [...this.#locales].reverse()) {
			if (loadedLocales.includes(locale)) continue;
			loadedLocales.push(locale);
			try {
				const load = await this.#loader(locale);
				if (!load) continue;
				for (const [k, v] of flatten(load)) {
					dict.set(k, [locale, v]);
				}
				successLocales.push(locale);
			} catch (error) {
				failedLocales.push({ locale, error });
			}
		}

		this.#loadedLocales = Object.freeze(successLocales);
		this.#dict = dict;

		let error: LocaleLoadError | undefined;
		if (failedLocales.length > 0) {
			error = new LocaleLoadError(failedLocales);
		}
		this.#events.emit(new EventBase('update', { target: this }));
		if (error)
			this.#events.emit(new EventError('error', { target: this, error }));

		this.#loaded = true;

		return error;
	}
	/** 获取原始翻译 */
	getStringOrNull<K extends keyof A | (string & {})>(
		key: K,
		...[params]: K extends keyof A
			? RequiredParams<A[K]>
			: [Record<string, any> | undefined] | []
	): string | null {
		const translate = this.#dict.get(key as string);
		if (!translate) return null;
		return render(translate, params as Record<string, any>);
	}
	/** 获取翻译 */
	getString<K extends keyof A | (string & {})>(
		key: K,
		...[params]: K extends keyof A
			? RequiredParams<A[K]>
			: [Record<string, any> | undefined] | []
	): string {
		const translate = this.#dict.get(key as string);
		if (!translate) return key as string;
		return render(translate, params as Record<string, any>);
	}
	on<Type extends keyof LocaleEventsInit>(
		type: Type,
		handler: EventHandler<Type, LocaleEventsInit[Type], any>,
	): void {
		this.#events.on(type, handler);
	}
	once<Type extends keyof LocaleEventsInit>(
		type: Type,
		handler: EventHandler<Type, LocaleEventsInit[Type], any>,
	): void {
		this.#events.once(type, handler);
	}
	off<Type extends keyof LocaleEventsInit>(
		type: Type,
		handler: EventHandler<Type, LocaleEventsInit[Type], any>,
	): void {
		this.#events.off(type, handler);
	}
	/** 修补语言列表 */
	static patchFallbacks(locales: string[], fallbacks?: string[]): string[] {
		const result: string[] = [];
		for (let locale of locales) {
			while (locale.length > 0) {
				if (!result.includes(locale)) result.push(locale);
				const j = locale.lastIndexOf('-');
				if (j === -1) break;
				locale = locale.slice(0, j);
				if (locales.includes(locale)) break;
			}
		}
		for (const locale of fallbacks ?? []) {
			if (result.includes(locale)) continue;
			result.push(locale);
		}
		return result;
	}
}

//#region Manager

interface LocaleManagerEventsInit {
	update: EventValueInit<LocaleManager>;
}

export interface LocaleManagerEvents
	extends EventsList<LocaleManagerEventsInit> {}

export class LocaleManager implements IEventSource<LocaleManagerEventsInit> {
	#events = new Events<LocaleManagerEventsInit>(['update']);
	#locales = new Map<string, [Locale, () => void]>();
	/**
	 * 注册命名空间
	 * @returns 返回 `false` 表示该命名空间已被占用
	 */
	registerLocale(namespace: string, init: LocaleInit | Locale) {
		if (this.#locales.has(namespace)) return false;
		if (!(init instanceof Locale)) init = new Locale(init);
		const handler = () =>
			this.#events.emit(
				new EventValue('update', { target: this, value: namespace }),
			);
		(init as Locale).on('update', handler);
		this.#locales.set(namespace, [init as Locale, handler]);
		return true;
	}
	/** 获取命名空间 */
	getLocale<D extends LocaleDict = LocaleDict>(namespace: string) {
		return this.#locales.get(namespace)?.[0] as Locale<D> | undefined;
	}
	/** 移除命名空间 */
	removeLocale(namespace: string) {
		const locale = this.#locales.get(namespace);
		if (!locale) return false;
		locale[0].off('update', locale[1]);
		this.#locales.delete(namespace);
		return true;
	}
	/** 获取翻译 */
	getString(namespace: string, key: string, params?: Record<string, any>) {
		return (
			this.#locales.get(namespace)?.[0].getStringOrNull(key, params) ??
			(namespace ? `${namespace}:${key}` : key)
		);
	}
	/** 更新所有命名空间的语言列表 */
	async updateLocales(locales: readonly string[]) {
		for (const [locale] of this.#locales.values()) {
			locale.locales = locales;
			await locale.reload();
		}
	}
	on<Type extends keyof LocaleManagerEventsInit>(
		type: Type,
		handler: EventHandler<Type, LocaleManagerEventsInit[Type], any>,
	): void {
		this.#events.on(type, handler);
	}
	once<Type extends keyof LocaleManagerEventsInit>(
		type: Type,
		handler: EventHandler<Type, LocaleManagerEventsInit[Type], any>,
	): void {
		this.#events.once(type, handler);
	}
	off<Type extends keyof LocaleManagerEventsInit>(
		type: Type,
		handler: EventHandler<Type, LocaleManagerEventsInit[Type], any>,
	): void {
		this.#events.off(type, handler);
	}
}
