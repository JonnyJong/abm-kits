import { Signal } from '@lit-labs/signals';
import { parseKeyNamespace, runTask } from 'abm-utils';

export type LocaleOptions = Record<string, any>;

export interface LocaleDict {
	get(key: string, options?: LocaleOptions): string;
	signal?: Signal.State<any>;
}

export type UIDefaultKeys =
	| 'ui.confirm'
	| 'ui.cancel'
	| 'ui.ok'
	| 'ui.color_picker'
	| 'ui.alpha'
	| 'ui.red'
	| 'ui.green'
	| 'ui.blue'
	| 'ui.hue'
	| 'ui.saturation'
	| 'ui.lightness';
export type UIDefaultDict = {
	[Key in UIDefaultKeys]: any;
};

//#region Locale
const dicts = new Map<string, LocaleDict>();
const subscriptions = new Map<string, Set<Function>>();
const signal = new Signal.State(0);

function updateSignal() {
	signal.set(signal.get() + 1);
}

/**
 * 根据键值获取对应的翻译
 */
export function locale(
	key: string,
	options?: LocaleOptions,
	namespace?: string,
): string {
	const i = key.indexOf(':');
	if (typeof namespace !== 'string' && i !== -1) {
		namespace = key.slice(0, i);
	} else {
		namespace = '';
	}
	const dict = dicts.get(namespace);
	if (!dict) return key;
	return dict.get(key.slice(i + 1), options);
}
/**
 * Locale 更新信号
 */
locale.signal = signal as Signal.State<unknown>;
/**
 * 浏览器语言偏好
 */
locale.prefers = navigator.languages;
/**
 * 所有字典的命名空间
 */
locale.getDictsNamespace = () => [...dicts.keys()];
/**
 * 强制触发更新事件
 */
locale.emitUpdate = (namespace?: string) => {
	updateSignal();
	const handlers = namespace
		? subscriptions.get(namespace)
		: [...subscriptions.values()].flatMap((set) => [...set]);
	if (!handlers) return;
	for (const handler of subscriptions) {
		runTask(handler);
	}
};
/**
 * 设置、更新本地化词典
 */
locale.set = (namespace: string, dict: LocaleDict) => {
	dicts.set(namespace, dict);
	updateSignal();
	locale.emitUpdate(namespace);
};
/**
 * 移除本地化字典
 */
locale.remove = (namespace: string): boolean => {
	if (!dicts.delete(namespace)) return false;

	locale.emitUpdate(namespace);
	return true;
};
/**
 * 订阅更新事件
 */
locale.on = (namespace: string, handler: Function) => {
	const handlers = subscriptions.get(namespace);
	if (handlers) {
		handlers.add(handler);
		return;
	}
	subscriptions.set(namespace, new Set([handler]));
};
/**
 * 取消订阅更新事件
 */
locale.off = (namespace: string, handler: Function) => {
	const handlers = subscriptions.get(namespace);
	if (!handlers) return;
	handlers.delete(handler);
};

Object.freeze(locale);

//#region Provider

/**
 * 提供本地化文本的访问
 */
export class LocaleProvider<Options extends LocaleOptions = LocaleOptions> {
	#namespace = new Signal.State('');
	#key = new Signal.State('');
	#keyCompute = new Signal.Computed(() => {
		const namespace = this.#namespace.get();
		if (!namespace) return this.#key.get();
		return `${namespace}:${this.#key.get()}`;
	});
	#textCompute = new Signal.Computed(() => {
		// Watch locale update
		signal.get();

		return locale(this.#key.get(), this.#options.get(), this.#namespace.get());
	});
	#options = new Signal.State<Options | undefined>(undefined);
	constructor(key?: string, namespace?: string, options?: Options) {
		if (typeof key === 'string') this.key = key;
		if (typeof namespace === 'string') this.namespace = namespace;
		if (options) this.options = options;
	}
	/**
	 * 命名空间
	 */
	get namespace() {
		return this.#namespace.get();
	}
	set namespace(value: string) {
		this.#namespace.set(value);
	}
	/**
	 * 翻译键
	 */
	get key() {
		return this.#keyCompute.get();
	}
	set key(value: string) {
		const [namespace, key] = parseKeyNamespace(value);
		if (namespace !== null) this.#namespace.set(namespace);
		this.#key.set(key);
	}
	/**
	 * 翻译参数
	 */
	get options() {
		return this.#options.get();
	}
	set options(value: Options | undefined) {
		this.#options.set(value);
	}
	/**
	 * 获取本地化文本字符串
	 */
	text() {
		return this.#textCompute.get();
	}
	toString() {
		return this.text();
	}
	get textSignal() {
		return this.#textCompute;
	}
}
