import { property } from '../infra/decorator';
import { Component } from './base';

/**
 * 键控组件
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/keyed)
 */
export abstract class KeyedComponent<
	T = string,
	P extends {} = {},
	E extends {} = {},
> extends Component<P, E> {
	#keyInitialized = false;
	#key: T = this.initial ? this.initial() : ('' as T);
	/** 键 */
	@property()
	get key() {
		return this.#key;
	}
	set key(value) {
		const key = (this.parse ?? String)(value);
		if (key === this.#key) return;
		if (this.validate?.(key) === false) return;
		this.#key = key;
		this.#keyInitialized = true;
		this.update?.();
	}
	/** 键更新回调 */
	protected update?(): void;
	/** 初始键 */
	protected initial?(): T;
	/** 键类型转换 */
	protected parse?(input: unknown): T;
	/** 键校验 */
	protected validate?(key: unknown): key is T;
	protected init(): void {
		if (this.#keyInitialized) return;
		this.key = this.textContent as T;
	}
	protected clone(from: this): void {
		if (!from.#keyInitialized) return;
		this.key = from.key;
	}
}
