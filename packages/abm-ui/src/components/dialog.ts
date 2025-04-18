import {
	$div,
	$new,
	Color,
	DOMContents,
	SyncList,
	asArray,
	sleep,
} from 'abm-utils';
import { EventValue, EventValueInit } from '../events/api/value';
import { EventHandler, Events, IEventSource } from '../events/events';
import { navigate } from '../navigate';
import { UIContent, UIContentInit } from './content';
import { WidgetBtn, WidgetBtnState } from './widgets/btn';

export interface DialogInitBase {
	/** 对话框标题 */
	title: string | UIContentInit | UIContent;
	/** 对话框内容 */
	content: DOMContents;
	/** 按钮激活时关闭对话框 */
	autoHide?: boolean;
}

export interface DialogActionInit<ID extends string = string> {
	id: ID;
	/** 按钮内容 */
	content: string | UIContentInit | UIContent;
	/**
	 * 按钮状态
	 * @description
	 * - ``：默认
	 * - `primary`：主要
	 * - `danger`：危险
	 */
	state?: Exclude<WidgetBtnState, 'toggle'>;
	/** 按钮长按激活时长 */
	delay?: number;
	/** 按钮显示进度 */
	progress?: number;
	/** 禁用按钮 */
	disabled?: boolean;
	/** 按钮颜色 */
	color?: Color | string;
}

export interface DialogInit<ID extends string = string> extends DialogInitBase {
	/** 对话框按钮 */
	actions: DialogActionInit<ID>[];
}

export interface DialogConfirmInit extends DialogInitBase {
	/** 对话框按钮 */
	actions?:
		| [
				DialogActionInit<'confirm'> | undefined | null,
				DialogActionInit<'cancel'> | undefined | null,
		  ]
		| [DialogActionInit<'confirm'> | undefined | null]
		| [];
}

export interface DialogOKInit extends DialogInitBase {
	/** 对话框按钮 */
	actions?: [DialogActionInit<'ok'> | undefined | null] | [];
}

export interface DialogEvents<ID extends string = string> {
	/** 对话框按钮 */
	action: EventValueInit<Dialog<ID>, ID>;
}

//#region #Action
class DialogAction<ID extends string = string> {
	id!: ID;
	element = $new('w-btn', { class: 'ui-dialog-action' });
	constructor(options: DialogActionInit<ID>, emit: (id: ID) => void) {
		this.data = options;
		this.element.on('active', () => emit(this.id));
	}
	get content(): UIContent {
		return this.element.content;
	}
	set content(content: UIContentInit | UIContent | string) {
		this.element.content = content;
	}
	get state(): Exclude<WidgetBtnState, 'toggle'> {
		const state = this.element.state;
		if (state === 'toggle') return '';
		return state;
	}
	set state(state: Exclude<WidgetBtnState, 'toggle'>) {
		if ((state as unknown) === 'toggle') return;
		this.element.state = state;
	}
	get delay() {
		return this.element.delay;
	}
	set delay(delay: number) {
		this.element.delay = delay;
	}
	get progress() {
		return this.element.progress;
	}
	set progress(progress: number) {
		this.element.progress = progress;
	}
	get disabled() {
		return this.element.disabled;
	}
	set disabled(disabled: boolean) {
		this.element.disabled = disabled;
	}
	get color(): Color | undefined {
		return this.element.color;
	}
	set color(color: Color | string | undefined) {
		this.element.color = color;
	}
	get data(): DialogActionInit<ID> {
		return this;
	}
	set data(options: DialogActionInit<ID>) {
		this.id = options.id;
		this.content = options.content;
		this.state = options.state ?? '';
		this.delay = options.delay ?? 0;
		this.progress = options.progress ?? 100;
		this.disabled = !!options.disabled;
		this.color = options.color;
	}
}

