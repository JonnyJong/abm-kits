import { Signal } from '@lit-labs/signals';
import { $div, $new, parseKeyNamespace } from 'abm-utils';
import { EventBase, EventBaseInit } from '../events/api/base';
import { EventHandler, Events, IEventSource } from '../events/events';
import { LocaleOptions } from '../locale';
import { WidgetIcon } from './widgets/icon';
import { WidgetLang } from './widgets/lang';
import { WidgetProgressRing } from './widgets/progress';

//#region #Base

export interface UIContentEvents<
	Options extends LocaleOptions = LocaleOptions,
> {
	icon: EventBaseInit<UIContent<Options>>;
	label: EventBaseInit<UIContent<Options>>;
}

export interface UIContentInit<Options extends LocaleOptions = LocaleOptions> {
	/**
	 * 本地化键名
	 * @description
	 * 当 `key` 和 `text` 同时存在时，优先使用 `key`
	 */
	key?: string;
	/** 本地化命名空间 */
	localeNamespace?: string;
	/** 本地化参数 */
	localeOptions?: Options;
	/**
	 * 文本内容
	 * @description
	 * 当 `key` 和 `text` 同时存在时，优先使用 `key`
	 */
	text?: string;
	/** 图标名 */
	icon?: string;
	/** 图标命名空间 */
	iconNamespace?: string;
	/** 进度 */
	progress?: string;
}

