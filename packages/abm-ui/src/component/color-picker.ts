import { Color, IDGenerator, typeCheck } from 'abm-utils';
import { defineElement, property } from '../infra/decorator';
import type { ElementProps } from '../infra/dom';
import { $apply, $div, $new } from '../infra/dom';
import { register } from '../infra/registry';
import { $style, css } from '../infra/style';
import type { Navigable } from '../navigate/index';
import { createNumberInputPrefab } from '../prefab/number';
import { createTabsPrefab } from '../prefab/tabs';
import type { AriaConfig } from './base';
import { FormControl, Label } from './form';
import { t } from './i18n';
import { type NumberBox, TextBox } from './input';
import { SingletonPage } from './page';
import { Slider } from './slider';
import { Vec2Pad } from './vec2-pad';

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-color-picker': ColorPicker;
	}
}

declare module '../infra/registry' {
	interface Registry {
		'color-picker': ColorPicker;
	}
}

export interface ColorPickerProp extends ElementProps<ColorPicker> {}

const idGenerator = new IDGenerator();
function channel(
	{ slider, numberBox }: { slider: Slider<number>; numberBox: NumberBox },
	label: HTMLElement,
	name: string,
): HTMLElement {
	const id = `abm-color-picker-${idGenerator.next()}`;
	slider.classList.add(name);
	numberBox.classList.add('channel-input');
	numberBox.id = `${id}`;
	return $div(
		{ className: `channel channel-${name}` },
		$new(Label, { for: id }, label),
		slider,
		numberBox,
	);
}

abstract class ColorPickerPage extends SingletonPage {
	value: () => Color;
	updateOther: () => void;
	emitUpdate: (end?: boolean) => void;
	constructor(
		value: () => Color,
		updateOther: () => void,
		emitUpdate: (end?: boolean) => void,
	) {
		super();
		this.value = value;
		this.updateOther = updateOther;
		this.emitUpdate = emitUpdate;
	}
	enter(): void {
		this.update();
	}
	abstract update(): void;
	abstract index: number;
}

//#region RGB
class RGBPage extends ColorPickerPage {
	index = 0;
	#r = createNumberInputPrefab({
		end: 255,
		step: 1,
		$input: () => this.#handle(),
		$change: () => this.#handle(true),
	});
	#g = createNumberInputPrefab({
		end: 255,
		step: 1,
		$input: () => this.#handle(),
		$change: () => this.#handle(true),
	});
	#b = createNumberInputPrefab({
		end: 255,
		step: 1,
		$input: () => this.#handle(),
		$change: () => this.#handle(true),
	});
	init(): void {
		$apply(
			this.root,
			{ className: 'channels' },
			channel(this.#r, t('ui.red'), 'red'),
			channel(this.#g, t('ui.green'), 'green'),
			channel(this.#b, t('ui.blue'), 'blue'),
		);
	}
	#handle(end?: boolean) {
		const r = this.#r.value;
		const g = this.#g.value;
		const b = this.#b.value;
		this.value().rgb([r, g, b]);
		this.updateOther();
		this.emitUpdate(end);
	}
	#updateStyle(r: number, g: number, b: number) {
		$style(this.#r.slider, { $c: `#${r.toString(16).padStart(2, '0')}0000` });
		$style(this.#g.slider, { $c: `#00${g.toString(16).padStart(2, '0')}00` });
		$style(this.#b.slider, { $c: `#0000${b.toString(16).padStart(2, '0')}` });
	}
	update(): void {
		const [r, g, b] = this.value().rgb();
		this.#r.value = r;
		this.#g.value = g;
		this.#b.value = b;
		this.#updateStyle(r, g, b);
	}
}

//#region HSL
class HSLPage extends ColorPickerPage {
	index = 1;
	#h = createNumberInputPrefab({
		end: 360,
		$input: () => this.#handle(),
		$change: () => this.#handle(true),
	});
	#s = createNumberInputPrefab({
		$input: () => this.#handle(),
		$change: () => this.#handle(true),
	});
	#l = createNumberInputPrefab({
		$input: () => this.#handle(),
		$change: () => this.#handle(true),
	});
	init(): void {
		$apply(
			this.root,
			{ className: 'channels' },
			channel(this.#h, t('ui.hue'), 'hue'),
			channel(this.#s, t('ui.saturation'), 'saturation'),
			channel(this.#l, t('ui.lightness'), 'lightness'),
		);
	}
	#handle(end?: boolean) {
		const h = this.#h.value;
		const s = this.#s.value;
		const l = this.#l.value;
		this.value().hsl([h, s, l]);
		this.#updateStyle(h, s, l);
		this.updateOther();
		this.emitUpdate(end);
	}
	#updateStyle(h: number, s: number, l: number) {
		$style(this.#h.slider, { $c: `hsl(${h} 100% 50%)` });
		$style(this.#s.slider, {
			$c: `hsl(${h} ${s * 100}% 50%)`,
			$t: `hsl(${h} 100% 50%)`,
		});
		$style(this.#l.slider, {
			$c: `hsl(0 0 ${l * 100}%)`,
			$b: `hsl(0 0 ${(1 - l) * 100}%)`,
		});
	}
	update(): void {
		const [h, s, l] = this.value().hsl();
		this.#h.value = h;
		this.#s.value = s;
		this.#l.value = l;
		this.#updateStyle(h, s, l);
	}
}

