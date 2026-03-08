import { type ArrayOr, asArray } from './collection/array';
import { zip } from './collection/iter';
import { EventEmitter } from './event';
import { type PromiseOr, run } from './function';

//#region Define

/** 本地化定义 */
// biome-ignore lint/suspicious/noEmptyInterface: Empty by default
export interface LocaleRegistry {}

/** 本地化消息 */
type LocaleMessage = string | [string, Record<string, FormatOptions>];

/** 本地化词典 */
export type LocaleDict = {
	[key: string]: LocaleMessage | LocaleDict;
};

/** 复数格式化选项 */
export type PluralFormatOptions = Partial<
	Record<Exclude<Intl.LDMLPluralRule, 'other'>, string>
> & {
	other: string;
	options?: Intl.NumberFormatOptions;
	type?: Intl.PluralRuleType;
};
/** 枚举格式化选项 */
export type EnumFormatOptions = Record<string, any>;

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

type TranslationOptions<T extends string> =
	T extends `${string}{${infer P}}${infer Rest}`
		? P extends `${infer Name}:${infer Type}`
			? IntlOptions<Type, Name> & TranslationOptions<Rest>
			: TranslationOptions<Rest>
		: {};

/** 定义翻译 */
export function defineTranslation<
	T extends string,
	O extends TranslationOptions<T>,
>(translation: T, options: O): [T, O] {
	return [translation, options];
}

/**
 * 本地化语言包定义，用于完整定义一种语言的翻译
 * @description
 * 此类型用于提取本地化字典的完整类型结构，通常用于扩展 LocaleRegistry。
 * 它代表一个完整的语言包，包含该语言的所有必要翻译项。
 * @example
 * const zh = { greet: '你好' } as const satisfies LocaleDict;
 * declare module 'abm-utils' {
 *   interface LocaleRegistry extends LocalePackage<typeof zh> {}
 * }
 */
export type LocalePackage<T extends LocaleDict> = T;

type VariantOptions<L extends string, O> = TranslationOptions<L> & {
	[K in keyof O &
		keyof TranslationOptions<L>]: TranslationOptions<L>[K] extends EnumFormatOptions
		? Record<keyof O[K], any>
		: {};
};

/**
 * 部分本地化语言包，确保结构一致性但允许缺失翻译项
 * @description
 * 此类型用于定义其他语言的翻译包，确保与基准语言包有相同的结构，
 * 但允许部分翻译项缺失（缺失时会回退到链中的前一个语言包）。
 * 这适用于创建多语言变体，支持逐步回退的翻译机制。
 * @example
 * // 基准语言包
 * const zh = { ui: { confirm: '确定', cancel: '取消' } };
 * // 英文语言包，可选覆盖部分翻译
 * const en: LocaleVariant<typeof zh> = {
 *   ui: { confirm: 'Confirm' }
 * };
 */
export type LocaleVariant<T extends LocaleDict> = {
	[K in keyof T]?: T[K] extends LocaleDict
		? LocaleVariant<T[K]>
		: T[K] extends [infer L extends string, infer O]
			? keyof O extends never
				? string | [string, O]
				: [string, VariantOptions<L, O>]
			: string;
};

//#region Translate

type Join<K, P> = K extends string
	? P extends string
		? `${K}.${P}`
		: never
	: never;

export type LocaleKey<T extends object = LocaleRegistry> = {
	[K in keyof T]: T[K] extends LocaleMessage
		? K
		: T[K] extends object
			? Join<K, LocaleKey<T[K]>>
			: never;
}[keyof T];

type BaseTypeMap = {
	number: number;
	date: Date;
	plural: number;
	list: any[];
	relative: [number, Intl.RelativeTimeFormatUnit];
};

type TranslationParamType<
	Type extends string,
	Name extends string,
	Enums,
> = Type extends keyof BaseTypeMap
	? BaseTypeMap[Type]
	: Type extends 'enum'
		? Name extends keyof Enums
			? keyof Enums[Name]
			: never
		: never;

type TranslationParams<
	T extends string,
	Enums,
> = T extends `${string}{${infer P}}${infer Rest}`
	? P extends `${infer Name}:${infer Type}`
		? {
				[K in Name]: TranslationParamType<Type, Name, Enums>;
			} & TranslationParams<Rest, Enums>
		: { [K in P]: string } & TranslationParams<Rest, Enums>
	: {};

type TranslationAtKeyWithParams<
	Translations,
	Key extends string,
> = Key extends `${infer First}.${infer Rest}`
	? First extends keyof Translations
		? TranslationAtKeyWithParams<Translations[First], Rest>
		: never
	: Key extends keyof Translations
		? Translations[Key]
		: never;