/** UI 组件内容 */
export class UIContent<Options extends LocaleOptions = LocaleOptions>
	implements IEventSource<UIContentEvents<Options>>
{
	#iconState = new Signal.State<WidgetIcon | WidgetProgressRing | null>(null);
	#labelState = new Signal.State<HTMLDivElement | WidgetLang<Options> | null>(
		null,
	);
	#iconComputed = new Signal.Computed(() => this.#iconState.get());
	#labelComputed = new Signal.Computed(() => this.#labelState.get());
	constructor(options?: UIContentInit<Options> | string | UIContent<Options>) {
		this.#setup(options);
	}
	#setup(options?: UIContentInit<Options> | string | UIContent<Options>) {
		if (typeof options === 'string') {
			this.key = options;
			return;
		}

		if (typeof options !== 'object') return;

		const {
			key,
			localeNamespace,
			localeOptions,
			text,
			icon,
			iconNamespace,
			progress,
		} = options;
		if (typeof localeOptions === 'object') this.localeOptions = localeOptions;
		if (typeof localeNamespace === 'string')
			this.localeNamespace = localeNamespace;
		if (typeof key === 'string') this.key = key;
		if (typeof text === 'string') this.text = text;
		if (typeof progress === 'number') this.progress = progress;
		if (typeof iconNamespace === 'string') this.iconNamespace = iconNamespace;
		if (typeof icon === 'string') this.icon = icon;
	}
	/**
	 * 重置
	 * @param options - `undefined` 时清除所有内容
	 */
	reset(options?: UIContentInit<Options> | string | UIContent<Options>) {
		this.#key = undefined;
		this.#localeNamespace = undefined;
		this.#localeOptions = undefined;
		this.#text = undefined;
		this.#icon = undefined;
		this.#iconNamespace = undefined;
		this.#progress = undefined;
		this.#labelState.set(null);
		this.#iconState.set(null);
		this.#events.emit(new EventBase('icon', { target: this }));
		this.#events.emit(new EventBase('label', { target: this }));

		this.#setup(options);
	}
	//#region Label
	#key?: string;
	#localeNamespace?: string;
	#localeOptions?: Options;
	#text?: string;
	#updateLabel() {
		let element = this.#labelState.get();

		if (typeof this.#key === 'string') {
			if (!(element instanceof WidgetLang)) {
				element = $new<WidgetLang<Options>>('w-lang');
				this.#labelState.set(element);
				this.#events.emit(new EventBase('label', { target: this }));
			}
			element.key = this.#key;
			if (typeof this.#localeNamespace === 'string')
				element.namespace = this.#localeNamespace;
			element.options = this.#localeOptions;
			return;
		}

		if (typeof this.#text === 'string') {
			if (!(element instanceof HTMLDivElement)) {
				element = $div();
				this.#labelState.set(element);
				this.#events.emit(new EventBase('label', { target: this }));
			}
			element.textContent = this.#text;
			return;
		}

		this.#labelState.set(null);
		this.#events.emit(new EventBase('label', { target: this }));
	}
	/**
	 * 本地化键名
	 * @description
	 * 当 `key` 和 `text` 同时存在时，优先使用 `key`
	 */
	get key() {
		return this.#key;
	}
	set key(value: string | undefined) {
		if (typeof value !== 'string') {
			this.#key = undefined;
			this.#updateLabel();
			return;
		}
		const [namespace, key] = parseKeyNamespace(value);
		this.#key = key;
		if (namespace !== null) this.#localeNamespace = namespace;
		this.#updateLabel();
	}
	/** 本地化命名空间 */
	get localeNamespace() {
		return this.#localeNamespace;
	}
	set localeNamespace(value: string | undefined) {
		this.#localeNamespace = value;
		this.#updateLabel();
	}
	/** 本地化参数 */
	get localeOptions() {
		return this.#localeOptions;
	}
	set localeOptions(value: Options | undefined) {
		this.#localeOptions = value;
		this.#updateLabel();
	}
	/**
	 * 文本内容
	 * @description
	 * 当 `key` 和 `text` 同时存在时，优先使用 `key`
	 */
	get text() {
		return this.#text;
	}
	set text(value: string | undefined) {
		this.#text = value;
		this.#updateLabel();
	}
	//#region Icon
	#icon?: string;
	#iconNamespace?: string;
	#progress?: string;
	#updateIcon() {
		let element = this.#iconState.get();

		if (typeof this.#progress === 'number') {
			if (!(element instanceof WidgetProgressRing)) {
				element = $new('w-progress-ring');
				this.#iconState.set(element);
				this.#events.emit(new EventBase('icon', { target: this }));
			}
			element.value = this.#progress;
			return;
		}

		if (typeof this.#icon === 'string') {
			if (!(element instanceof WidgetIcon)) {
				element = $new('w-icon');
				this.#iconState.set(element);
				this.#events.emit(new EventBase('icon', { target: this }));
			}
			element.key = this.#icon;
			if (typeof this.#iconNamespace === 'string')
				element.namespace = this.#iconNamespace;
			return;
		}

		this.#iconState.set(null);
		this.#events.emit(new EventBase('icon', { target: this }));
	}
	/** 图标名 */
	get icon() {
		return this.#icon;
	}
	set icon(value: string | undefined) {
		if (typeof value !== 'string') {
			this.#icon = undefined;
			this.#updateIcon();
			return;
		}
		const [namespace, key] = parseKeyNamespace(value);
		this.#icon = key;
		if (namespace !== null) this.#iconNamespace = namespace;
		this.#updateIcon();
	}
	/** 图标命名空间 */
	get iconNamespace() {
		return this.#iconNamespace;
	}
	set iconNamespace(value: string | undefined) {
		this.#iconNamespace = value;
		this.#updateIcon();
	}
	/** 进度 */
	get progress() {
		return this.#progress;
	}
	set progress(value: string | undefined) {
		this.#progress = value;
		this.#updateIcon();
	}
	//#region Elements
	/** 图标元素 */
	get iconElement() {
		return this.#iconState.get();
	}
	/** 文本元素 */
	get labelElement() {
		return this.#labelState.get();
	}
	/** 图标元素信号 */
	get iconSignal() {
		return this.#iconComputed;
	}
	/** 文本元素信号 */
	get labelSignal() {
		return this.#labelComputed;
	}
	//#region Other
	/** 克隆 */
	clone(): UIContent<Options> {
		return new UIContent(this);
	}
	#events = new Events<UIContentEvents<Options>>(['icon', 'label']);
	/**
	 * 添加事件处理器
	 * @param type - 事件类型
	 * - `icon`：图标元素变更
	 * - `label`：文本元素变更
	 */
	on<Type extends keyof UIContentEvents>(
		type: Type,
		handler: EventHandler<Type, UIContentEvents<Options>[Type], any>,
	): void {
		this.#events.on(type, handler);
	}
	/**
	 * 移除事件处理器
	 * @param type - 事件类型
	 * - `icon`：图标元素变更
	 * - `label`：文本元素变更
	 */
	off<Type extends keyof UIContentEvents>(
		type: Type,
		handler: EventHandler<Type, UIContentEvents<Options>[Type], any>,
	): void {
		this.#events.off(type, handler);
	}
}

//#region #Text

/**
 * UI 组件内容
 * @description
 * 文本元素固定存在
 */
export type UIContentTextInit<Options extends LocaleOptions = LocaleOptions> =
	| {
			/**
			 * 本地化键名
			 * @description
			 * 当 `key` 和 `text` 同时存在时，优先使用 `key`
			 */
			key: string;
			/** 本地化命名空间 */
			localeNamespace?: string;
			/** 本地化参数 */
			localeOptions?: Options;
			/**
			 * 文本内容
			 * @description
			 * 当 `key` 和 `text` 同时存在时，优先使用 `key`
			 */
			text?: string;
			/** 图标名 */
			icon?: string;
			/** 图标命名空间 */
			iconNamespace?: string;
			/** 进度 */
			progress?: string;
	  }
	| {
			/**
			 * 本地化键名
			 * @description
			 * 当 `key` 和 `text` 同时存在时，优先使用 `key`
			 */
			key?: string;
			/** 本地化命名空间 */
			localeNamespace?: string;
			/** 本地化参数 */
			localeOptions?: Options;
			/**
			 * 文本内容
			 * @description
			 * 当 `key` 和 `text` 同时存在时，优先使用 `key`
			 */
			text: string;
			/** 图标名 */
			icon?: string;
			/** 图标命名空间 */
			iconNamespace?: string;
			/** 进度 */
			progress?: string;
	  };

