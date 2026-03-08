import { clamp, wrapInRange } from './math';

/**
 * RGB 元组
 * @description
 * RGB 值范围为 0~255 整数
 */
export type RGB = [red: number, green: number, blue: number];
/**
 * RGBA 元组
 * @description
 * RGBA 值范围为 0~255 整数
 */
export type RGBA = [red: number, green: number, blue: number, alpha: number];
/**
 * HSL 元组
 * @description
 * - H：0~360
 * - S：0~1
 * - L：0~1
 */
export type HSL = [hue: number, saturation: number, lightness: number];
/**
 * HSLA 元组
 * @description
 * - H：0~360
 * - S：0~1
 * - L：0~1
 * - A：0~1
 */
export type HSLA = [
	hue: number,
	saturation: number,
	lightness: number,
	alpha: number,
];
/**
 * Oklch 元组
 * @description
 * - L：0~1
 * - C：0~
 * - H：0~360
 */
export type Oklch = [lightness: number, chroma: number, hue: number];
/**
 * OklchAlpha 元组
 * @description
 * - L：0~1
 * - C：0~
 * - H：0~360
 * - A：0~1
 */
export type OklchAlpha = [
	lightness: number,
	chroma: number,
	hue: number,
	alpha: number,
];

const ERR = {
	TUPLE: (n: number, input: any) =>
		`A tuple of ${n} numbers is required, but received ${input}`,
} as const;

const PATTERN_HEX = /^#?([0-9a-fA-F]+)$/;

/** 从线性 RGB 到 LMS 的矩阵（sRGB -> LMS） */
const M_RGB_TO_LMS = [
	[0.4122214708, 0.5363325363, 0.0514459929],
	[0.2119034982, 0.6806995451, 0.1073969566],
	[0.0883024619, 0.2817188376, 0.6299787005],
];
/** 从非线性 LMS 到 Oklab 的矩阵 */
const M2 = [
	[0.2104542553, 0.793617785, -0.0040720468],
	[1.9779984951, -2.428592205, 0.4505937099],
	[0.0259040371, 0.7827717662, -0.808675766],
];
/** M_RGB_TO_LMS 的逆矩阵（LMS -> 线性 RGB） */
const M_LMS_TO_RGB = [
	[4.0767416621, -3.3077115913, 0.2309699292],
	[-1.2684380046, 2.6097574011, -0.3413193965],
	[-0.0041960863, -0.7034186147, 1.707614701],
];
/** M2 的逆矩阵（Oklab -> 非线性 LMS） */
const M2_INV = [
	[1.0, 0.3963377922, 0.215803758],
	[1.0, -0.1055613423, -0.0638541748],
	[1.0, -0.0894841821, -1.2914855379],
];

function quantify(value: number): number {
	return clamp(0, Math.round(value), 255);
}

function num2hex(value: number[]): string {
	return value.map((v) => v.toString(16).padStart(2, '0')).join('');
}

function parseTuple(n: number, input: unknown): number[] {
	if (!Array.isArray(input)) throw new Error(ERR.TUPLE(n, input));
	if (input.length < n) throw new Error(ERR.TUPLE(n, input));
	const arr = input.slice(0, n);
	if (!arr.every((v) => typeof v === 'number'))
		throw new Error(ERR.TUPLE(n, input));
	return arr;
}

/** 矩阵乘法辅助函数 */
function multiplyMatrix3x3Vector3(
	matrix: number[][],
	vector: [number, number, number],
): [number, number, number] {
	return [
		matrix[0][0] * vector[0] +
			matrix[0][1] * vector[1] +
			matrix[0][2] * vector[2],
		matrix[1][0] * vector[0] +
			matrix[1][1] * vector[1] +
			matrix[1][2] * vector[2],
		matrix[2][0] * vector[0] +
			matrix[2][1] * vector[1] +
			matrix[2][2] * vector[2],
	];
}

/** sRGB 转 LinearRGB */
function srgb2linear(srgb: number): number {
	const s = srgb / 255;
	let linear: number;
	if (s <= 0.04045) {
		linear = s / 12.92;
	} else {
		linear = ((s + 0.055) / 1.055) ** 2.4;
	}
	return linear;
}

/** LinearRGB 转 sRGB */
function linearToSrgb(linear: number): number {
	let srgb: number;
	if (linear <= 0.0031308) {
		srgb = linear * 12.92;
	} else {
		srgb = 1.055 * linear ** (1.0 / 2.4) - 0.055;
	}
	return quantify(srgb * 255);
}