type NormalizedTranslationAtKey<T> =
	T extends ReturnType<typeof defineTranslation>
		? T
		: [T, ReturnType<typeof defineTranslation>[1]];

type NormalizedTranslationAtKeyWithParams<Key extends string> =
	NormalizedTranslationAtKey<TranslationAtKeyWithParams<LocaleRegistry, Key>>;

export type LocaleParams<K extends LocaleKey> = TranslationParams<
	NormalizedTranslationAtKeyWithParams<K>[0],
	NormalizedTranslationAtKeyWithParams<K>[1]
>;

export type LocaleKeyWithParams = {
	[K in LocaleKey]: keyof LocaleParams<K> extends never ? never : K;
}[LocaleKey];

export type LocaleKeyWithNoParams = {
	[K in LocaleKey]: keyof LocaleParams<K> extends never ? K : never;
}[LocaleKey];

export type LocaleArgs = Record<string, FormatOptions>;

/**
 * 获取原始翻译
 * @description
 * 当翻译不存在时返回 null
 */
function getRaw<K extends LocaleKeyWithNoParams>(key: K): any[] | null;
function getRaw<K extends LocaleKeyWithParams, A extends LocaleParams<K>>(
	key: K,
	args: A,
): any[] | null;
function getRaw<K extends LocaleKey, A extends LocaleParams<K>>(
	key: K,
	args?: A,
): any[] | null {
	const translate = dict.get(key);
	if (!translate) return null;
	return render(translate, args as any);
}

/**
 * 获取翻译
 * @description
 * 当翻译不存在时返回 null
 */
function get<K extends LocaleKeyWithNoParams>(key: K): string | null;
function get<K extends LocaleKeyWithParams, A extends LocaleParams<K>>(
	key: K,
	args: A,
): string | null;
function get<K extends LocaleKey, A extends LocaleParams<K>>(
	key: K,
	args?: A,
): string | null {
	const translate = dict.get(key);
	if (!translate) return null;
	return render(translate, args as any)
		.map(String)
		.join('');
}

/**
 * 获取翻译
 * @description
 * 当翻译不存在时返回键名
 */
function t<K extends LocaleKeyWithNoParams>(key: K): string;
function t<K extends LocaleKeyWithParams, A extends LocaleParams<K>>(
	key: K,
	args: A,
): string;
function t<K extends LocaleKey, A extends LocaleParams<K>>(
	key: K,
	args?: A,
): string {
	return get(key, args as any) ?? key;
}

//#region Format

type FormatOptions =
	| PluralFormatOptions
	| EnumFormatOptions
	| Intl.DateTimeFormatOptions
	| Intl.ListFormatOptions
	| Intl.NumberFormatOptions
	| Intl.RelativeTimeFormatOptions;

const PATTERN = /\{(.+?)(:(.*?))?\}/g;
const PATTERN_SINGLE = /\{?\}/g;

/** 格式化 */
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
	return arg;
}

/** 渲染翻译 */
function render(
	[locale, translate]: [string, LocaleMessage],
	args: Record<string, any> = {},
): any[] {
	let raw: string;
	let options: Record<string, FormatOptions>;
	if (typeof translate === 'string') {
		raw = translate;
		options = {};
	} else {
		[raw, options] = translate;
	}

	const result: any[] = [];
	const cache = new Map<string, string>();
	let offset = 0;
	const render = ([raw, name, _, type]: RegExpExecArray): any => {
		if (cache.has(name)) return cache.get(name)!;
		if (!(name in args)) return raw;
		return format(locale, type, options[name], args[name]);
	};
	for (const matched of raw.matchAll(PATTERN)) {
		const [raw, name] = matched;
		result.push(raw.slice(offset, matched.index));
		offset += raw.length;
		const rendered = render(matched);
		result.push(rendered);
		cache.set(name, rendered);
	}
	result.push(raw.slice(offset));

	return result;
}

//#region Event
export interface LocaleEventMap {
	update: [];
	errors: [errors: [locale: string, err: Error][]];
}

const emitter = new EventEmitter<LocaleEventMap>();

/**
 * 注册事件监听器
 * @template K - 事件名类型
 * @param event - 要监听的事件名
 * @param handler - 事件处理器函数
 * @remarks 若同一个事件和处理器已经注册过，则不会重复注册
 */
function on<K extends keyof LocaleEventMap>(
	key: K,
	handler: (...args: LocaleEventMap[K]) => any,
): void {
	emitter.on(key, handler as any);
}
/**
 * 注册一次性事件监听器
 * @template K - 事件名类型
 * @param event - 要监听的事件名
 * @param handler - 事件处理器函数
 * @remarks 事件触发一次后会自动移除监听器
 */
