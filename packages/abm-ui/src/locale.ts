import { Signal } from '@lit-labs/signals';
import { LocaleDriver, LocaleParams, parseKeyNamespace } from 'abm-utils';

export type UIDefaultLocaleKeys =
	| 'confirm'
	| 'cancel'
	| 'ok'
	| 'color_picker'
	| 'alpha'
	| 'red'
	| 'green'
	| 'blue'
	| 'hue'
	| 'saturation'
	| 'lightness';
export type UIDefaultFlatLocaleKeys = `ui.${UIDefaultLocaleKeys}`;

//#region Driver

let localeDriver: LocaleDriver | undefined = undefined;
const signal = new Signal.State(true);

export function locale(key: string, params?: LocaleParams, namespace?: string) {
	if (!localeDriver) return key;
	return localeDriver.getString(key, params, namespace);
}

export function getCurrentLocaleDriver() {
	return localeDriver;
}

function localeUpdateListener() {
	signal.set(!signal.get());
}

export function setLocaleDriver(driver: LocaleDriver) {
	if (localeDriver) localeDriver.rmUpdateListener(localeUpdateListener);
	localeDriver = driver;
	localeDriver.addUpdateListener(localeUpdateListener);
	localeUpdateListener();
}

export class LocaleProvider<Params extends LocaleParams = LocaleParams> {
	#key = new Signal.State('');
	#namespace = new Signal.State('');
	#keyCompute = new Signal.Computed(() => {
		const namespace = this.#namespace.get();
		if (!namespace) return this.#key.get();
		return `${namespace}:${this.#key.get()}`;
	});
	#textCompute = new Signal.Computed(() => {
		// Watch locale update
		signal.get();
		return locale(this.#key.get(), this.#params.get(), this.#namespace.get());
	});
	#params = new Signal.State<Params | undefined>(undefined);
	constructor(key?: string, namespace?: string, params?: Params) {
		if (typeof key === 'string') this.key = key;
		if (typeof namespace === 'string') this.namespace = namespace;
		if (params) this.params = params;
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
	get params() {
		return this.#params.get();
	}
	set params(value: Params | undefined) {
		this.#params.set(value);
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