/** RGB 转 HSL */
export function rgb2hsl(rgb: RGB | RGBA): HSL {
	const [r, g, b] = rgb.slice(0, 3).map((v) => v / 255) as RGB;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h = 0;
	const l = (max + min) / 2;
	if (max === min) return [0, 0, l];
	const d = max - min;
	const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	if (max === r) {
		h = (g - b) / d + (g < b ? 6 : 0);
	} else if (max === g) {
		h = (b - r) / d + 2;
	} else if (max === b) {
		h = (r - g) / d + 4;
	}
	h *= 60;
	return [h, s, l];
}

/** HSL 转 RGB */
export function hsl2rgb(hsl: HSL | HSLA): RGB {
	let [hue, saturation, lightness] = hsl;
	hue = wrapInRange(hue, 360);
	saturation = clamp(0, saturation, 1);
	lightness = clamp(0, lightness, 1);

	if (saturation === 0) {
		const value = Math.round(lightness * 255);
		return [value, value, value];
	}

	const c = (1 - Math.abs(2 * lightness - 1)) * saturation; // Chroma
	const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
	const m = lightness - c / 2;

	let r: number;
	let g: number;
	let b: number;

	if (hue >= 0 && hue < 60) {
		r = c;
		g = x;
		b = 0;
	} else if (hue >= 60 && hue < 120) {
		r = x;
		g = c;
		b = 0;
	} else if (hue >= 120 && hue < 180) {
		r = 0;
		g = c;
		b = x;
	} else if (hue >= 180 && hue < 240) {
		r = 0;
		g = x;
		b = c;
	} else if (hue >= 240 && hue < 300) {
		r = x;
		g = 0;
		b = c;
	} else {
		r = c;
		g = 0;
		b = x;
	}

	const red = Math.round((r + m) * 255);
	const green = Math.round((g + m) * 255);
	const blue = Math.round((b + m) * 255);

	return [red, green, blue];
}

/** RGB 转 Oklch */
export function rgb2oklch([r, g, b]: RGB | RGBA): Oklch {
	// 1. sRGB -> LinearRGB
	const rLinear = srgb2linear(r);
	const gLinear = srgb2linear(g);
	const bLinear = srgb2linear(b);

	// 2. LinearRGB -> LMS
	const lms = multiplyMatrix3x3Vector3(M_RGB_TO_LMS, [
		rLinear,
		gLinear,
		bLinear,
	]);

	// 3. LMS -> 非线性LMS (立方根)
	const lmsNonLinear: [number, number, number] = [
		Math.cbrt(lms[0]),
		Math.cbrt(lms[1]),
		Math.cbrt(lms[2]),
	];

	// 4. 非线性LMS -> Oklab
	const lab = multiplyMatrix3x3Vector3(M2, lmsNonLinear);

	// 5. Oklab -> Oklch
	const L = lab[0];
	const a = lab[1];
	const bVal = lab[2];

	const C = Math.sqrt(a * a + bVal * bVal);
	let H = Math.atan2(bVal, a) * (180 / Math.PI);

	// 确保色相在0-360范围内
	H = wrapInRange(H, 360);

	return [L, C, H];
}

/** Oklch 转 RGB */
export function oklch2rgb([l, c, h]: Oklch | OklchAlpha): RGB {
	// 1. Oklch -> Oklab
	const hRad = h * (Math.PI / 180);
	const a = c * Math.cos(hRad);
	const bVal = c * Math.sin(hRad);

	// 2. Oklab -> 非线性LMS
	const lmsNonLinear = multiplyMatrix3x3Vector3(M2_INV, [l, a, bVal]);

	// 3. 非线性LMS -> LMS (立方)
	const lms: [number, number, number] = [
		lmsNonLinear[0] ** 3,
		lmsNonLinear[1] ** 3,
		lmsNonLinear[2] ** 3,
	];

	// 4. LMS -> LinearRGB
	const rgbLinear = multiplyMatrix3x3Vector3(M_LMS_TO_RGB, lms);

	// 5. LinearRGB -> sRGB
	const r = linearToSrgb(rgbLinear[0]);
	const g = linearToSrgb(rgbLinear[1]);
	const b = linearToSrgb(rgbLinear[2]);

	return [r, g, b];
}