function once<K extends keyof LocaleEventMap>(
	key: K,
	handler: (...args: LocaleEventMap[K]) => any,
): void {
	emitter.once(key, handler as any);
}
/**
 * 移除事件监听器
 * @template K - 事件名类型
 * @param event - 要移除的事件名
 * @param handler - 要移除的事件处理器函数
 */
function off<K extends keyof LocaleEventMap>(
	key: K,
	handler: (...args: LocaleEventMap[K]) => any,
): void {
	emitter.off(key, handler as any);
}

//#region Helper

function* flatten(dict: LocaleDict): Generator<[string, LocaleMessage]> {
	const stack: { dict: LocaleDict; path: string }[] = [{ dict, path: '' }];
	while (stack.length > 0) {
		const { dict, path } = stack.pop()!;
		for (const [key, value] of Object.entries(dict)) {
			const newPath = path ? `${path}.${key}` : key;
			if (typeof value === 'string' || Array.isArray(value)) {
				yield [newPath, value];
				continue;
			}
			if (value === null) continue;
			if (typeof value !== 'object') continue;
			stack.push({ dict: value, path: newPath });
		}
	}
}

//#region Main

/** 词典加载器 */
export type LocaleLoader = (
	locale: string,
) => PromiseOr<LocaleDict | undefined | null>;

/** 本地化配置选项 */
export interface LocaleSetupOptions {
	/** 词典加载器 */
	loader: LocaleLoader;
	/** 语言列表 */
	locales: string[];
}

type ComposedDict = Map<string, [locale: string, message: LocaleMessage]>;

/** 词典加载器 */
let loader: LocaleLoader | undefined;
/** 语言列表 */
let locales: readonly string[] = Object.freeze([]);
/** 已加载的语言列表 */
let loadedLocales: readonly string[] = Object.freeze([]);
/** 是否完成加载 */
let loaded = false;
/** 词典 */
let dict: ComposedDict = new Map();

/**
 * 配置本地化
 * @description
 * 配置后将自动重载
 */
function setup(options: LocaleSetupOptions): void {
	loader = options.loader;
	locales = Object.freeze([...options.locales]);
	reload();
}

/** 重新加载词典 */
async function reload(): Promise<void> {
	if (loaded) return;
	if (!loader) return;
	loaded = true;

	const pending = [...locales].reverse().filter((v, i, a) => a.indexOf(v) === i);
	const results = await Promise.all(
		pending.map((locale) => run(loader!, locale)),
	);
	const newDict: ComposedDict = new Map();
	const succeeded: string[] = [];
	const failed: LocaleEventMap['errors'][0] = [];

	for (const [locale, result] of zip(pending, results)) {
		if (!result) continue;
		if (result instanceof Error) {
			failed.push([locale, result]);
			continue;
		}
		for (const [k, v] of flatten(result)) {
			newDict.set(k, [locale, v]);
		}
		succeeded.push(locale);
	}

	loadedLocales = Object.freeze(succeeded);
	dict = newDict;
	loaded = false;

	if (failed.length > 0) emitter.emit('errors', failed);
	emitter.emit('update');
}

/** 修补语言列表 */
function patch(
	locales: Readonly<ArrayOr<string>>,
	fallbacks?: Readonly<ArrayOr<string>>,
): string[] {
	const result: string[] = [];
	for (let locale of [...asArray(locales), ...asArray(fallbacks ?? [])]) {
		while (locale.length > 0) {
			if (!result.includes(locale)) result.push(locale);
			const i = locale.lastIndexOf('-');
			if (i === -1) break;
			locale = locale.slice(0, i);
			if (locales.includes(locale)) break;
		}
	}
	return result;
}

/**
 * 本地化
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/utils/locale)
 */
export const locale = {
	setup,
	t,
	patch,
	on,
	once,
	off,
	reload,
	getRaw,
	get,
	/**
	 * 词典加载器
	 * @description
	 * 更新词典加载器不会自动重载
	 */
	get loader() {
		return loader;
	},
	set loader(value) {
		loader = value;
	},
	/**
	 * 语言列表
	 * @description
	 * 更新语言列表不会自动重载
	 */
	get locales() {
		return locales;
	},
	set locales(value) {
		locales = Object.freeze([...value]);
	},
	/** 已加载的语言列表 */
	get loadedLocales() {
		return loadedLocales;
	},
	/** 是否完成加载 */
	get loaded() {
		return loaded;
	},
};
