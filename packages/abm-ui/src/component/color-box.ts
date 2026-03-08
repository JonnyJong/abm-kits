import { Color, typeCheck } from 'abm-utils';
import { defineElement, property } from '../infra/decorator';
import type { ElementProps } from '../infra/dom';
import { $new } from '../infra/dom';
import { $style, css } from '../infra/style';
import { state } from '../state';
import { Dialog } from '../widget/dialog';
import { Flyout } from '../widget/flyout';
import type { AriaConfig } from './base';
import { ColorPicker } from './color-picker';
import { FormControl } from './form';
import { t } from './i18n';

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-color-box': ColorBox;
	}
}

export interface ColorBoxProp extends ElementProps<ColorBox> {}

/**
 * 颜色输入
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form/color-box)
 */
@defineElement('abm-color-box')
export class ColorBox extends FormControl<Color, ColorBoxProp> {
	protected static navigable = true;
	protected static style = css`
		:host {
			display: inline-block;
			height: 32px;
			width: 32px;
			border-radius: var(--border-radius);
			background: linear-gradient(45deg, #888 25%, #0000 0px, #0000 75%, #888 0px) 0px 0px / 20px 20px, linear-gradient(45deg, #888 25%, #0000 0px, #0000 75%, #888 0px) 10px 10px / 20px 20px, #ddd;
			overflow: clip;
		}
		:host::before {
			content: '';
			display: block;
			width: 100%;
			height: 100%;
			background: var(--value, #000);
		}
	`;
	protected static aria: AriaConfig = {
		role: 'button',
		hasPopup: 'dialog',
		expanded: false,
		label: 'Color box: #000000',
	};
	#value = new Color();
	constructor(_props?: ColorBoxProp) {
		super();
		this.attachShadow();
		state.active.on(this, (active, cancel) => this.#handleActive(active, cancel));
	}
	async #handleActive(active: boolean, cancel: boolean) {
		if (this.disabled || active || cancel) return;
		let type = this.picker;
		if (type === 'auto') {
			type = matchMedia('(pointer: coarse)').matches ? 'dialog' : 'flyout';
		}
		const picker = $new(ColorPicker, {
			enableAlpha: this.#enableAlpha,
			value: this.#value,
		});
		if (type === 'dialog') {
			const result = await Dialog.confirm({
				title: t('ui.colorPicker'),
				content: picker,
			});
			if (!result) return;
		} else {
			await Flyout.alert(this, { content: picker });
		}
		this.#value = picker.value;
		this.#updateView();
		this.emitUpdate(true);
	}
	#updateView() {
		const value = this.#enableAlpha ? this.#value.hexa() : this.#value.hex();
		$style(this, { $value: this.#value.hexa() });
		this.updateAria({ label: `Color box: ${value}` });
	}
	default = Color.hex('#000');
	@property()
	@typeCheck(Color, String)
	get value(): Color {
		return this.#value.clone();
	}
	set value(value: Color | string) {
		if (value instanceof Color) {
			this.#value = value.clone();
		} else {
			const color = Color.parseHEX(value);
			if (!color) return;
			this.#value = Color.rgba(color);
		}
		if (!this.#enableAlpha) this.#value.alpha(1);
		this.#updateView();
	}
	#enableAlpha = false;
	/** 启用透明度通道 */
	@property({ toValue: Boolean })
	get enableAlpha() {
		return this.#enableAlpha;
	}
	set enableAlpha(value) {
		value = !!value;
		if (this.#enableAlpha === value) return;
		this.#enableAlpha = value;
		if (!value) this.#value.alpha(1);
		this.#updateView();
	}
	/** 颜色选择器打开方式 */
	@property()
	@typeCheck('auto', 'dialog', 'flyout')
	accessor picker: 'auto' | 'dialog' | 'flyout' = 'auto';
	protected clone(from: this): void {
		this.enableAlpha = from.enableAlpha;
		this.picker = from.picker;
		super.clone(from);
	}
}