export class Color {
	#alpha = 255;
	#rgb?: RGB = [0, 0, 0];
	#hsl?: HSL;
	#oklch?: Oklch;
	#getRGB(): RGB {
		if (this.#rgb) return this.#rgb;
		if (this.#oklch) {
			const [r, g, b] = oklch2rgb(this.#oklch);
			this.#rgb = [r, g, b];
			return this.#rgb;
		}
		if (!this.#hsl) throw new Error('Unknown color');
		const [r, g, b] = hsl2rgb(this.#hsl);
		this.#rgb = [r, g, b];
		return this.#rgb;
	}
	#setRGB(rgb: RGB) {
		this.#rgb = rgb;
		this.#hsl = undefined;
		this.#oklch = undefined;
	}
	#getHSL(): HSL {
		if (this.#hsl) return this.#hsl;
		const [h, s, l] = rgb2hsl(this.#getRGB());
		this.#hsl = [h, s, l];
		return this.#hsl;
	}
	#setHSL(hsl: HSL) {
		this.#hsl = hsl;
		this.#rgb = undefined;
		this.#oklch = undefined;
	}
	#getOklch(): Oklch {
		if (this.#oklch) return this.#oklch;
		const rgba = this.#getRGB();
		const [l, c, h] = rgb2oklch(rgba);
		this.#oklch = [l, c, h];
		return this.#oklch;
	}
	#setOklch(oklch: Oklch) {
		this.#oklch = oklch;
		this.#rgb = undefined;
		this.#hsl = undefined;
	}
	/** 获取 RGB 值 */
	rgb(): RGB;
	/** 设置 RGB 值 */
	rgb(value: RGB): this;
	rgb(value?: RGB): this | RGB {
		if (!value) return this.#getRGB().slice(0, 3) as RGB;
		this.#setRGB(parseTuple(3, value).map(quantify) as RGB);
		// this.#alpha = 255;
		return this;
	}
	/** 获取 RGBA 值 */
	rgba(): RGBA;
	/** 设置 RGBA 值 */
	rgba(value: RGBA): this;
	rgba(value?: RGBA): this | RGBA {
		if (!value) return [...this.#getRGB(), this.#alpha];
		const rgba = parseTuple(4, value).map(quantify) as RGBA;
		this.#setRGB(rgba.slice(0, 3) as RGB);
		this.#alpha = rgba[3];
		return this;
	}
	/** 获取 HEX 值 */
	hex(): string;
	/** 设置 HEX 值 */
	hex(value: string): this;
	hex(value?: string): this | string {
		if (!value) return `#${num2hex(this.#getRGB().slice(0, 3))}`;
		const rgba = Color.parseHEX(value);
		if (!rgba) throw new Error('Invalid hex value');
		this.#setRGB(rgba.slice(0, 3) as RGB);
		// this.#alpha = 255;
		return this;
	}
	/** 获取 HEXA 值 */
	hexa(): string;
	/** 设置 HEXA 值 */
	hexa(value: string): this;
	hexa(value?: string): this | string {
		if (!value) return `#${num2hex(this.rgba())}`;
		const rgba = Color.parseHEX(value);
		if (!rgba) throw new Error('Invalid hex value');
		this.#setRGB(rgba.slice(0, 3) as RGB);
		this.#alpha = rgba[3];
		return this;
	}
	/** 获取 HSL 值 */
	hsl(): HSL;
	/** 设置 HSL 值 */
	hsl(value: HSL): this;
	hsl(value?: HSL): this | HSL {
		if (!value) return this.#getHSL().slice(0, 3) as HSL;
		const [h, s, l] = parseTuple(3, value) as HSL;
		this.#setHSL([wrapInRange(h, 360), clamp(0, s, 1), clamp(0, l, 1)]);
		// this.#alpha = 1;
		return this;
	}
	/** 获取 HSLA 值 */
	hsla(): HSLA;
	/** 设置 HSLA 值 */
	hsla(value: HSLA): this;
	hsla(value?: HSLA): this | HSLA {
		if (!value) return [...this.#getHSL(), this.#alpha / 255];
		const [h, s, l, a] = parseTuple(4, value) as HSLA;
		this.#setHSL([wrapInRange(h, 360), clamp(0, s, 1), clamp(0, l, 1)]);
		this.#alpha = quantify(a * 255);
		return this;
	}
	/** 获取 Oklch 值 */
	oklch(): Oklch;
	/** 设置 Oklch 值 */
	oklch(value: Oklch): this;
	oklch(value?: Oklch): this | Oklch {
		if (!value) return this.#getOklch().slice(0, 3) as Oklch;
		const [l, c, h] = parseTuple(3, value);
		this.#setOklch([clamp(0, l, 1), Math.max(0, c), wrapInRange(h, 360)]);
		// this.#alpha = 1;
		return this;
	}
	/** 获取 OklchAlpha 值 */
	oklchAlpha(): OklchAlpha;
	/** 设置 OklchAlpha 值 */
	oklchAlpha(value: OklchAlpha): this;
	oklchAlpha(value?: OklchAlpha): this | OklchAlpha {
		if (!value) return [...this.#getOklch(), this.#alpha / 255];
		const [l, c, h, a] = parseTuple(4, value);
		this.#setOklch([clamp(0, l, 1), Math.max(0, c), wrapInRange(h, 360)]);
		this.#alpha = quantify(a * 255);
		return this;
	}
	/**
	 * 获取 Alpha 值
	 * @description
	 * 范围：0~1
	 */
	alpha(): number;
	/**
	 * 设置 Alpha 值
	 * @description
	 * 范围：0~1
	 */
	alpha(value: number): this;
	alpha(value?: number): this | number {
		if (value === undefined) return this.#alpha / 255;
		this.#alpha = quantify(value * 255);
		return this;
	}
	/**
	 * 获取 Alpha 值
	 * @description
	 * 范围：0~255 整数
	 */
	alphaByte(): number;
	/**
	 * 设置 Alpha 值
	 * @description
	 * 范围：0~255 整数
	 */
	alphaByte(value: number): this;
	alphaByte(value?: number): this | number {
		if (value === undefined) return this.#alpha;
		this.#alpha = quantify(value);
		return this;
	}
	/** 检查颜色是否为暗色 */
	isDark(): boolean {
		return this.#getOklch()[0] < 0.5;
	}
	/** 克隆颜色 */
	clone(): Color {
		const color = new Color();
		if (this.#rgb) color.#rgb = [...this.#rgb];
		if (this.#hsl) color.#hsl = [...this.#hsl];
		if (this.#oklch) color.#oklch = [...this.#oklch];
		color.#alpha = this.#alpha;
		return color;
	}
	/** 创建反色 */
	invert(): Color {
		const [r, g, b] = this.#getRGB();
		const color = new Color();
		color.#rgb = [255 - r, 255 - g, 255 - b];
		color.#alpha = this.#alpha;
		return color;
	}
	toString() {
		if (this.alpha() === 1) return this.hex();
		return this.hexa();
	}
	static hex(value: string): Color {
		return new Color().hex(value);
	}
	static hexa(value: string): Color {
		return new Color().hexa(value);
	}
	static rgb(value: RGB): Color {
		return new Color().rgb(value);
	}
	static rgba(value: RGBA): Color {
		return new Color().rgba(value);
	}
	static hsl(value: HSL): Color {
		return new Color().hsl(value);
	}
	static hsla(value: HSLA): Color {
		return new Color().hsla(value);
	}
	static oklch(value: Oklch): Color {
		return new Color().oklch(value);
	}
	static oklchAlpha(value: OklchAlpha): Color {
		return new Color().oklchAlpha(value);
	}
	/**
	 * 将可能为 hex 格式的字符串转换为 RGBA
	 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/utils/color#parsehex)
	 */
	static parseHEX(hex: string): RGBA | null {
		const matched = hex.match(PATTERN_HEX);
		if (!matched) return null;
		const value = matched[1];
		// 简写
		if (value.length <= 4) {
			const r = parseInt(value[0].repeat(2), 16);
			const g = value[1] ? parseInt(value[1].repeat(2), 16) : r;
			const b = value[2] ? parseInt(value[2].repeat(2), 16) : r;
			const a = value[3] ? parseInt(value[3].repeat(2), 16) : 255;
			return [r, g, b, a];
		}
		// 全写
		const r = parseInt(value.slice(0, 2), 16);
		const g = parseInt(value.slice(2, 4), 16);
		const b = parseInt(value.repeat(2).slice(4, 6), 16);
		const a =
			value.length > 6 ? parseInt(value.slice(6).repeat(2).slice(0, 2), 16) : 255;
		return [r, g, b, a];
	}
}
