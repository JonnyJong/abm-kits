import {
	type ArrayOr,
	asArray,
	clamp,
	typeCheck,
	type Vec2,
	Vector2,
} from 'abm-utils';
import { ico } from '../component/icon';
import { $div, $rect, type DOMContents } from '../infra/dom';
import { safeRect } from '../infra/screen';
import { $style } from '../infra/style';
import { type Navigable, navigate } from '../navigate/index';
import { state } from '../state';

declare module '../component/icon' {
	interface PresetIcons {
		/** 菜单：进入次级菜单 */
		menuEnter: string;
		/** 菜单：返回上级菜单 */
		menuBack: string;
		/** 菜单：选中 */
		menuCheckmark: string;
	}
}

/**
 * 菜单项类型
 * @description
 * - `menu`：普通菜单项
 * - `separator`：菜单分隔符
 * - `checkbox`：单选菜单项
 */
export type MenuItemType = 'menu' | 'separator' | 'checkbox';

/** 菜单项初始化参数 */
export interface MenuItemInit {
	/** 菜单项图标 */
	icon?: DOMContents;
	/** 菜单项标签 */
	label?: DOMContents;
	/**
	 * 菜单项类型
	 * @default 'menu'
	 * @see {@link MenuItemType}
	 */
	type?: MenuItemType;
	/** 禁用菜单项 */
	disabled?: boolean;
	/** 隐藏菜单项 */
	hidden?: boolean;
	/** 是否已选中 */
	checked?: boolean;
	/** 子菜单 */
	submenu?: MenuItemInit[];
	/** 菜单项 ID */
	id?: string;
	/** 排列在列表中的菜单项前 */
	before?: ArrayOr<string>;
	/** 排列在列表中的菜单项后 */
	after?: ArrayOr<string>;
	/**
	 * 菜单项操作
	 * @description
	 * 返回 `true` 时阻止菜单关闭
	 */
	// biome-ignore lint/suspicious/noConfusingVoidType: Allow () => void
	action?: (item: MenuItem) => undefined | null | boolean | void;
}

const kChildren = Symbol();
const kUpdate = Symbol();
const kChecked = Symbol();
const kEnter = Symbol();
const kBack = Symbol();
const kOrigin = Symbol();
const kContainer = Symbol();
const kList = Symbol();
const kBackLabel = Symbol();

type UpdateType =
	| 'child'
	| 'action'
	| 'type'
	| 'icon'
	| 'label'
	| 'disabled'
	| 'hidden'
	| 'checked';

//#region Item

function getPositionArgs(
	input: MenuItemInit | MenuItem,
): [before: string[], after: string[]] {
	if (input instanceof MenuItem) return [[], []];
	return [asArray(input.before ?? []), asArray(input.after ?? [])];
}
function toItem(input: MenuItemInit | MenuItem): MenuItem {
	return input instanceof MenuItem ? input : new MenuItem(input);
}

