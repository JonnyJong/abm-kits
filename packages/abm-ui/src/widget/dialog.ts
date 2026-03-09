import { asArray, EventEmitter } from 'abm-utils';
import { Button, type ButtonVariant } from '../component/button';
import { t } from '../component/i18n';
import { ico } from '../component/icon';
import { $color, type ThemeColor } from '../infra/color';
import { $content, $div, $new, type DOMContents } from '../infra/dom';
import { type Navigable, navigate } from '../navigate/index';
import type { NavState } from '../navigate/types';
import { state } from '../state';

declare module '../component/icon' {
	interface PresetIcons {
		/** 对话框：关闭 */
		dialogClose: string;
	}
}

/**
 * 对话框布局
 * @default 'horizontal'
 * @description
 * - horizontal: 左侧显示图标，标题和内容在右侧并居左
 * - vertical: 顶部显示图标，标题和内容在下方并居中
 */
export type DialogLayout = 'horizontal' | 'vertical';

/**
 * 对话框按钮布局
 * @default 'horizontal'
 * @description
 * - horizontal: 水平靠边
 * - horizontal-full: 水平填满
 * - vertical: 垂直排列
 */
export type DialogActionsLayout = 'horizontal' | 'horizontal-full' | 'vertical';

/** 对话框初始化参数 */
export interface DialogInit {
	/** 图标 */
	icon?: Node;
	/** 标题 */
	title?: DOMContents;
	/** 内容 */
	content?: DOMContents;
	/** 操作按钮 */
	actions?: DOMContents;
	/** 隐藏关闭按钮 */
	hideCloseButton?: boolean;
	/** 禁用点击外部区域关闭对话框 */
	disableClickOutside?: boolean;
	/** 禁用全局返回关闭对话框 */
	disableGlobalBackClose?: boolean;
	/**
	 * 布局
	 * @default 'horizontal'
	 * @description
	 * - horizontal: 左侧显示图标，标题和内容在右侧并居左
	 * - vertical: 顶部显示图标，标题和内容在下方并居中
	 */
	layout?: DialogLayout;
	/**
	 * 操作按钮布局
	 * @default 'horizontal'
	 * @description
	 * - horizontal: 水平靠边
	 * - horizontal-full: 水平填满
	 * - vertical: 垂直排列
	 */
	actionsLayout?: DialogActionsLayout;
	/** 宽度 */
	width?: number | string;
	/** 主题配色 */
	color?: ThemeColor;
	/**
	 * 对话框关闭回调
	 * @description
	 * 仅点击对话框关闭按钮、外部区域或全局返回关闭对话框时触发
	 */
	onClose?: () => any;
}

/** 确认对话框初始化参数 */
export interface ConfirmDialogInit extends DialogInit {
	/**
	 * 框按钮布局
	 * @default 'horizontal-full'
	 * @description
	 * - horizontal: 水平靠边
	 * - horizontal-full: 水平填满
	 * - vertical: 垂直排列
	 */
	actionsLayout?: DialogActionsLayout;
	/**
	 * 级别
	 * @default 'primary'
	 */
	level?: 'primary' | 'danger' | 'critical';
	/**
	 * 确认按钮内容
	 * @default t('ui.confirm')
	 */
	confirmContent?: DOMContents;
}

/** 警告对话框初始化参数 */
export interface AlertDialogInit extends DialogInit {
	/**
	 * 隐藏关闭按钮
	 * @default true
	 */
	hideCloseButton?: boolean;
	/**
	 * 禁用点击外部区域关闭对话框
	 * @default true
	 */
	disableClickOutside?: boolean;
	/**
	 * 框按钮布局
	 * @default 'horizontal-full'
	 * @description
	 * - horizontal: 水平靠边
	 * - horizontal-full: 水平填满
	 * - vertical: 垂直排列
	 */
	actionsLayout?: DialogActionsLayout;
	/**
	 * 按钮变体
	 * @default ''
	 */
	buttonVariant?: ButtonVariant;
	/**
	 * 确认按钮内容
	 * @default t('ui.ok')
	 */
	confirmContent?: DOMContents;
}

