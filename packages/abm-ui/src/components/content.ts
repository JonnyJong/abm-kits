import { Signal } from '@lit-labs/signals';
import {
	$div,
	$new,
	EventBase,
	EventBaseInit,
	EventHandler,
	Events,
	IEventSource,
	LocaleParams,
	parseKeyNamespace,
} from 'abm-utils';
import { WidgetIcon } from './widgets/icon';
import { WidgetLang } from './widgets/lang';
import { WidgetProgressRing } from './widgets/progress';

//#region #Base

export interface UIContentEvents<Params extends LocaleParams = LocaleParams> {
	icon: EventBaseInit<UIContent<Params>>;
	label: EventBaseInit<UIContent<Params>>;
}

export interface UIContentInit<Params extends LocaleParams = LocaleParams> {
	/**
	 * 本地化键名
	 * @description
	 * 当 `key` 和 `text` 同时存在时，优先使用 `key`
	 */
	key?: string;
	/** 本地化命名空间 */
	localeNamespace?: string;
	/** 本地化参数 */
	localeParams?: Params;
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
	progress?: number;
}

/** UI 组件内容 */
export class UIContent<Params extends LocaleParams = LocaleParams>
	implements IEventSource<UIContentEvents<Params>>
{
	#iconState = new Signal.State<WidgetIcon | WidgetProgressRing | null>(null);
	#labelState = new Signal.State<HTMLDivElement | WidgetLang<Params> | null>(
		null,
	);
	#iconComputed = new Signal.Computed(() => this.#iconState.get());
	#labelComputed = new Signal.Computed(() => this.#labelState.get());
	constructor(options?: UIContentInit<Params> | string | UIContent<Params>) {
		this.#setup(options);
	}
	#setup(options?: UIContentInit<Params> | string | UIContent<Params>) {
		if (typeof options === 'string') {
			this.key = options;
			return;
		}

		if (typeof options !== 'object') return;

		const {
			key,
			localeNamespace,
			localeParams,
			text,
			icon,
			iconNamespace,
			progress,
		} = options;
		if (typeof localeParams === 'object') this.localeParams = localeParams;
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
	reset(options?: UIContentInit<Params> | string | UIContent<Params>) {
		this.#key = undefined;
		this.#localeNamespace = undefined;
		this.#localeParams = undefined;
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
	#localeParams?: Params;
	#text?: string;
	#updateLabel() {
		let element = this.#labelState.get();

		if (typeof this.#key === 'string') {
			if (!(element instanceof WidgetLang)) {
				element = $new<WidgetLang<any>>('w-lang');
				this.#labelState.set(element);
				this.#events.emit(new EventBase('label', { target: this }));
			}
			element.key = this.#key;
			if (typeof this.#localeNamespace === 'string')
				element.namespace = this.#localeNamespace;
			element.params = this.#localeParams;
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
	get localeParams() {
		return this.#localeParams;
	}
	set localeParams(value: Params | undefined) {
		this.#localeParams = value;
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
	#progress?: number;
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
	set progress(value: number | undefined) {
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
	clone(): UIContent<Params> {
		return new UIContent(this);
	}
	#events = new Events<UIContentEvents<Params>>(['icon', 'label']);
	/**
	 * 添加事件处理器
	 * @param type - 事件类型
	 * - `icon`：图标元素变更
	 * - `label`：文本元素变更
	 */
	on<Type extends keyof UIContentEvents>(
		type: Type,
		handler: EventHandler<Type, UIContentEvents<Params>[Type], any>,
	): void {
		this.#events.on(type, handler);
	}
	/**
	 * 添加一次性事件处理器
	 * @param type - 事件类型
	 * - `icon`：图标元素变更
	 * - `label`：文本元素变更
	 */
	once<Type extends keyof UIContentEvents>(
		type: Type,
		handler: EventHandler<Type, UIContentEvents<Params>[Type], any>,
	): void {
		this.#events.once(type, handler);
	}
	/**
	 * 移除事件处理器
	 * @param type - 事件类型
	 * - `icon`：图标元素变更
	 * - `label`：文本元素变更
	 */
	off<Type extends keyof UIContentEvents>(
		type: Type,
		handler: EventHandler<Type, UIContentEvents<Params>[Type], any>,
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
export type UIContentTextInit<Params extends LocaleParams = LocaleParams> =
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
			localeParams?: Params;
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
			progress?: number;
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
			localeParams?: Params;
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
			progress?: number;
	  };

export class UIContentText<
	Params extends LocaleParams = LocaleParams,
> extends UIContent<Params> {
	constructor(
		options?: UIContentTextInit<Params> | string | UIContentText<Params>,
	) {
		if (typeof options !== 'object') {
			if (typeof options !== 'string') super({ text: '' });
			else super(options);
			return;
		}
		if (typeof options.text !== 'string') options.text = '';
		super(options);
	}
	reset(options?: UIContentTextInit<Params> | string | UIContentText<Params>) {
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
			HTMLDivElement | WidgetLang<Params>
		>;
	}
	get labelElement() {
		return this.labelSignal.get();
	}
	clone(): UIContentText<Params> {
		return new UIContentText(this);
	}
}

//#region #All
export type UIContentAllInit<Params extends LocaleParams = LocaleParams> =
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
			localeParams?: Params;
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
			progress?: number;
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
			localeParams?: Params;
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
			progress?: number;
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
			localeParams?: Params;
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
			progress: number;
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
			localeParams?: Params;
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
			progress: number;
	  };

/**
 * UI 组件内容
 * @description
 * 图标和文本元素固定存在
 */
export class UIContentAll<
	Params extends LocaleParams = LocaleParams,
> extends UIContentText<Params> {
	constructor(
		options?: UIContentAllInit<Params> | string | UIContentAll<Params>,
	) {
		super(options);

		if (super.icon === undefined) super.icon = '';
	}
	reset(options?: UIContentAllInit<Params> | string | UIContentAll<Params>) {
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
	clone(): UIContentAll<Params> {
		return new UIContentAll(this);
	}
}