//#region #Dialog
/** 对话框 */
export class Dialog<ID extends string = string>
	implements IEventSource<DialogEvents<ID>>
{
	#filter = $div({ class: ['ui-preset-fullscreen', 'ui-dialog-filter'] });
	#dialog = $div({ class: ['ui-preset-center', 'ui-dialog'] });
	constructor(options: DialogInit<ID>) {
		this.#dialog.append(this.#titleElement, this.#content, this.#actionsElement);
		// Title
		if (options.title instanceof UIContent) this.#title = options.title;
		else this.#title = new UIContent(options.title);
		this.#updateTitle();
		this.#title.on('icon', this.#updateTitle);
		this.#title.on('label', this.#updateTitle);
		// Content
		this.content = options.content;
		// Actions
		this.actions = options.actions;
		this.autoHide = !!options.autoHide;
	}
	//#region Title
	#titleElement = $div({ class: 'ui-dialog-title' });
	#title: UIContent;
	#updateTitle() {
		this.#titleElement.replaceChildren();
		if (this.#title.iconElement)
			this.#titleElement.append(this.#title.iconElement);
		if (this.#title.labelElement)
			this.#titleElement.append(this.#title.labelElement);
	}
	/** 对话框标题 */
	get title(): UIContent {
		return this.#title;
	}
	set title(value: string | UIContentInit | UIContent) {
		if (typeof value === 'string') this.#title.key = value;
		else this.#title.reset(value);
	}
	//#region Content
	#content = $div({ class: 'ui-dialog-content' });
	/** 对话框内容 */
	get content(): NodeListOf<ChildNode> {
		return this.#content.childNodes;
	}
	set content(value: DOMContents) {
		this.#content.replaceChildren(...asArray(value));
	}
	//#region Actions
	autoHide = false;
	#actionsElement = $div({ class: 'ui-dialog-actions' });
	#updateActions = () => {
		this.#actionsElement.replaceChildren(
			...this.#actions.instances.map((action) => action.element),
		);
	};
	#actions = new SyncList<DialogActionInit<ID>, DialogAction<ID>>({
		getData: (instance) => instance.data,
		setData(instance, value) {
			instance.data = value;
		},
		create: (data) => new DialogAction(data, this.#emit),
		update: this.#updateActions,
		updateDelay: 50,
		creatable: true,
	});
	/** 对话框按钮 */
	get actions() {
		return this.#actions.items;
	}
	set actions(value: DialogActionInit<ID>[]) {
		this.#actions.replace(...value);
	}
	//#region Events
	#events = new Events<DialogEvents<ID>>(['action']);
	#emit = (id: ID) => {
		this.#events.emit(new EventValue('action', { target: this, value: id }));
		if (this.autoHide) this.hide();
	};
	/**
	 * 添加事件处理器
	 * @param type - 事件类型
	 * - `action`：按钮触发
	 */
	on<Type extends keyof DialogEvents>(
		type: Type,
		handler: EventHandler<Type, DialogEvents<ID>[Type], any>,
	): void {
		this.#events.on(type, handler);
	}
	/**
	 * 移除事件处理器
	 * @param type - 事件类型
	 * - `action`：按钮触发
	 */
	off<Type extends keyof DialogEvents>(
		type: Type,
		handler: EventHandler<Type, DialogEvents<ID>[Type], any>,
	): void {
		this.#events.off(type, handler);
	}
	//#region Others
	/** 显示对话框 */
	async show() {
		document.body.append(this.#filter, this.#dialog);
		await sleep(100);
		let element: WidgetBtn | undefined = undefined;
		for (let i = this.#actions.instances.length - 1; i >= 0; i--) {
			if (this.#actions.instances[i].disabled) continue;
			element = this.#actions.instances[i].element;
			break;
		}
		navigate.addLayer(this.#dialog, element);
	}
	/** 隐藏对话框 */
	hide() {
		this.#filter.animate(
			{ opacity: [1, 0] },
			{ duration: 100, easing: 'ease-in' },
		).onfinish = () => this.#filter.remove();
		this.#dialog.animate(
			{ scale: [1, 0] },
			{ duration: 200, easing: 'cubic-bezier(0, 0, 1, 0)' },
		).onfinish = () => this.#dialog.remove();
		navigate.rmLayer(this.#dialog);
	}
	//#region Static
	/** 确认按钮 */
	static ACTION_CONFIRM = Object.freeze<DialogActionInit<'confirm'>>({
		id: 'confirm',
		content: 'ui.confirm',
		state: 'primary',
	});
	/**
	 * 危险确认按钮
	 * @description
	 * 默认长按 1 秒激活
	 */
	static readonly ACTION_DANGER_CONFIRM = Object.freeze<
		DialogActionInit<'confirm'>
	>({
		id: 'confirm',
		content: 'ui.confirm',
		state: 'danger',
		delay: 1000,
	});
	/** 取消按钮 */
	static readonly ACTION_CANCEL = Object.freeze<DialogActionInit<'cancel'>>({
		id: 'cancel',
		content: 'ui.cancel',
	});
	/** 好的按钮 */
	static readonly ACTION_OK = Object.freeze<DialogActionInit<'ok'>>({
		id: 'ok',
		content: 'ui.ok',
	});
	/** 用户确认对话框 */
	static confirm(
		options: DialogConfirmInit,
	): Promise<boolean> & { dialog: Dialog<'confirm' | 'cancel'> } {
		const dialog = new Dialog({
			...options,
			actions: [
				Object.assign({}, Dialog.ACTION_CONFIRM, options.actions?.[0], {
					id: 'confirm',
				}),
				Object.assign({}, Dialog.ACTION_CANCEL, options.actions?.[1], {
					id: 'cancel',
				}),
			],
		});
		dialog.show();

		const promise = new Promise<boolean>((resolve) => {
			dialog.on('action', ({ value }) => resolve(value === 'confirm'));
		}) as Promise<boolean> & { dialog: Dialog<'confirm' | 'cancel'> };
		promise.dialog = dialog;

		return promise;
	}
	/** 提示对话框 */
	static ok(options: DialogOKInit): Promise<void> & { dialog: Dialog<'ok'> } {
		const dialog = new Dialog({
			...options,
			actions: [
				Object.assign({}, Dialog.ACTION_OK, options.actions?.[0], { id: 'ok' }),
			],
		});
		dialog.show();

		const promise = new Promise<void>((resolve) => {
			dialog.on('action', () => resolve());
		}) as Promise<void> & { dialog: Dialog<'ok'> };
		promise.dialog = dialog;

		return promise;
	}
	/**
	 * 无按钮对话框
	 * @description
	 * - 全屏显示进度显示
	 */
	static overlay(options: DialogInitBase): Dialog {
		const dialog = new Dialog({ ...options, actions: [] });
		dialog.show();
		return dialog;
	}
}
