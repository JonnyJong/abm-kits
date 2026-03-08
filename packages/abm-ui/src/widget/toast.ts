import { asArray, EventEmitter, typeCheck } from 'abm-utils';
import { ico } from '../component/icon';
import { Spinner } from '../component/spinner';
import { $content, $div, $new, type DOMContents } from '../infra/dom';
import { $on } from '../infra/event';

declare module '../component/icon' {
	interface PresetIcons {
		/** 吐司通知：成功 */
		success: string;
		/** 吐司通知：警告 */
		warn: string;
		/** 吐司通知：错误 */
		error: string;
	}
}

/**
 * 吐司通知垂直锚点
 * @description
 * - `top`：顶部
 * - `bottom`：底部
 */
export type ToastVerticalAnchor = 'top' | 'bottom';
/**
 * 吐司通知水平锚点
 * @description
 * - `left`：靠左
 * - `center`：居中
 * - `right`：靠右
 */
export type ToastHorizontalAnchor = 'left' | 'center' | 'right';
/**
 * 吐司通知级别
 * @description
 * - `normal`：普通
 * - `success`：成功
 * - `warn`：警告
 * - `error`：错误
 */
export type ToastLevel = 'normal' | 'success' | 'warn' | 'error';

/** 吐司通知初始化选项 */
export interface ToastInit {
	/** 详细信息 */
	details?: DOMContents;
	/**
	 * 显示时长
	 * @default 5000
	 * @description 设置为 0 表示持续显示
	 */
	duration?: number;
	/** 图标 */
	icon?: Node;
	/** 操作按钮 */
	actions?: DOMContents;
	/**
	 * 通知级别
	 * @description
	 * - `normal`：普通
	 * - `success`：成功
	 * - `warn`：警告
	 * - `error`：错误
	 */
	level?: ToastLevel;
}

interface ToastInitWithTitle extends ToastInit {
	/** 标题 */
	title?: DOMContents;
}

type ToastInitOption = DOMContents | ToastInitWithTitle;

export interface PromiseToastInit<T> {
	loading?: ToastInitOption;
	success?: ToastInitOption | ((result: T) => ToastInitOption);
	error?: ToastInitOption | ((reason: unknown) => ToastInitOption);
}

export interface ToastEventMap {
	/** 超时自动关闭 */
	autoClose: [];
}

let container: HTMLDivElement;
let verticalAnchor: ToastVerticalAnchor = 'top';
let horizontalAnchor: ToastHorizontalAnchor = 'right';
let horizontalOffset = 0;
let verticalOffset = 0;
const visibleToast = new Set<HTMLElement>();

function updateView() {
	const nodes = [...container.children].reverse() as HTMLElement[];
	let offset = 0;
	for (const toast of nodes) {
		toast.style.setProperty('--offset', `${offset}px`);
		if (!visibleToast.has(toast)) continue;
		offset += toast.offsetHeight + 16;
	}
}

function toOption(
	options?: ToastInitOption,
): ToastInit & { title?: DOMContents } {
	if (!options) return {};
	if (typeof options === 'string') return { title: options };
	if (Array.isArray(options)) return { title: options };
	if (options instanceof Node) return { title: options };
	return options;
}