/** 覆盖对话框初始化参数 */
export interface OverlayDialogInit extends DialogInit {
	/**
	 * 隐藏关闭按钮
	 * @default true
	 */
	hideCloseButton?: boolean;
	/**
	 * 禁用点击外部区域关闭对话框
	 * @default true
	 */
	disableClickOutside?: boolean;
	/**
	 * 禁用全局返回关闭对话框
	 * @default true
	 */
	disableGlobalBackClose?: boolean;
}

export interface DialogEventMap {
	/**
	 * 对话框关闭
	 * @description
	 * 仅点击对话框关闭按钮、外部区域或全局返回关闭对话框时触发
	 */
	close: [];
}

const LAYOUT = new Set<DialogLayout>(['horizontal', 'vertical']);
const ACTIONS_LAYOUT = new Set<DialogActionsLayout>([
	'horizontal',
	'horizontal-full',
	'vertical',
]);

/**
 * 对话框
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/widget/dialog)
 */
export class Dialog
	extends EventEmitter<DialogEventMap>
	implements Required<Omit<DialogInit, 'color' | 'onClose'>>
{
	#closeBtn = $new(
		Button,
		{ class: 'ui-dialog-close', flat: true },
		ico('ui.dialogClose'),
	);
	#icon = $div({ class: 'ui-dialog-icon' });
	#title = $div({ class: 'ui-dialog-title' });
	#content = $div({ class: 'ui-dialog-content' });
	#actions = $div({ class: 'ui-dialog-actions' });
	#dialog: HTMLDivElement & Navigable = $div(
		{ class: 'surface-glass overlay safe-inset ui-dialog' },
		this.#closeBtn,
		this.#icon,
		this.#title,
		this.#content,
		this.#actions,
	);
	#backdrop = $div({ class: 'backdrop-dim' });
	constructor(init?: DialogInit) {
		super();
		this.#closeBtn.on('active', () => this.#close());
		state.active.on(this.#backdrop, () => this.#backdropClick());
		this.#dialog.navCallback = (state) => this.#handleNav(state);
		if (!init) return;
		if (init.icon) this.icon = init.icon;
		if (init.title) this.title = init.title;
		if (init.content) this.content = init.content;
		if (init.actions) this.actions = init.actions;
		if (init.hideCloseButton) this.hideCloseButton = true;
		if (init.disableClickOutside) this.disableClickOutside = true;
		if (init.disableGlobalBackClose) this.disableGlobalBackClose = true;
		if (init.layout) this.layout = init.layout;
		if (init.actionsLayout) this.actionsLayout = init.actionsLayout;
		if (init.width !== undefined) this.width = init.width;
		if (init.color) this.setColor(init.color);
		if (init.onClose) this.on('close', init.onClose);
	}
	#handleNav(state: NavState) {
		if (state.type !== 'back') return;
		if (this.disableGlobalBackClose) return;
		this.#close();
	}
	#backdropClick() {
		if (this.disableClickOutside) return;
		this.#close();
	}
	#close() {
		this.close();
		this.emit('close');
	}
	/** 打开对话框 */
	open(): this {
		document.body.append(this.#backdrop, this.#dialog);
		navigate.addLayer(this.#dialog);
		return this;
	}
	/** 关闭对话框 */
	close(): this {
		navigate.rmLayer(this.#dialog);
		const backdrop = this.#backdrop.animate({ opacity: 0 }, 100);
		const dialog = this.#dialog.animate({ opacity: 0 }, 100);
		backdrop.onfinish = () => this.#backdrop.remove();
		dialog.onfinish = () => this.#dialog.remove();
		return this;
	}
	get icon(): Node {
		return this.#icon.children[0];
	}
	set icon(value) {
		if (value) this.#icon.replaceChildren(value);
		else this.#icon.replaceChildren();
	}
	get title(): (Node | string)[] {
		return $content(this.#title);
	}
	set title(value: DialogInit['title']) {
		if (value) this.#title.replaceChildren(...asArray(value));
		else this.#title.replaceChildren();
	}
	get content(): (Node | string)[] {
		return $content(this.#content);
	}
	set content(value: DialogInit['title']) {
		if (value) this.#content.replaceChildren(...asArray(value));
		else this.#content.replaceChildren();
	}
	get actions(): (Node | string)[] {
		return $content(this.#actions);
	}
	set actions(value: DialogInit['title']) {
		if (value) this.#actions.replaceChildren(...asArray(value));
		else this.#actions.replaceChildren();
	}
	get hideCloseButton() {
		return this.#closeBtn.style.display === 'none';
	}
	set hideCloseButton(value) {
		this.#closeBtn.style.display = value ? 'none' : '';
	}
	accessor disableClickOutside = false;
	accessor disableGlobalBackClose = false;
	#layout: DialogLayout = 'horizontal';
	get layout() {
		return this.#layout;
	}
	set layout(value) {
		if (!LAYOUT.has(value)) return;
		this.#layout = value;
		this.#dialog.setAttribute('layout', value);
	}
	#actionsLayout: DialogActionsLayout = 'horizontal';
	get actionsLayout() {
		return this.#actionsLayout;
	}
	set actionsLayout(value) {
		if (!ACTIONS_LAYOUT.has(value)) return;
		this.#actionsLayout = value;
		this.#actions.setAttribute('layout', value);
	}
	get width(): string {
		return this.#dialog.style.width;
	}
	set width(value: number | string) {
		if (typeof value === 'number') value = `${value}px`;
		this.#dialog.style.width = String(value);
	}
	/** 设置主题颜色 */
	setColor(value: ThemeColor): this {
		$color(this.#dialog, value);
		return this;
	}
	/** 创建确认对话框 */
	static confirm(
		init: ConfirmDialogInit = {},
	): Promise<boolean> & { dialog: Dialog } {
		init.actionsLayout ??= 'horizontal-full';
		init.confirmContent ??= t('ui.confirm');
		const confirm = $new(Button, {
			children: init.confirmContent,
			variant: init.level ?? 'primary',
			flat: true,
		});
		const cancel = $new(Button, { flat: true }, t('ui.cancel'));
		init.actions = [confirm, cancel];
		const dialog = new Dialog(init);
		const promise = new Promise<boolean>((resolve) => {
			confirm.on('active', () => {
				dialog.close();
				resolve(true);
			});
			cancel.on('active', () => {
				dialog.close();
				resolve(false);
			});
			dialog.on('close', () => resolve(false));
		});
		(promise as any).dialog = dialog;
		dialog.open();
		return promise as any;
	}
	/** 创建警告提示框 */
	static alert(init: AlertDialogInit = {}): Promise<void> & { dialog: Dialog } {
		init.actionsLayout ??= 'horizontal-full';
		init.hideCloseButton ??= true;
		init.disableClickOutside ??= true;
		init.confirmContent = t('ui.ok');
		const confirm = $new(Button, {
			children: init.confirmContent,
			variant: init.buttonVariant,
			flat: true,
		});
		init.actions = [confirm];
		const dialog = new Dialog(init);
		const promise = new Promise<void>((resolve) => {
			confirm.on('active', () => {
				dialog.close();
				resolve();
			});
			dialog.on('close', () => resolve());
		});
		dialog.open();
		(promise as any).dialog = dialog;
		return promise as any;
	}
	/** 创建覆盖对话框 */
	static overlay(init: OverlayDialogInit = {}): Dialog {
		init.hideCloseButton ??= true;
		init.disableClickOutside ??= true;
		init.disableGlobalBackClose ??= true;
		const dialog = new Dialog(init);
		dialog.open();
		return dialog;
	}
}