//#region Oklch
class OklchPage extends ColorPickerPage {
	index = 2;
	#l = createNumberInputPrefab({
		$input: () => this.#handle(),
		$change: () => this.#handle(true),
	});
	#c = createNumberInputPrefab({
		end: 0.4,
		$input: () => this.#handle(),
		$change: () => this.#handle(true),
	});
	#h = createNumberInputPrefab({
		end: 360,
		$input: () => this.#handle(),
		$change: () => this.#handle(true),
	});
	init(): void {
		$apply(
			this.root,
			{ className: 'channels' },
			channel(this.#l, t('ui.lightness'), 'lightness'),
			channel(this.#c, t('ui.chroma'), 'chroma'),
			channel(this.#h, t('ui.hue'), 'hue'),
		);
	}
	#handle(end?: boolean) {
		const l = this.#l.value;
		const c = this.#c.value;
		const h = this.#h.value;
		this.value().oklch([l, c, h]);
		this.#updateStyle(l, c, h);
		this.updateOther();
		this.emitUpdate(end);
	}
	#updateStyle(l: number, c: number, h: number) {
		$style(this.#l.slider, {
			$c: `hsl(0 0 ${l * 100}%)`,
			$b: `hsl(0 0 ${(1 - l) * 100}%)`,
		});
		$style(this.#c.slider, {
			$c: `hsl(${h} ${(c / 0.4) * 100}% 50%)`,
			$t: `hsl(${h} 100% 50%)`,
		});
	}
	update(): void {
		const [l, c, h] = this.value().oklch();
		this.#l.value = l;
		this.#c.value = c;
		this.#h.value = h;
		this.#updateStyle(l, c, h);
	}
}

//#region Main
/**
 * 颜色选择器
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form/color-picker)
 */