/** 吐司通知 */
export class Toast extends EventEmitter<ToastEventMap> {
	#icon = $div({ className: 'ui-toast-icon' });
	#title = $div({ className: 'ui-toast-title' });
	#actions = $div({ className: 'ui-toast-actions' });
	#details = $div({ className: 'ui-toast-details' });
	#duration = 5000;
	#level: ToastLevel = 'normal';
	#toast = $div(
		{ className: ['surface-glass', 'ui-toast'] },
		this.#icon,
		this.#title,
		this.#actions,
		this.#details,
	);
	#timer?: number;
	/**
	 * @param title 标题
	 * @param init 初始化选项
	 */
	constructor(title: DOMContents, init?: ToastInit) {
		super();
		this.title = title;
		if (init?.details) this.details = init.details;
		if (init?.actions) this.actions = init.actions;
		if (init?.icon) this.icon = init.icon;
		this.level = init?.level ?? 'normal';
		this.duration = init?.duration ?? 5000;
		this.show();
	}
	#clearTimer() {
		if (this.#timer === undefined) return;
		clearTimeout(this.#timer);
		this.#timer = undefined;
	}
	#setTimer() {
		if (!this.#toast.isConnected) return;
		this.#clearTimer();
		if (!this.#duration) return;
		this.#timer = setTimeout(() => this.#close(), this.#duration);
	}
	#close() {
		if (!this.#toast.isConnected) return;
		this.close();
		this.emit('autoClose');
	}
	/** 显示通知 */
	show(): void {
		if (this.#toast.isConnected) return;
		container.append(this.#toast);
		visibleToast.add(this.#toast);
		this.#setTimer();
		updateView();
	}
	/** 关闭通知 */
	close(): void {
		this.#clearTimer();
		visibleToast.delete(this.#toast);
		const animation = this.#toast.animate({ opacity: 0 }, 100);
		animation.onfinish = () => this.#toast.remove();
		animation.play();
		updateView();
	}
	set(options?: ToastInitWithTitle): void {
		if (options?.title) this.title = options.title;
		if (options?.details) this.details = options.details;
		if (options?.actions) this.actions = options.actions;
		this.icon = options?.icon;
		if (options?.level) this.level = options.level;
		if (options?.duration) this.duration = options.duration;
	}
	/** 标题 */
	get title(): (Node | string)[] {
		return $content(this.#title);
	}
	set title(value: DOMContents) {
		this.#title.replaceChildren(...asArray(value));
	}
	/** 详细信息 */
	get details(): (Node | string)[] {
		return $content(this.#details);
	}
	set details(value: DOMContents) {
		this.#details.replaceChildren(...asArray(value));
	}
	/** 操作按钮 */
	get actions(): (Node | string)[] {
		return $content(this.#actions);
	}
	set actions(value: DOMContents) {
		this.#actions.replaceChildren(...asArray(value));
	}
	/** 图标 */
	get icon(): Node | undefined {
		return this.#icon.children[0];
	}
	set icon(value) {
		if (value) this.#icon.replaceChildren(value);
		else this.#icon.replaceChildren();
	}
	/**
	 * 显示时长
	 * @default 5000
	 * @description 设置为 0 表示持续显示
	 */
	@typeCheck(Number)
	get duration() {
		return this.#duration;
	}
	set duration(value) {
		this.#duration = value;
		this.#setTimer();
	}
	/**
	 * 通知级别
	 * @description
	 * - `normal`：普通
	 * - `success`：成功
	 * - `warn`：警告
	 * - `error`：错误
	 */
	@typeCheck('normal', 'success', 'warn', 'error')
	get level() {
		return this.#level;
	}
	set level(value) {
		this.#level = value;
		this.#toast.setAttribute('level', value);
	}
	/**
	 * 垂直锚点
	 * @description
	 * - `top`：顶部
	 * - `bottom`：底部
	 */
	@typeCheck('top', 'bottom')
	static get verticalAnchor() {
		return verticalAnchor;
	}
	static set verticalAnchor(value) {
		verticalAnchor = value;
		container?.setAttribute('vertical', value);
	}
	/**
	 * 水平锚点
	 * @description
	 * - `left`：靠左
	 * - `center`：居中
	 * - `right`：靠右
	 */
	@typeCheck('left', 'center', 'right')
	static get horizontalAnchor() {
		return horizontalAnchor;
	}
	static set horizontalAnchor(value) {
		horizontalAnchor = value;
		container?.setAttribute('horizontal', value);
	}
	/** 水平偏移 */
	@typeCheck(Number)
	static get horizontalOffset() {
		return horizontalOffset;
	}
	static set horizontalOffset(value) {
		horizontalOffset = value;
		container?.style.setProperty('--offset-h', `${value}px`);
	}
	/** 垂直偏移 */
	@typeCheck(Number)
	static get verticalOffset() {
		return verticalOffset;
	}
	static set verticalOffset(value) {
		verticalOffset = value;
		container?.style.setProperty('--offset-v', `${value}px`);
	}
	static success(title: DOMContents, init: ToastInit = {}): Toast {
		init.level = 'success';
		if (!('icon' in init)) init.icon = ico('ui.success');
		return new Toast(title, init);
	}
	static warn(title: DOMContents, init: ToastInit = {}): Toast {
		init.level = 'warn';
		if (!('icon' in init)) init.icon = ico('ui.warn');
		return new Toast(title, init);
	}
	static error(title: DOMContents, init: ToastInit = {}): Toast {
		init.level = 'error';
		if (!('icon' in init)) init.icon = ico('ui.error');
		return new Toast(title, init);
	}
	static promise<T>(promise: Promise<T>, init: PromiseToastInit<T> = {}): Toast {
		const loading = toOption(init.loading);
		loading.duration = 0;
		loading.icon ??= $new(Spinner);
		const toast = new Toast(loading.title ?? '', loading);
		promise
			.then((result) => {
				const options = toOption(
					typeof init.success === 'function' ? init.success(result) : init.success,
				);
				options.duration ??= 5000;
				options.icon ??= undefined;
				toast.set(options);
			})
			.catch((reason) => {
				const options = toOption(
					typeof init.error === 'function' ? init.error(reason) : init.error,
				);
				options.duration ??= 5000;
				options.icon ??= undefined;
				toast.set(options);
			});
		return toast;
	}
}

/** 创建吐司通知 */
export function toast(title: DOMContents, init?: ToastInit): Toast {
	return new Toast(title, init);
}

toast.success = Toast.success;
toast.warn = Toast.warn;
toast.error = Toast.error;
toast.promise = Toast.promise;

/** 初始化吐司通知 */
export function initToast() {
	container = $div({
		className: 'ui-toast-container',
		attr: { vertical: verticalAnchor, horizontal: horizontalAnchor },
		style: { $offsetH: horizontalOffset, $offsetV: verticalOffset },
	});
	document.body.append(container);
	$on(window, 'resize', updateView);
}