/** 菜单项 */
export class MenuItem {
	[kChildren]: MenuItem[] = [];
	constructor(init?: MenuItemInit) {
		if (!init) return;
		if (init.icon) this.icon = init.icon;
		if (init.label) this.label = init.label;
		if (init.type) this.type = init.type;
		if (init.disabled) this.disabled = init.disabled;
		if (init.hidden) this.hidden = init.hidden;
		if (init.checked) this.checked = init.checked;
		if (init.id) this.id = init.id;
		if (init.action) this.action = init.action;
		if (init.submenu) this.append(...init.submenu);
	}
	#insert(index: number, input: MenuItemInit | MenuItem): number {
		const [before, after] = getPositionArgs(input);
		const item = toItem(input);
		for (const [i, child] of this[kChildren].entries()) {
			if (after.includes(child.id!)) index = i + 1;
			else if (before.includes(child.id!)) index = i;
		}
		index = clamp(0, index, this[kChildren].length);
		this[kChildren].splice(index, 0, item);
		return index;
	}
	/** 在首部插入菜单项 */
	prepend(...items: (MenuItemInit | MenuItem)[]): void {
		this.insert(0, ...items);
	}
	/** 在尾部插入菜单项 */
	append(...items: (MenuItemInit | MenuItem)[]): void {
		for (const item of items) this.#insert(this[kChildren].length, item);
		this.#update('child');
	}
	/** 在指定位置插入菜单项 */
	insert(index: number, ...items: (MenuItemInit | MenuItem)[]): void {
		for (const item of items) {
			const inserted = this.#insert(index, item);
			if (inserted === index) index++;
		}
		this.#update('child');
	}
	/** 获取当前子菜单项副本 */
	getChildren() {
		return [...this[kChildren]];
	}
	/** 清空所有子菜单项 */
	clear(): void {
		this[kChildren] = [];
		this.#update('child');
	}
	[kUpdate]?: (item: MenuItem, type: UpdateType) => void;
	#update(type: UpdateType) {
		this[kUpdate]?.(this, type);
	}
	#action?: MenuItemInit['action'];
	/** 菜单项操作 */
	get action() {
		return this.#action;
	}
	set action(value) {
		if (value === this.#action) return;
		this.#action = value;
		this.#update('action');
	}
	/** ID */
	@typeCheck(undefined, String)
	accessor id: string | undefined;
	#type: MenuItemType = 'menu';
	/**
	 * 菜单项类型
	 * @see {@link MenuItemType}
	 */
	get type() {
		return this.#type;
	}
	@typeCheck('menu', 'separator', 'checkbox')
	set type(value) {
		if (value === this.#type) return;
		this.#type = value;
		this.#update('type');
	}
	#icon?: DOMContents;
	/** 图标 */
	get icon() {
		return this.#icon;
	}
	set icon(value) {
		if (value === this.#icon) return;
		this.#icon = value;
		this.#update('icon');
	}
	#label?: DOMContents;
	/** 标签 */
	get label() {
		return this.#label;
	}
	set label(value) {
		if (value === this.#label) return;
		this.#label = value;
		this.#update('label');
	}
	#disabled = false;
	/** 禁用 */
	get disabled() {
		return this.#disabled;
	}
	set disabled(value) {
		value = !!value;
		if (value === this.#disabled) return;
		this.#disabled = value;
		this.#update('disabled');
	}
	#hidden = false;
	/** 隐藏 */
	get hidden() {
		return this.#hidden;
	}
	set hidden(value) {
		value = !!value;
		if (value === this.#hidden) return;
		this.#hidden = value;
		this.#update('hidden');
	}
	/** 是否已选中 */
	[kChecked] = false;
	/** 隐藏 */
	get checked() {
		return this[kChecked];
	}
	set checked(value) {
		value = !!value;
		if (value === this[kChecked]) return;
		this[kChecked] = value;
		this.#update('checked');
	}
	/**
	 * 克隆
	 * @param deep 深克隆，包括子菜单项
	 */
	clone(deep?: boolean): MenuItem {
		let submenu: MenuItem[] | undefined;
		if (deep) submenu = this[kChildren].map((child) => child.clone(deep));
		return new MenuItem({
			icon: this.icon,
			label: this.label,
			type: this.type,
			disabled: this.disabled,
			hidden: this.hidden,
			checked: this.checked,
			id: this.id,
			action: this.action,
			submenu,
		});
	}
}

//#region Internal

interface ParsedOptions extends Omit<MenuOpenOptions, 'origin'> {
	rect: DOMRect;
}

function parseOrigin(input: unknown): DOMRect | null {
	if (input instanceof DOMRect) return input;
	if (input instanceof Element) return $rect(input);
	if (Vector2.isVec2(input)) return new DOMRect(input[0], input[1]);
	return null;
}

function isOptions(input: unknown): input is Partial<MenuOpenOptions> {
	return input !== null && typeof input === 'object';
}

function praseOptions(
	input: Element | DOMRect | Vec2 | MenuOpenOptions,
): ParsedOptions {
	let rect = parseOrigin(input);
	let preferSide: ParsedOptions['preferSide'];
	let preferAlign: ParsedOptions['preferAlign'];
	if (isOptions(input)) {
		if (!rect) rect = parseOrigin(input.origin);
		preferSide = input.preferSide;
		preferAlign = input.preferAlign;
	}
	if (!rect) throw new Error('Unknown origin', { cause: input });
	return { rect, preferSide, preferAlign };
}

interface MenuItemContext {
	element: HTMLElement;
	icon: HTMLElement;
	label: HTMLElement;
	mainEntry: HTMLElement;
	subEntry: HTMLElement;
}

function createItem(item: MenuItem, menu: Menu): MenuItemContext {
	item[kUpdate] = menu[kUpdate];
	const icon = $div({ className: 'ui-menu-icon' });
	const label = $div({ className: 'ui-menu-label' });
	const mainEntry = $div({ className: 'ui-menu-main' }, icon, label);
	const subEntry = $div({ className: 'ui-menu-enter' }, ico('ui.menuEnter'));
	const element = $div({ className: 'ui-menu-item' }, mainEntry, subEntry);
	const ctx: MenuItemContext = { element, icon, label, mainEntry, subEntry };

	const activatable = () => !!item.action || item.type === 'checkbox';

	state.hover.add(mainEntry);
	state.active.on(mainEntry, (active, cancel) => {
		if (item.disabled || active || cancel || item.type === 'separator') return;
		if (item.type === 'checkbox') item.checked = !item.checked;
		try {
			if (item.action?.(item)) return;
		} catch (error) {
			console.error(error);
		}
		if (!item.action && item.type !== 'checkbox') return;
		menu.close();
	});
	state.hover.add(subEntry);
	state.active.on(subEntry, (active, cancel) => {
		if (item.disabled || active || cancel || item.type === 'separator') return;
		if (item[kChildren].length === 0) return;
		if (!activatable()) return;
		menu[kEnter](item);
	});
	state.hover.add(element);
	state.active.on(element, (active, cancel) => {
		if (item.disabled || active || cancel || item.type === 'separator') return;
		if (item[kChildren].length === 0) return;
		if (activatable()) return;
		menu[kEnter](item);
	});

	updateItem(item, ctx);
	return ctx;
}

function updateItem(
	item: MenuItem,
	ctx: MenuItemContext,
	type?: UpdateType,
): void {
	if (!type || type === 'child') {
		ctx.element.classList.toggle('ui-menu-sub', item[kChildren].length > 0);
	}
	if (!type || ['action', 'type', 'child', 'checkbox'].includes(type)) {
		const activatable =
			(item.type === 'checkbox' || !!item.action) && item.type !== 'separator';
		const hasChild = item[kChildren].length > 0;
		const enabled = !item.disabled;
		ctx.mainEntry.toggleAttribute(
			'nav',
			(activatable || !(hasChild || activatable)) && enabled,
		);
		ctx.subEntry.toggleAttribute('nav', hasChild && activatable && enabled);
		ctx.element.toggleAttribute('nav', hasChild && !activatable && enabled);
	}
	if (!type || type === 'type') {
		ctx.element.classList.toggle('ui-menu-sep', item.type === 'separator');
	}
	if (!type || type === 'icon' || type === 'checked') {
		const icon =
			item.type === 'checkbox' && item.checked
				? ico('ui.menuCheckmark')
				: (item.icon ?? []);
		ctx.icon.replaceChildren(...asArray(icon));
	}
	if (!type || type === 'label') {
		ctx.label.replaceChildren(...asArray(item.label ?? []));
	}
	if (!type || type === 'disabled') {
		ctx.element.classList.toggle('ui-menu-disabled', item.disabled);
	}
	if (!type || type === 'hidden') {
		ctx.element.classList.toggle('ui-menu-hidden', item.hidden);
	}
}

function layout(list: HTMLElement, menu: Menu, container: HTMLElement): void {
	const { vSize, hSize, hStart, hEnd, vStart, vEnd } = safeRect;
	let height = Math.min(list.scrollHeight, vSize - 33);
	let width = Math.min(list.offsetWidth, hSize);
	let top: number | undefined;
	let right: number | undefined;
	let bottom: number | undefined;
	let left: number | undefined;
	const { rect, preferSide, preferAlign } = menu[kOrigin]!;
	const gapL = rect.left - hStart;
	const gapR = hEnd - rect.right;
	const gapT = rect.top - vStart;
	const gapB = vEnd - rect.bottom;
	switch (preferSide) {
		case 'right':
			if (gapR < width && gapL > gapR) {
				right = rect.left;
				width = Math.min(width, gapL);
			} else {
				left = rect.right;
				width = Math.min(width, gapR);
			}
			break;
		case 'left':
			if (gapL < width && gapR > gapL) {
				left = rect.right;
				width = Math.min(width, gapR);
			} else {
				right = rect.left;
				width = Math.min(width, gapL);
			}
			break;
		case 'top':
			if (gapT < height && gapB > gapT) {
				top = rect.bottom;
				height = Math.min(height, gapB);
			} else {
				bottom = rect.top;
				height = Math.min(height, gapT);
			}
			break;
		default:
			if (gapB < height && gapT > gapB) {
				bottom = rect.top;
				height = Math.min(height, gapT);
			} else {
				top = rect.bottom;
				height = Math.min(height, gapB);
			}
	}
	if (['left', 'right'].includes(preferSide!)) {
		if (preferAlign === 'end') {
			bottom = Math.max(rect.bottom, vStart + height);
		} else {
			top = Math.min(rect.top, vEnd - height);
		}
	} else if (preferAlign === 'end') {
		right = Math.max(rect.right, hStart + width);
	} else {
		left = Math.min(rect.left, hEnd - width);
	}

	$style(container, {
		top,
		right,
		bottom,
		left,
		$height: height,
		$width: width,
	});
}

function renderMenu(
	menu: Menu,
	current: MenuItem,
	transition: 'enter' | 'back' | 'refresh' = 'enter',
): Map<MenuItem, MenuItemContext> {
	type Pair = [MenuItem, MenuItemContext];
	const container = menu[kContainer];
	const list = menu[kList];
	const children = current[kChildren];
	const items = children.map<Pair>((item) => [item, createItem(item, menu)]);
	const elements = items.map(([_, { element }]) => element);

	list.replaceChildren(...elements);
	menu[kBackLabel].replaceChildren(...asArray(current.label ?? []));
	list.setAttribute('transition', transition);

	layout(list, menu, container);

	return new Map(items);
}

//#region Menu

/** 菜单打开参数 */
export interface MenuOpenOptions {
	/** 菜单打开原点 */
	origin: Element | DOMRect | Vec2;
	/**
	 * 偏好位置
	 * @default 'bottom'
	 */
	preferSide?: 'top' | 'right' | 'bottom' | 'left';
	/**
	 * 偏好对齐
	 * @default 'start'
	 */
	preferAlign?: 'start' | 'end';
}

/** 菜单 */
export class Menu extends MenuItem {
	#backdrop = $div({ className: 'backdrop' });
	[kBackLabel] = $div({ className: 'ui-menu-label' });
	#back = $div(
		{ className: 'ui-menu-main ui-menu-back' },
		$div({ className: 'ui-menu-icon' }, ico('ui.menuBack')),
		this[kBackLabel],
	);
	[kList] = $div({ className: 'ui-menu-list' });
	[kContainer] = $div<Navigable>(
		{ className: 'safe-size overlay surface-glass ui-menu' },
		this.#back,
		this[kList],
	);
	#path: MenuItem[] = [];
	#ctxs!: Map<MenuItem, MenuItemContext>;
	constructor(items?: MenuItemInit['submenu']) {
		super({ submenu: items });
		state.active.on(this.#backdrop, () => this.close());
		state.hover.add(this.#back);
		state.active.on(this.#back, (active, cancel) => {
			if (active || cancel) return;
			this[kBack]();
		});
		this[kContainer].navCallback = (state) => {
			if (state.type !== 'back') return;
			if (this.#path.length > 0) this[kBack]();
			else this.close();
		};
	}
	[kOrigin]?: ParsedOptions;
	[kUpdate] = (item: MenuItem, type: UpdateType) => {
		if (!this[kContainer].isConnected) return;
		const current = this.#path.at(-1) ?? this;
		if (item === current) {
			if (type === 'child') {
				this.#ctxs = renderMenu(this, item, 'refresh');
			} else if (type === 'label') {
				this[kBackLabel].replaceChildren(...asArray(item.label ?? []));
			}
			return;
		}
		const ctx = this.#ctxs.get(item);
		if (!ctx) return;
		updateItem(item, ctx, type);
	};
	/** 进入次级菜单 */
	[kEnter](item: MenuItem) {
		this.#path.push(item);
		this.#ctxs = renderMenu(this, item);
		this.#back.classList.add('ui-menu-back-show');
		this.#back.setAttribute('nav', '');
		navigate.setCurrent(this.#back);
	}
	/** 回到上级菜单 */
	[kBack]() {
		const prev = this.#path.pop();
		if (!prev) return;
		const item = this.#path.at(-1) ?? this;
		this.#ctxs = renderMenu(this, item, 'back');
		const { subEntry, element } = this.#ctxs.get(prev)!;
		navigate.setCurrent(subEntry.hasAttribute('nav') ? subEntry : element);
		if (item !== this) return;
		this.#back.classList.remove('ui-menu-back-show');
		this.#back.removeAttribute('nav');
	}
	/** 打开菜单 */
	open(origin: Element | DOMRect | Vec2 | MenuOpenOptions): void {
		let hasItem = false;
		for (const item of this[kChildren]) {
			if (item.hidden) continue;
			hasItem = true;
			break;
		}
		if (!hasItem) return;
		document.body.append(this.#backdrop, this[kContainer]);
		this[kOrigin] = praseOptions(origin);
		this.#ctxs = renderMenu(this, this);
		this[kContainer].classList.add('ui-menu-show');
		navigate.addLayer(this[kContainer]);
	}
	/** 关闭菜单 */
	close(): void {
		this.#path = [];
		this.#backdrop.remove();
		this[kContainer].animate({ opacity: 0 }, 100).onfinish = () => {
			this[kContainer].remove();
			this[kContainer].classList.remove('ui-menu-show');
			this.#back.classList.remove('ui-menu-back-show');
			this.#back.removeAttribute('nav');
		};
		navigate.rmLayer(this[kContainer]);
	}
	/** 克隆菜单 */
	clone(): Menu {
		return new Menu(this[kChildren].map((child) => child.clone(true)));
	}
}