export class UIContentText<
	Options extends LocaleOptions = LocaleOptions,
> extends UIContent<Options> {
	constructor(
		options?: UIContentTextInit<Options> | string | UIContentText<Options>,
	) {
		if (typeof options !== 'object') {
			if (typeof options !== 'string') super({ text: '' });
			else super(options);
			return;
		}
		if (typeof options.text !== 'string') options.text = '';
		super(options);
	}
	reset(options?: UIContentTextInit<Options> | string | UIContentText<Options>) {
		if (typeof options !== 'object') {
			if (typeof options !== 'string') super.reset({ text: '' });
			else super.reset(options);
			return;
		}
		if (typeof options.text !== 'string') options.text = '';
		super.reset(options);
	}
	get text(): string {
		return super.text ?? '';
	}
	set text(value: string | undefined) {
		super.text = value ?? '';
	}
	get labelSignal() {
		return super.labelSignal as Signal.Computed<
			HTMLDivElement | WidgetLang<Options>
		>;
	}
	get labelElement() {
		return this.labelSignal.get();
	}
	clone(): UIContentText<Options> {
		return new UIContentText(this);
	}
}

//#region #All
export type UIContentAllInit<Options extends LocaleOptions = LocaleOptions> =
	| {
			/**
			 * 本地化键名
			 * @description
			 * 当 `key` 和 `text` 同时存在时，优先使用 `key`
			 */
			key: string;
			/** 本地化命名空间 */
			localeNamespace?: string;
			/** 本地化参数 */
			localeOptions?: Options;
			/**
			 * 文本内容
			 * @description
			 * 当 `key` 和 `text` 同时存在时，优先使用 `key`
			 */
			text?: string;
			/** 图标名 */
			icon: string;
			/** 图标命名空间 */
			iconNamespace?: string;
			/** 进度 */
			progress?: string;
	  }
	| {
			/**
			 * 本地化键名
			 * @description
			 * 当 `key` 和 `text` 同时存在时，优先使用 `key`
			 */
			key?: string;
			/** 本地化命名空间 */
			localeNamespace?: string;
			/** 本地化参数 */
			localeOptions?: Options;
			/**
			 * 文本内容
			 * @description
			 * 当 `key` 和 `text` 同时存在时，优先使用 `key`
			 */
			text: string;
			/** 图标名 */
			icon: string;
			/** 图标命名空间 */
			iconNamespace?: string;
			/** 进度 */
			progress?: string;
	  }
	| {
			/**
			 * 本地化键名
			 * @description
			 * 当 `key` 和 `text` 同时存在时，优先使用 `key`
			 */
			key: string;
			/** 本地化命名空间 */
			localeNamespace?: string;
			/** 本地化参数 */
			localeOptions?: Options;
			/**
			 * 文本内容
			 * @description
			 * 当 `key` 和 `text` 同时存在时，优先使用 `key`
			 */
			text?: string;
			/** 图标名 */
			icon?: string;
			/** 图标命名空间 */
			iconNamespace?: string;
			/** 进度 */
			progress: string;
	  }
	| {
			/**
			 * 本地化键名
			 * @description
			 * 当 `key` 和 `text` 同时存在时，优先使用 `key`
			 */
			key?: string;
			/** 本地化命名空间 */
			localeNamespace?: string;
			/** 本地化参数 */
			localeOptions?: Options;
			/**
			 * 文本内容
			 * @description
			 * 当 `key` 和 `text` 同时存在时，优先使用 `key`
			 */
			text: string;
			/** 图标名 */
			icon?: string;
			/** 图标命名空间 */
			iconNamespace?: string;
			/** 进度 */
			progress: string;
	  };

/**
 * UI 组件内容
 * @description
 * 图标和文本元素固定存在
 */
export class UIContentAll<
	Options extends LocaleOptions = LocaleOptions,
> extends UIContentText<Options> {
	constructor(
		options?: UIContentAllInit<Options> | string | UIContentAll<Options>,
	) {
		super(options);

		if (super.icon === undefined) super.icon = '';
	}
	reset(options?: UIContentAllInit<Options> | string | UIContentAll<Options>) {
		super.reset(options);

		if (super.icon === undefined) super.icon = '';
	}
	get icon(): string {
		return super.icon ?? '';
	}
	set icon(value: string | undefined) {
		super.icon = value ?? '';
	}
	get iconSignal() {
		return super.iconSignal as Signal.Computed<WidgetIcon | WidgetProgressRing>;
	}
	get iconElement() {
		return this.iconSignal.get();
	}
	clone(): UIContentAll<Options> {
		return new UIContentAll(this);
	}
}
