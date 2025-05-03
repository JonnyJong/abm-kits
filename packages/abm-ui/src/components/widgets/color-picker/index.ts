import { Signal } from '@lit-labs/signals';
import {
	$div,
	$new,
	Color,
	EventValue,
	EventValueInit,
	EventsList,
	css,
} from 'abm-utils';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { configs } from '../../../configs';
import { Navigable } from '../../../navigate';
import { Widget } from '../base';
import { WidgetNumber } from '../input/number';
import { WidgetText } from '../input/text';
import { WidgetNav } from '../nav';
import { WidgetSlider } from '../slider';
import { WidgetSlider2D } from '../slider-2d';
import CSS from './index.styl';

interface WidgetColorPickerEventsInit {
	/** 输入事件 */
	input: EventValueInit<WidgetColorPicker, Color>;
	/** 更改事件 */
	change: EventValueInit<WidgetColorPicker, Color>;
}

export interface WidgetColorPickerEvents
	extends EventsList<WidgetColorPickerEventsInit> {}

export interface WidgetColorPickerProp {
	/** 颜色 */
	value?: string | Color;
	/** 禁用 */
	disabled?: boolean;
	/** 启用透明度 */
	enableAlpha?: boolean;
}

const SLIDER_H = { gridArea: 'h-slider' };
const SLIDER_S = { gridArea: 's-slider' };
const SLIDER_L = { gridArea: 'l-slider' };
const VALUE_H = { gridArea: 'h-value' };
const VALUE_S = { gridArea: 's-value' };
const VALUE_L = { gridArea: 'l-value' };
const SLIDER_U8 = { from: 0, to: 255, step: 1 };
const VALUE_U8 = { min: 0, max: 255, step: 1 };
const SLIDER_HUE = { from: 0, to: 360 };
const VALUE_HUE = { min: 0, max: 360 };
const VALUE_SL = { min: 0, max: 100 };

const HEX_REGEX = /[0-9a-fA-F]{1,8}/;

const SLIDER_THUMB = '--w-slider-thumb-front';
const SLIDER_TRACK = '--w-slider-track';

