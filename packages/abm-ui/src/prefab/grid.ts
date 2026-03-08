import { GridItem } from '../component/grid';
import { defineElement } from '../infra/decorator';
import { $new, $slot } from '../infra/dom';
import { $style, type StyleDeclaration } from '../infra/style';
import { state } from '../state';

/** 预制网格项配置选项 */
export interface PrefabGridItemOptions<T, I> {
	/**
	 * 网格项渲染函数
	 * @param self - 网格项实例，用于访问值和其他属性
	 * @example
	 * render: (self) => {
	 *   self.textContent = `Item: ${self.value.name}`;
	 * }
	 */
	render: (self: PrefabGridItem<T> & I) => any;
	/**
	 * active 事件触发器
	 * @see {@link GridItem.activeTrigger}
	 */
	activeTrigger?: HTMLElement | true;
	/**
	 * 选择触发器
	 * @see {@link GridItem.selectTrigger}
	 */
	selectTrigger?: HTMLElement | true;
	/** 可悬停 */
	hoverable?: boolean;
	/** 可激活 */
	activatable?: boolean;
	/** 可导航 */
	navigable?: boolean;
	/** 样式 */
	style?: StyleDeclaration | string | CSSStyleSheet;
	/** 初始化回调 */
	init?: (self: PrefabGridItem<T> & I) => void;
}

/**
 * 预制网格项元素
 * @example
 * // 创建网格项创建器
 * const itemCreator = gridItem({
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
 * // 在网格中使用
 * grid.itemCreator = itemCreator;
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/prefab/grid)
 */
@defineElement('abm-grid-item')
export class PrefabGridItem<T = any> extends GridItem<T> {
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
	updateStyles(...sheets: (CSSStyleSheet | string)[]): void {
		super.updateStyles(...sheets);
	}
	/** 创建预制网格项生成器 */
	static creator<T, I = {}>(
		options: PrefabGridItemOptions<T, I> | PrefabGridItemOptions<T, I>['render'],
	): (value: T) => GridItem<T> & I {
		return (value) => {
			if (typeof options === 'function') options = { render: options };
			const item = $new(PrefabGridItem<T>) as PrefabGridItem<T> & I;
			item.render = options.render;
			item.value = value;
			if (options.activeTrigger === true) item.activeTrigger = item;
			else item.activeTrigger = options.activeTrigger;
			if (options.selectTrigger === true) item.selectTrigger = item;
			else item.selectTrigger = options.selectTrigger;
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
