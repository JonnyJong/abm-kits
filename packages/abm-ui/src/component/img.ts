import { toType } from 'abm-utils';
import { defineElement, property } from '../infra/decorator';
import type { ElementProps } from '../infra/dom';
import { $div, $new, $slot } from '../infra/dom';
import { $on } from '../infra/event';
import { register } from '../infra/registry';
import { css } from '../infra/style';
import type { AriaConfig } from './base';
import { FormControl } from './form';

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-img': Img;
	}
}

declare module '../infra/registry' {
	interface Registry {
		img: Img;
	}
}

export interface ImageProps extends ElementProps<Img> {}

/**
 * 图像
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form/img)
 */
@register('img')
@defineElement('abm-img')
export class Img extends FormControl<string, ImageProps> {
	protected static style = css`
		:host {
			position: relative;
			overflow: clip;
		}
		.img {
			position: relative;
			display: block;
			height: 100%;
			width: 100%;
			object-fit: inherit;
			transition: .1s opacity;
		}
		.fallback { display: none }
		.show { display: block }
		.show~.img {
			position: absolute;
			visibility: hidden;
			opacity: 0
		}
	`;
	protected static aria: AriaConfig = { role: 'img' };
	#img: HTMLImageElement = $new('img', { class: 'img' });
	#fallback = $div({ class: 'fallback show' }, $slot());
	constructor(_props?: ImageProps) {
		super();
		this.attachShadow({}, this.#fallback, this.#img);
		$on(this.#img, 'load', () => this.#fallback.classList.remove('show'));
		$on(this.#img, 'error', () => this.#fallback.classList.add('show'));
	}
	@property()
	@toType(String)
	accessor default = '';
	@property()
	@toType(String)
	get value() {
		return this.#img.src;
	}
	set value(value) {
		this.#img.src = value;
	}
	@property({ toValue: Boolean })
	@toType(Boolean)
	get lazy() {
		return this.#img.loading === 'lazy';
	}
	set lazy(value) {
		this.#img.loading = value ? 'lazy' : 'eager';
	}
	#label = '';
	@property()
	@toType(String)
	get label() {
		return this.#label;
	}
	set label(value) {
		this.#label = value;
		this.ariaLabel = value;
	}
	protected clone(from: this): void {
		this.lazy = from.lazy;
		super.clone(from);
	}
}
