import { EventEmitter } from 'abm-utils';
import { defineElement } from '../infra/decorator';
import { $new, type DOMApplyOptions, type ElementProps } from '../infra/dom';
import { register } from '../infra/registry';
import { css } from '../infra/style';
import type { AriaConfig } from './base';
import { KeyedComponent } from './keyed';

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-icon': Icon;
	}
}

declare module '../infra/registry' {
	interface Registry {
		icon: Icon;
	}
}

//#region Define
/** 图标词典 */
export type IconDict = {
	[K in string]: string | IconDict;
};

/** 预设图标 */
// biome-ignore lint/suspicious/noEmptyInterface: 留空以便合并声明
export interface PresetIcons {}

/** 图标定义 */
export interface IconRegistry {
	/** 预设图标 */
	ui: PresetIcons;
}

type Join<K, P> = K extends string
	? P extends string
		? `${K}.${P}`
		: never
	: never;

/** 图标键 */
export type IconKey<T extends object = IconRegistry> = {
	[K in keyof T]: T[K] extends string
		? K
		: T[K] extends object
			? Join<K, IconKey<T[K]>>
			: never;
}[keyof T];

/** 图标包定义 */
export type IconPackageDefine<T extends IconDict> = {
	[K in keyof T]: T[K] extends string
		? string
		: T[K] extends IconDict
			? IconPackageDefine<T[K]>
			: never;
};

/** 图标包 */
export type IconPackage<T extends object = IconRegistry> = {
	[K in keyof T]?: T[K] extends string
		? string
		: T[K] extends object
			? IconPackage<T[K]>
			: never;
};

//#region Icon
export interface IconProps extends ElementProps<Icon> {}

/**
 * 图标
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/icon)
 */
@register('icon')
@defineElement('abm-icon')
export class Icon extends KeyedComponent<IconKey, IconProps> {
	protected static style = css`
		:host {
			display: inline-block;
			height: 1em;
			width: 1em;
		}
		svg {
			display: block;
			height: 100%;
			width: 100%;
			fill: currentColor;
		}
	`;
	protected static aria: AriaConfig = { role: 'img', label: '' };
	private static icons = new Map<string, string>();
	private static emitter = new EventEmitter<{ update: [key: string] }>();
	#root = this.attachShadow();
	#locked = false;
	/** 锁定图标，不允许通过键名修改图标 */
	protected lock(html = ''): ShadowRoot {
		this.#locked = true;
		Icon.emitter.off('update', this.#handleUpdate);
		this.#root.innerHTML = html;
		return this.#root;
	}
	protected connectedCallback(): void {
		super.connectedCallback();
		if (this.#locked) return;
		Icon.emitter.on('update', this.#handleUpdate);
	}
	protected disconnectedCallback(): void {
		super.disconnectedCallback();
		Icon.emitter.off('update', this.#handleUpdate);
	}
	#handleUpdate = (key: string) => {
		if (this.#locked) return;
		if (key !== this.key) return;
		this.update();
	};
	/** 更新图标显示 */
	update() {
		if (this.#locked) return;
		this.#root.innerHTML = Icon.icons.get(this.key) ?? '';
		this.ariaLabel = this.key;
	}
	protected clone(from: this): void {
		if (this.#locked) return;
		if (from.#locked) this.#root.innerHTML = from.#root.innerHTML;
		else super.clone(from);
	}
	/** 注册图标包 */
	static register(icons: IconPackage) {
		const stack: { dict: IconDict; path: string }[] = [{ dict: icons, path: '' }];
		while (stack.length > 0) {
			const { dict, path } = stack.pop()!;
			for (const [key, value] of Object.entries(dict)) {
				const newPath = path ? `${path}.${key}` : key;
				if (typeof value === 'string') {
					Icon.icons.set(newPath, value);
					Icon.emitter.emit('update', newPath);
					continue;
				}
				if (!value) continue;
				if (typeof value !== 'object') continue;
				stack.push({ dict: value, path: newPath });
			}
		}
	}
	/** 从 SVG 字符串创建图标 */
	static svg(svg: string): Icon {
		const icon = $new(Icon);
		icon.lock(svg);
		return icon;
	}
}

/** 创建图标元素 */
export function ico(
	key: IconKey,
	options?: DOMApplyOptions<typeof Icon, Icon>,
): Icon {
	return $new(Icon, { ...options, key });
}
