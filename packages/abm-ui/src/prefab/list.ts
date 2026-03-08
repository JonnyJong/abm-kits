import { ListItem } from '../component/list';
import { defineElement } from '../infra/decorator';
import { $new, $slot } from '../infra/dom';
import { $style, type StyleDeclaration } from '../infra/style';
import { state } from '../state';

/** 预制列表项配置选项 */
export interface PrefabListItemOptions<T, I> {
	/**
	 * 列表项渲染函数
	 * @param self - 列表项实例，用于访问值和其他属性
	 * @example
	 * render: (self) => {
	 *   self.textContent = `Item: ${self.value.name}`;
	 * }
	 */
	render: (self: PrefabListItem<T> & I) => any;
	/**
	 * active 事件触发器
	 * @see {@link ListItem.activeTrigger}
	 */
	activeTrigger?: HTMLElement | true;
	/**
	 * 选择触发器
	 * @see {@link ListItem.selectTrigger}
	 */
	selectTrigger?: HTMLElement | true;
	/**
	 * 拖拽把手
	 * @see {@link ListItem.dragHandle}
	 */
	dragHandle?: HTMLElement | true;
	/** 可悬停 */
	hoverable?: boolean;
	/** 可激活 */
	activatable?: boolean;
	/** 可导航 */
	navigable?: boolean;
	/** 样式 */
	style?: StyleDeclaration | string | CSSStyleSheet;
	/** 初始化回调 */
	init?: (self: PrefabListItem<T> & I) => void;
}

/**
 * 预制列表项元素
 * @example
 * // 创建列表项创建器
 * const itemCreator = PrefabListItem.creator({
 *   render: (self) => {
 *     self.textContent = String(self.value);
 *   },
 *   init(self) {
 *     // 将自身作为选择触发器
 *     self.selectTrigger = self;
 *   },
 *   // 启用导航
 *   navigable: true,
 * });
 *
 * // 在列表中使用
 * list.itemCreator = itemCreator;
 * [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/prefab/list)
 */
@defineElement('abm-list-item')
export class PrefabListItem<T = any> extends ListItem<T> {
	constructor() {
		super();
		this.attachShadow({}, $slot());
	}
	#value!: T;
	get value() {
		return this.#value;
	}
	set value(value) {
		this.#value = value;
		this.render(this);
	}
	#init?: (self: this) => any;
	protected init(): void {
		this.#init?.(this);
	}
	render!: (self: this) => any;
	get activeTrigger() {
		return super.activeTrigger;
	}
	set activeTrigger(value) {
		super.activeTrigger = value;
	}
	get selectTrigger() {
		return super.selectTrigger;
	}
	set selectTrigger(value) {
		super.selectTrigger = value;
	}
	get dragHandle() {
		return super.dragHandle;
	}
	set dragHandle(value) {
		super.dragHandle = value;
	}
	updateStyles(...sheets: (CSSStyleSheet | string)[]): void {
		super.updateStyles(...sheets);
	}
	/* navCallback(state: NavState) {
		if (state.type === 'focus') {
			navigate.lock(this);
			super.sortStart();
			return;
		}
		if (state.type === 'cancel' || state.type === 'blur') {
			navigate.unlock();
			super.stopSort();
			return;
		}
		super.handleNavSort(state);
	} */
	/** 创建预制列表项生成器 */
	static creator<T, I = {}>(
		options: PrefabListItemOptions<T, I> | PrefabListItemOptions<T, I>['render'],
	): (value: T) => ListItem<T> {
		return (value) => {
			if (typeof options === 'function') options = { render: options };
			const item = $new(PrefabListItem<T>) as PrefabListItem<T> & I;
			item.render = options.render;
			item.value = value;
			if (options.activeTrigger === true) item.activeTrigger = item;
			else item.activeTrigger = options.activeTrigger;
			if (options.selectTrigger === true) item.selectTrigger = item;
			else item.selectTrigger = options.selectTrigger;
			if (options.dragHandle === true) item.dragHandle = item;
			else item.dragHandle = options.dragHandle;
			if (options.hoverable) state.hover.add(item);
			if (options.activatable) state.active.add(item);
			if (options.navigable) item.toggleAttribute('nav', true);
			if (options.style instanceof CSSStyleSheet) item.updateStyles(options.style);
			else $style(item, options.style);
			item.#init = options.init;
			return item;
		};
	}
}