@register('color-picker')
@defineElement('abm-color-picker')
export class ColorPicker
	extends FormControl<Color, ColorPickerProp>
	implements Navigable
{
	protected static style = css`
		:host, .channels {
			display: flex;
			flex-direction: column;
			gap: 8px;
			width: 100%;
		}
		.plane {
			display: grid;
			grid-template-columns: 1fr 64px;
			grid-template-rows: 1fr max-content;
			gap: 8px;
			grid-auto-flow: row;
			grid-template-areas:
				"pad indicator"
				"slider indicator";
		}
		.pad {
			grid-area: pad;
			border: none;
			background: linear-gradient(#0000,#888),linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00);
		}
		.indicator {
			position: relative;
			grid-area: indicator;
			border-radius: var(--border-radius);
			overflow: clip;
			background: linear-gradient(45deg, #888 25%, #0000 0px, #0000 75%, #888 0px) 0px 0px / 20px 20px, linear-gradient(45deg, #888 25%, #0000 0px, #0000 75%, #888 0px) 10px 10px / 20px 20px, #ddd;
		}
		.indicator::before {
			content: '';
			position: absolute;
			inset: 0;
			background: var(--c, #000);
		}
		abm-slider::part(fill) { background: none }
		abm-slider::part(thumb) {
			background: var(--c);
			outline-color: var(--b);
		}
		.light-slider { grid-area: slider; }
		.light-slider::part(track) { background: linear-gradient(to right,#000,#fff) }
		.bar {
			display: flex;
			align-items: center;
			gap: 8px;
		}
		.type { flex: 1 }
		.input { width: 96px }
		.channel {
			display: flex;
			align-items: center;
			gap: 8px;
			white-space: nowrap;
		}
		.channel-input { width: 128px; flex: 0 0 auto }
		.red::part(track) { background: linear-gradient(to right,#000,#f00) }
		.green::part(track) { background: linear-gradient(to right,#000,#0f0) }
		.blue::part(track) { background: linear-gradient(to right,#000,#00f) }
		.hue::part(track) { background: linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00) }
		.saturation::part(track), .chroma::part(track) { background: linear-gradient(to right, #888, var(--t, #f00)) }
		.lightness::part(track) { background: linear-gradient(to right, #000, #fff) }
		.alpha::part(track) { background: linear-gradient(to right,#0000,var(--fg)),0 0/6px 6px linear-gradient(45deg,#000 25%,#0000 0,#0000 75%,#000 0),3px 3px/6px 6px linear-gradient(45deg,#000 25%,#0000 0,#0000 75%,#000 0),#fff }
		.channel-alpha { display: none }
		:host([enableAlpha]) .channel-alpha { display: flex }
	`;
	protected static aria: AriaConfig = {
		role: 'group',
		label: 'Color Picker',
	};
	#value = new Color();
	#indicator = $div({ className: 'indicator' });
	#input: TextBox = $new(TextBox, {
		className: 'input',
		value: '#000000',
		$input: () => this.#handleInput(),
		$change: () => this.#handleInput(true),
		$submit: () => this.#handleInput(true),
		props: { navParent: this },
	});
	#tabs = createTabsPrefab(
		{
			rgb: { tab: 'RGB', content: RGBPage },
			hsl: { tab: 'HSL', content: HSLPage },
			oklch: { tab: 'Oklch', content: OklchPage },
		},
		{
			nav: { className: 'type', props: { navParent: this } },
			pageHost: { style: { height: 112 }, props: { navParent: this } },
			transition: 'slide',
			args: [
				() => this.#value,
				() => this.#updateView('channel'),
				(end?: boolean) => this.emitUpdate(end),
			],
		},
	);
	#bar = $div({ className: 'bar' }, this.#tabs.nav, 'HEX', this.#input);
	constructor(_props?: ColorPickerProp) {
		super();
		this.attachShadow(
			{},
			this.#plane,
			this.#bar,
			this.#tabs.pageHost,
			channel(this.#alpha, t('ui.alpha'), 'alpha'),
		);
	}
	#updateIndicator() {
		$style(this.#indicator, { $c: this.#value.hexa() });
	}
	#updateChannel() {
		const current = this.#tabs.current as ColorPickerPage;
		if (!current) return;
		current.update();
	}
	#updateView(source?: 'plane' | 'channel' | 'input' | 'alpha') {
		this.#updateIndicator();
		if (source !== 'plane' && source !== 'alpha') this.#updatePlane();
		if (source !== 'channel' && source !== 'alpha') this.#updateChannel();
		if (source !== 'input') this.#updateInput();
		if (source !== 'alpha') this.#updateAlpha();
	}
	//#region Plane
	#updatePlane() {
		const [h, s, l] = this.#value.hsl();
		this.#pad.value = [h, s];
		this.#lightSlider.value = l;
		this.#updateLightSlider();
	}
	#updateLightSlider() {
		const value = this.#lightSlider.value as number;
		$style(this.#lightSlider, {
			$c: `hsl(0 0 ${value * 100}%)`,
			$b: `hsl(0 0 ${(1 - value) * 100}%)`,
		});
	}
	#handlePlaneInput(end?: boolean) {
		this.#value.hsl([...this.#pad.value, this.#lightSlider.value as number]);
		this.#updateLightSlider();
		this.#updateView('plane');
		this.emitUpdate(end);
	}
	#pad: Vec2Pad = $new(Vec2Pad, {
		className: 'pad',
		start: [0, 1],
		end: [360, 0],
		value: [0, 0],
		$input: () => this.#handlePlaneInput(),
		$change: () => this.#handlePlaneInput(true),
		props: { navParent: this },
	});
	#lightSlider: Slider<number> = $new(Slider<number>, {
		className: 'light-slider',
		$input: () => this.#handlePlaneInput(),
		$change: () => this.#handlePlaneInput(true),
		props: { navParent: this },
	});
	#plane = $div(
		{ className: 'plane' },
		this.#pad,
		this.#lightSlider,
		this.#indicator,
	);
	//#region Input
	#updateInput() {
		this.#input.value = this.#enableAlpha
			? this.#value.hexa()
			: this.#value.hex();
	}
	#handleInput(end?: boolean) {
		try {
			if (this.#enableAlpha) this.#value.hexa(this.#input.value);
			else this.#value.hex(this.#input.value);
			this.#updateView('input');
			this.emitUpdate(end);
		} catch {
			if (end) this.emitUpdate(end);
		}
		if (!end) return;
		this.#input.value = this.#value.hex();
	}
	//#region Alpha
	#updateAlpha() {
		this.#alpha.value = this.#value.alphaByte();
	}
	#handleAlpha(end?: boolean) {
		if (!this.#enableAlpha) return;
		this.#value.alphaByte(this.#alpha.value);
		this.#updateView('alpha');
		this.emitUpdate(end);
	}
	#alpha = createNumberInputPrefab({
		slider: { props: { navParent: this } },
		numberBox: { props: { navParent: this } },
		value: 255,
		end: 255,
		step: 1,
		$input: () => this.#handleAlpha(),
		$change: () => this.#handleAlpha(true),
	});
	//#region API
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
	@property({ reflect: true, toValue: Boolean })
	get enableAlpha() {
		return this.#enableAlpha;
	}
	set enableAlpha(value) {
		value = !!value;
		if (this.#enableAlpha === value) return;
		this.#enableAlpha = value;
		if (!value) this.#value.alpha(1);
		this.#updateView('alpha');
	}
	get navChildren() {
		return [
			this.#pad,
			this.#lightSlider,
			this.#tabs.nav,
			this.#input,
			this.#tabs.pageHost,
			this.#alpha.slider,
			this.#alpha.numberBox,
		];
	}
	protected clone(from: this): void {
		this.enableAlpha = from.enableAlpha;
		super.clone(from);
	}
}
