import { Signal } from '@lit-labs/signals';
import {
	FlatLocaleParams,
	Locale,
	LocaleDict,
	LocaleManager,
	LocaleManagerEvents,
	parseKeyNamespace,
} from 'abm-utils';
import { DEFAULT_LOCALE_DICTS } from './defaults';

export interface UIDefaultLocaleDict extends LocaleDict {
	ui: {
		confirm: string;
		cancel: string;
		ok: string;
		color_picker: string;
		alpha: string;
		red: string;
		green: string;
		blue: string;
		hue: string;
		saturation: string;
		lightness: string;
	};
}

export const defaultLocale = new Locale<UIDefaultLocaleDict>({
	loader(locale) {
		return (
			DEFAULT_LOCALE_DICTS[locale as keyof typeof DEFAULT_LOCALE_DICTS] ?? null
		);
	},
});

export const localeManager = new LocaleManager();
localeManager.registerLocale('', defaultLocale);

export class LocaleProvider<
	K extends keyof FlatLocaleParams<UIDefaultLocaleDict> | (string & {}),
	A extends FlatLocaleParams<UIDefaultLocaleDict>[K],
> {
	#update = new Signal.State(false);
	#key = new Signal.State('');
	#namespace = new Signal.State('');
	#keyCompute = new Signal.Computed(() => {
		const namespace = this.#namespace.get();
		if (!namespace) return this.#key.get();
		return `${namespace}:${this.#key.get()}`;
	});
	#textCompute = new Signal.Computed(() => {
		// Watch locale update
		this.#update.get();
		return localeManager.getString(
			this.#namespace.get(),
			this.#key.get(),
			this.#params.get() as any,
		);
	});
	#params = new Signal.State<A | undefined>(undefined);
	constructor(key?: K, namespace?: string, params?: A) {
		if (typeof key === 'string') this.key = key;
		if (typeof namespace === 'string') this.#namespace.set(namespace);
		if (params) this.#params.set(params);
		localeManager.on('update', this.#updateHandler);
	}
	/** 命名空间 */
	get namespace() {
		return this.#namespace.get();
	}
	set namespace(value: string) {
		this.#namespace.set(value);
	}
	/** 翻译键 */
	get key() {
		return this.#keyCompute.get();
	}
	set key(value: string) {
		const [namespace, key] = parseKeyNamespace(value);
		if (namespace !== null) this.#namespace.set(namespace);
		this.#key.set(key);
	}
	/** 翻译参数 */
	get params() {
		return this.#params.get();
	}
	set params(value) {
		this.#params.set(value);
	}
	/** 获取本地化文本字符串 */
	text() {
		return this.#textCompute.get();
	}
	toString() {
		return this.text();
	}
	get textSignal() {
		return this.#textCompute;
	}
	#updateHandler = (event?: LocaleManagerEvents['update']) => {
		if (event?.value !== this.#namespace) return;
		this.#update.set(!this.#update.get());
	};
}