@customElement('w-color-picker')
export class WidgetColorPicker
	extends Widget<WidgetColorPickerEventsInit>
	implements Navigable
{
	static styles = css(CSS);
	#color = configs.theme.color;
	#current = this.#color.clone();
	constructor() {
		super(['input', 'change'], false, true);
		this.#updateHEX();
		this.#updateIndicator();
		this.#updateRGB();
		this.#updateHSL(true);
		this.#updateAlpha();
		// Nav
		for (const element of this.navChildren) {
			(element as Navigable).navParent = this;
		}
		//#region #Events
		this.#tab.on('change', ({ value }) => {
			this.#rgbOrHsl.set(value === 'rgb');
			this.#updateHSL();
			this.#updateRGB();
		});
		// HEX
		this.#hexValue.on('input', () => {
			const result = this.#hexValue.value.match(HEX_REGEX);
			if (!result) return;
			let hex = result[0];
			if (hex.length < 3) {
				hex = hex.repeat(3).slice(0, 3);
			} else if (hex.length === 5) {
				hex += hex[4];
			} else if (hex.length === 7) {
				hex += hex[6];
			}
			if (hex.length === 3) hex += 'f';
			if (hex.length === 6) hex += 'ff';
			this.#current.hexa(hex);
			this.#updateIndicator();
			this.#updateRGB();
			this.#updateHSL();
			this.#updateAlpha();
			this.#emit(true);
		});
		this.#hexValue.on('confirm', () => {
			this.#updateHEX();
			this.#emit();
		});
		// Alpha
		this.#alphaSlider.on('input', ({ value }) => {
			this.#alphaValue.value = value;
			this.#current.alphaByte(value);
			this.#updateIndicator();
			this.#updateHEX();
			this.#emit(true);
		});
		this.#alphaSlider.on('change', () => {
			this.#alphaValue.value = this.#alphaSlider.value;
			this.#current.alphaByte(this.#alphaSlider.value);
			this.#updateIndicator();
			this.#emit();
		});
		this.#alphaValue.on('input', () => {
			this.#alphaSlider.value = this.#alphaValue.value;
			this.#current.alphaByte(this.#alphaValue.value);
			this.#updateIndicator();
			this.#emit(true);
		});
		this.#alphaValue.on('confirm', () => this.#emit());
		// RGB
		this.#rSlider.on('input', ({ value }) => {
			this.#current.rgba([
				value,
				this.#gSlider.value,
				this.#bSlider.value,
				this.#alphaSlider.value,
			]);
			this.#rValue.value = value;
			this.#rSlider.style.setProperty(
				SLIDER_THUMB,
				`#${value.toString(16).padStart(2, '0')}0000`,
			);
			this.#updateIndicator();
			this.#updateHEX();
			this.#updateHSL();
			this.#emit(true);
		});
		this.#rSlider.on('change', () => {
			this.#current.rgba([
				this.#rSlider.value,
				this.#gSlider.value,
				this.#bSlider.value,
				this.#alphaSlider.value,
			]);
			this.#rValue.value = this.#rSlider.value;
			this.#rSlider.style.setProperty(
				SLIDER_THUMB,
				`#${this.#rSlider.value.toString(16).padStart(2, '0')}0000`,
			);
			this.#updateIndicator();
			this.#updateHEX();
			this.#updateHSL();
			this.#emit();
		});
		this.#rValue.on('input', () => {
			this.#current.rgba([
				this.#rValue.value,
				this.#gSlider.value,
				this.#bSlider.value,
				this.#alphaSlider.value,
			]);
			this.#rSlider.value = this.#rValue.value;
			this.#rSlider.style.setProperty(
				SLIDER_THUMB,
				`#${this.#rValue.value.toString(16).padStart(2, '0')}0000`,
			);
			this.#updateIndicator();
			this.#updateHEX();
			this.#updateHSL();
			this.#emit(true);
		});
		this.#rValue.on('confirm', () => this.#emit());
		this.#gSlider.on('input', ({ value }) => {
			this.#current.rgba([
				this.#rSlider.value,
				value,
				this.#bSlider.value,
				this.#alphaSlider.value,
			]);
			this.#gValue.value = value;
			this.#gSlider.style.setProperty(
				SLIDER_THUMB,
				`#00${value.toString(16).padStart(2, '0')}00`,
			);
			this.#updateIndicator();
			this.#updateHEX();
			this.#updateHSL();
			this.#emit(true);
		});
		this.#gSlider.on('change', () => {
			this.#current.rgba([
				this.#rSlider.value,
				this.#gSlider.value,
				this.#bSlider.value,
				this.#alphaSlider.value,
			]);
			this.#gValue.value = this.#gSlider.value;
			this.#gSlider.style.setProperty(
				SLIDER_THUMB,
				`#00${this.#gSlider.value.toString(16).padStart(2, '0')}00`,
			);
			this.#updateIndicator();
			this.#updateHEX();
			this.#updateHSL();
			this.#emit();
		});
		this.#gValue.on('input', () => {
			this.#current.rgba([
				this.#rSlider.value,
				this.#gValue.value,
				this.#bSlider.value,
				this.#alphaSlider.value,
			]);
			this.#gSlider.value = this.#gValue.value;
			this.#gSlider.style.setProperty(
				SLIDER_THUMB,
				`#00${this.#gValue.value.toString(16).padStart(2, '0')}00`,
			);
			this.#updateIndicator();
			this.#updateHEX();
			this.#updateHSL();
			this.#emit(true);
		});
		this.#gValue.on('confirm', () => this.#emit());
		this.#bSlider.on('input', ({ value }) => {
			this.#current.rgba([
				this.#rSlider.value,
				this.#gSlider.value,
				value,
				this.#alphaSlider.value,
			]);
			this.#bValue.value = value;
			this.#bSlider.style.setProperty(
				SLIDER_THUMB,
				`#0000${value.toString(16).padStart(2, '0')}`,
			);
			this.#updateIndicator();
			this.#updateHEX();
			this.#updateHSL();
			this.#emit(true);
		});
		this.#bSlider.on('change', () => {
			this.#current.rgba([
				this.#rSlider.value,
				this.#gSlider.value,
				this.#bSlider.value,
				this.#alphaSlider.value,
			]);
			this.#bValue.value = this.#bSlider.value;
			this.#bSlider.style.setProperty(
				SLIDER_THUMB,
				`#0000${this.#bSlider.value.toString(16).padStart(2, '0')}`,
			);
			this.#updateIndicator();
			this.#updateHEX();
			this.#updateHSL();
			this.#emit();
		});
		this.#bValue.on('input', () => {
			this.#current.rgba([
				this.#rSlider.value,
				this.#gSlider.value,
				this.#bValue.value,
				this.#alphaSlider.value,
			]);
			this.#bSlider.value = this.#bValue.value;
			this.#bSlider.style.setProperty(
				SLIDER_THUMB,
				`#0000${this.#bValue.value.toString(16).padStart(2, '0')}`,
			);
			this.#updateIndicator();
			this.#updateHEX();
			this.#updateHSL();
			this.#emit(true);
		});
		this.#bValue.on('confirm', () => this.#emit());
		// HSL
		this.#hslMain.on('input', ({ value: [h, s] }) => {
			s = 1 - s;

			this.#hSlider.value = h;
			this.#hSlider.style.setProperty(SLIDER_THUMB, Color.hsl([h, 1, 0.5]).hex());
			this.#hValue.value = h;
			this.#sSlider.value = s * 100;
			this.#sSlider.style.setProperty(SLIDER_THUMB, Color.hsl([h, s, 0.5]).hex());
			this.#sSlider.style.setProperty(
				SLIDER_TRACK,
				`linear-gradient(to right, #888, hsl(${h.toFixed(2)}deg 100% 50%))`,
			);
			this.#sValue.value = s * 100;
			this.#current.hsla([
				h,
				s,
				this.#lSlider.value / 100,
				this.#alphaSlider.value / 255,
			]);
			this.#updateIndicator();
			this.#updateHEX();
			this.#updateRGB();
			this.#emit(true);
		});
		this.#hslMain.on('change', () => this.#emit());
		this.#hslMainSlider.on('input', ({ value: l }) => {
			this.#hslMainSlider.style.setProperty(
				SLIDER_THUMB,
				`#${Math.round(l * 255)
					.toString(16)
					.padStart(2, '0')
					.repeat(3)}`,
			);
			this.#lSlider.value = l * 100;
			this.#lSlider.style.setProperty(
				SLIDER_THUMB,
				`#${Math.round(l * 255)
					.toString(16)
					.padStart(2, '0')
					.repeat(3)}`,
			);
			this.#lValue.value = l * 100;

			this.#current.hsla([
				this.#hSlider.value,
				this.#sSlider.value / 100,
				l,
				this.#alphaSlider.value / 255,
			]);
			this.#updateIndicator();
			this.#updateHEX();
			this.#updateRGB();
			this.#emit(true);
		});
		this.#hslMainSlider.on('change', () => this.#emit());
		this.#hSlider.on('input', ({ value: h }) => {
			const s = this.#sValue.value / 100;

			this.#hslMain.x = h;
			this.#hSlider.style.setProperty(SLIDER_THUMB, Color.hsl([h, 1, 0.5]).hex());
			this.#hValue.value = h;
			this.#sSlider.style.setProperty(SLIDER_THUMB, Color.hsl([h, s, 0.5]).hex());
			this.#sSlider.style.setProperty(
				SLIDER_TRACK,
				`linear-gradient(to right, #888, hsl(${h.toFixed(2)}deg 100% 50%))`,
			);

			this.#current.hsla([
				h,
				this.#sSlider.value / 100,
				this.#lSlider.value / 100,
				this.#alphaSlider.value / 255,
			]);
			this.#updateIndicator();
			this.#updateHEX();
			this.#updateRGB();
			this.#emit(true);
		});
		this.#hSlider.on('change', () => this.#emit());
		this.#hValue.on('input', () => {
			const h = this.#hValue.value;
			const s = this.#sValue.value / 100;

			this.#hslMain.x = h;
			this.#hSlider.value = h;
			this.#hSlider.style.setProperty(SLIDER_THUMB, Color.hsl([h, 1, 0.5]).hex());
			this.#sSlider.style.setProperty(SLIDER_THUMB, Color.hsl([h, s, 0.5]).hex());
			this.#sSlider.style.setProperty(
				SLIDER_TRACK,
				`linear-gradient(to right, #888, hsl(${h.toFixed(2)}deg 100% 50%))`,
			);

			this.#current.hsla([
				h,
				this.#sSlider.value / 100,
				this.#lSlider.value / 100,
				this.#alphaSlider.value / 255,
			]);
			this.#updateIndicator();
			this.#updateHEX();
			this.#updateRGB();
			this.#emit(true);
		});
		this.#hValue.on('confirm', () => this.#emit());
		this.#sSlider.on('input', ({ value: s }) => {
			const h = this.#hValue.value;

			this.#hslMain.y = 1 - s / 100;
			this.#sSlider.style.setProperty(
				SLIDER_THUMB,
				Color.hsl([h, s / 100, 0.5]).hex(),
			);
			this.#sValue.value = s;

			this.#current.hsla([
				h,
				s / 100,
				this.#lSlider.value / 100,
				this.#alphaSlider.value / 255,
			]);
			this.#updateIndicator();
			this.#updateHEX();
			this.#updateRGB();
			this.#emit(true);
		});
		this.#sSlider.on('change', () => this.#emit());
		this.#sValue.on('input', () => {
			const h = this.#hValue.value;
			const s = this.#sValue.value;

			this.#hslMain.y = 1 - s / 100;
			this.#sSlider.style.setProperty(
				SLIDER_THUMB,
				Color.hsl([h, s / 100, 0.5]).hex(),
			);
			this.#sSlider.value = s;

			this.#current.hsla([
				h,
				s / 100,
				this.#lSlider.value / 100,
				this.#alphaSlider.value / 255,
			]);
			this.#updateIndicator();
			this.#updateHEX();
			this.#updateRGB();
			this.#emit(true);
		});
		this.#sValue.on('confirm', () => this.#emit());
		this.#lSlider.on('input', ({ value: l }) => {
			this.#hslMainSlider.value = l / 100;
			this.#hslMainSlider.style.setProperty(
				SLIDER_THUMB,
				`#${Math.round(l * 2.55)
					.toString(16)
					.padStart(2, '0')
					.repeat(3)}`,
			);
			this.#lSlider.style.setProperty(
				SLIDER_THUMB,
				`#${Math.round(l * 2.55)
					.toString(16)
					.padStart(2, '0')
					.repeat(3)}`,
			);
			this.#lValue.value = l;

			this.#current.hsla([
				this.#hSlider.value,
				this.#sSlider.value / 100,
				l / 100,
				this.#alphaSlider.value / 255,
			]);
			this.#updateIndicator();
			this.#updateHEX();
			this.#updateRGB();
			this.#emit(true);
		});
		this.#lSlider.on('change', () => this.#emit());
		this.#lValue.on('input', () => {
			const l = this.#lValue.value;

			this.#hslMainSlider.value = l / 100;
			this.#hslMainSlider.style.setProperty(
				SLIDER_THUMB,
				`#${Math.round(l * 2.55)
					.toString(16)
					.padStart(2, '0')
					.repeat(3)}`,
			);
			this.#lSlider.value = l;
			this.#lSlider.style.setProperty(
				SLIDER_THUMB,
				`#${Math.round(l * 2.55)
					.toString(16)
					.padStart(2, '0')
					.repeat(3)}`,
			);

			this.#current.hsla([
				this.#hSlider.value,
				this.#sSlider.value / 100,
				l / 100,
				this.#alphaSlider.value / 255,
			]);
			this.#updateIndicator();
			this.#updateHEX();
			this.#updateRGB();
			this.#emit(true);
		});
		this.#lValue.on('confirm', () => this.#emit());
	}
	#emit(temp?: boolean) {
		const eventDetails = { target: this, value: this.#current.clone() };
		if (temp) {
			this.events.emit(new EventValue('input', eventDetails));
			return;
		}
		this.#color = this.#current.clone();
		this.events.emit(new EventValue('change', eventDetails));
	}
	//#region #View
	#tab = $new<WidgetNav<'rgb' | 'hsl'>>('w-nav', {
		class: 'tab',
		prop: {
			display: 'text',
			items: [
				{ id: 'rgb', content: { text: 'RGB', icon: '' } },
				{ id: 'hsl', content: { text: 'HSL', icon: '' } },
			],
			value: 'rgb',
		},
	});
	#rgbOrHsl = new Signal.State(true);
	#indicator = $div({ class: 'indicator' });
	#updateIndicator() {
		const hex = this.#current[this.enableAlpha ? 'hexa' : 'hex']();
		this.#indicator.style.setProperty('--color', hex);
	}
	//#region Hex
	#hexValue = $new<WidgetText>('w-text', { class: 'hex-value' });
	#updateHEX() {
		this.#hexValue.value =
			this.#current[this.enableAlpha ? 'hexa' : 'hex']().toUpperCase();
	}
	//#region Alpha
	#alphaSlider = $new<WidgetSlider>('w-slider', {
		class: 'alpha-slider',
		prop: SLIDER_U8,
	});
	#alphaValue = $new<WidgetNumber>('w-number', {
		class: 'alpha-value',
		prop: VALUE_U8,
	});
	#updateAlpha() {
		const alpha = this.#current.alphaByte();
		this.#alphaSlider.value = alpha;
		this.#alphaValue.value = alpha;
	}
	//#region HSL
	// #hslPicker = $div({ class: 'picker' });
	// #hslMain = $div({ class: 'main' }, this.#hslPicker);
	#hslMain = $new<WidgetSlider2D>('w-slider-2d', {
		class: 'main',
		prop: { minX: 0, maxX: 360, minY: 0, maxY: 1 },
	});
	#hslMainSlider = $new<WidgetSlider>('w-slider', {
		class: 'main-slider',
		prop: { from: 0, to: 1 },
	});
	#hSlider = $new<WidgetSlider>('w-slider', {
		class: 'h',
		style: SLIDER_H,
		prop: SLIDER_HUE,
	});
	#hValue = $new<WidgetNumber>('w-number', { style: VALUE_H, prop: VALUE_HUE });
	#sSlider = $new<WidgetSlider>('w-slider', { class: 's', style: SLIDER_S });
	#sValue = $new<WidgetNumber>('w-number', { style: VALUE_S, prop: VALUE_SL });
	#lSlider = $new<WidgetSlider>('w-slider', { class: 'l', style: SLIDER_L });
	#lValue = $new<WidgetNumber>('w-number', { style: VALUE_L, prop: VALUE_SL });
	#updateHSL(force?: boolean) {
		const [h, s, l] = this.#current.hsl();
		this.#hslMain.x = h;
		this.#hslMain.y = 1 - s;
		this.#hslMainSlider.value = l;
		this.#hslMainSlider.style.setProperty(
			SLIDER_THUMB,
			`#${Math.round(l * 255)
				.toString(16)
				.padStart(2, '0')
				.repeat(3)}`,
		);
		if (this.#tab.value !== 'hsl' && !force) return;
		this.#hSlider.value = h;
		this.#hSlider.style.setProperty(SLIDER_THUMB, Color.hsl([h, 1, 0.5]).hex());
		this.#hValue.value = h;
		this.#sSlider.value = s * 100;
		this.#sSlider.style.setProperty(SLIDER_THUMB, Color.hsl([h, s, 0.5]).hex());
		this.#sSlider.style.setProperty(
			SLIDER_TRACK,
			`linear-gradient(to right, #888, hsl(${h.toFixed(2)}deg 100% 50%))`,
		);
		this.#sValue.value = s * 100;
		this.#lSlider.value = l * 100;
		this.#lSlider.style.setProperty(
			SLIDER_THUMB,
			`#${Math.round(l * 255)
				.toString(16)
				.padStart(2, '0')
				.repeat(3)}`,
		);
		this.#lValue.value = l * 100;
	}
	//#region RGB
	#rSlider = $new<WidgetSlider>('w-slider', {
		class: 'r',
		style: SLIDER_H,
		prop: SLIDER_U8,
	});
	#rValue = $new<WidgetNumber>('w-number', { style: VALUE_H, prop: VALUE_U8 });
	#gSlider = $new<WidgetSlider>('w-slider', {
		class: 'g',
		style: SLIDER_S,
		prop: SLIDER_U8,
	});
	#gValue = $new<WidgetNumber>('w-number', { style: VALUE_S, prop: VALUE_U8 });
	#bSlider = $new<WidgetSlider>('w-slider', {
		class: 'b',
		style: SLIDER_L,
		prop: SLIDER_U8,
	});
	#bValue = $new<WidgetNumber>('w-number', { style: VALUE_L, prop: VALUE_U8 });
	#updateRGB() {
		if (this.#tab.value !== 'rgb') return;
		const [r, g, b] = this.#current.rgb();
		this.#rSlider.value = r;
		this.#rSlider.style.setProperty(
			SLIDER_THUMB,
			`#${r.toString(16).padStart(2, '0')}0000`,
		);
		this.#rValue.value = r;
		this.#gSlider.value = g;
		this.#gSlider.style.setProperty(
			SLIDER_THUMB,
			`#00${g.toString(16).padStart(2, '0')}00`,
		);
		this.#gValue.value = g;
		this.#bSlider.value = b;
		this.#bSlider.style.setProperty(
			SLIDER_THUMB,
			`#0000${b.toString(16).padStart(2, '0')}`,
		);
		this.#bValue.value = b;
	}
	protected render() {
		const isRGB = this.#rgbOrHsl.get();
		return html`
			${this.#tab}
			<div class="tab-content hsl" style=${styleMap({
				display: isRGB ? 'none' : null,
			})}>
				<w-lang style="grid-area: h-label;">ui.hue</w-lang>
				${this.#hSlider}${this.#hValue}
				<w-lang style="grid-area: s-label;">ui.saturation</w-lang>
				${this.#sSlider}${this.#sValue}
				<w-lang style="grid-area: l-label;">ui.lightness</w-lang>
				${this.#lSlider}${this.#lValue}
			</div>
			<div class="tab-content rgb" style=${styleMap({
				display: isRGB ? null : 'none',
			})}>
				<w-lang style="grid-area: h-label;">ui.red</w-lang>
				${this.#rSlider}${this.#rValue}
				<w-lang style="grid-area: s-label;">ui.green</w-lang>
				${this.#gSlider}${this.#gValue}
				<w-lang style="grid-area: l-label;">ui.blue</w-lang>
				${this.#bSlider}${this.#bValue}
			</div>
			${this.#indicator}
			<div class="hex-label">HEX</div>
			${this.#hexValue}
			<w-lang class="alpha-label">ui.alpha</w-lang>
			${this.#alphaSlider}${this.#alphaValue}
			${this.#hslMain}${this.#hslMainSlider}
		`;
	}
	//#region #Properties
	/** 禁用 */
	@property({ type: Boolean, reflect: true })
	get disabled() {
		return this.hasAttribute('disabled');
	}
	set disabled(value: boolean) {
		this.toggleAttribute('disabled', value);
		for (const element of this.navChildren) {
			element.disabled = value;
		}
	}
	/** 启用透明度 */
	@property({ type: Boolean, reflect: true, attribute: 'alpha' })
	get enableAlpha() {
		return this.hasAttribute('alpha');
	}
	set enableAlpha(value: boolean) {
		this.toggleAttribute('alpha', value);
		this.#updateHEX();
	}
	/** 颜色 */
	@property({ type: String })
	get value(): Color {
		return this.#color.clone();
	}
	set value(value: string | Color) {
		if (typeof value === 'string') this.#color = Color.hexa(value);
		else this.#color = value.clone();
		this.#current = this.#color.clone();

		this.#updateHEX();
		this.#updateIndicator();
		this.#updateRGB();
		this.#updateHSL();
		this.#updateAlpha();
	}
	get navChildren() {
		return [
			this.#hslMain,
			this.#hslMainSlider,
			this.#tab,
			this.#hexValue,
			this.#hSlider,
			this.#sSlider,
			this.#lSlider,
			this.#hValue,
			this.#sValue,
			this.#lValue,
			this.#rSlider,
			this.#gSlider,
			this.#bSlider,
			this.#rValue,
			this.#gValue,
			this.#bValue,
			this.#alphaSlider,
			this.#alphaValue,
		];
	}
	cloneNode(deep?: boolean): WidgetColorPicker {
		const node = super.cloneNode(deep) as WidgetColorPicker;

		node.enableAlpha = this.enableAlpha;
		node.value = this.value;
		node.disabled = this.disabled;

		return node;
	}
}
