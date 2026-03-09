import { Color, toType } from 'abm-utils';
import { defineElement, property } from '../infra/decorator';
import type { ElementProps } from '../infra/dom';
import { $div, $new, $slot } from '../infra/dom';
import { $on } from '../infra/event';
import { register } from '../infra/registry';
import { $style, css } from '../infra/style';
import type { AriaConfig } from './base';
import { FormControl } from './form';

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-avatar': Avatar;
	}
}

declare module '../infra/registry' {
	interface Registry {
		avatar: Avatar;
	}
}

export interface AvatarProp extends ElementProps<Avatar> {}

/**
 * 头像
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form/avatar)
 */
@register('avatar')
@defineElement('abm-avatar')
export class Avatar extends FormControl<string | undefined, AvatarProp> {
	protected static style = css`
		:host {
			position: relative;
			display: inline-block;
			overflow: clip;
			--size: 32px;
			width: var(--size);
			height: var(--size);
			border-radius: 50%;
		}
		:host([squared]) {
			border-radius: var(--border-radius);
		}
		.img {
			position: relative;
			display: block;
			height: 100%;
			width: 100%;
			object-fit: inherit;
			transition: .1s opacity;
		}
		.fallback {
			display: none;
			height: 100%;
			width: 100%;
			justify-content: center;
			align-items: center;
			background: var(--primary);
		}
		.show { display: flex }
		.show~.img {
			position: absolute;
			visibility: hidden;
			opacity: 0
		}
	`;
	protected static aria: AriaConfig = { role: 'img' };
	#value?: string;
	#img: HTMLImageElement = $new('img', { className: 'img' });
	#fallback = $div({ className: 'fallback show' }, $slot());
	constructor(_props?: AvatarProp) {
		super();
		this.attachShadow({}, this.#fallback, this.#img);
		$on(this.#img, 'load', () => this.#fallback.classList.remove('show'));
		$on(this.#img, 'error', () => this.#fallback.classList.add('show'));
	}
	protected init(): void {
		const color = Color.oklch([0.6, 0.12, 360 * Math.random()]);
		$style(this, { $primary: color.hex() });
	}
	@property()
	accessor default: string | undefined = '';
	@property()
	get value() {
		return this.#value;
	}
	set value(value) {
		this.#value = value;
		this.#img.src = value ?? '';
	}
	@property({ toValue: Boolean })
	@toType(Boolean)
	get lazy() {
		return this.#img.loading === 'lazy';
	}
	set lazy(value) {
		this.#img.loading = value ? 'lazy' : 'eager';
	}
	/** 方形 */
	@property({ reflect: true, toValue: Boolean })
	accessor squared = false;
	protected clone(from: this): void {
		super.clone(from);
		this.lazy = from.lazy;
		this.squared = from.squared;
	}
}
