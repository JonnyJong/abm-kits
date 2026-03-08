import { Color, clamp, type Oklch, type OklchAlpha } from 'abm-utils';
import { $style } from './style';

/** 主题配色 */
export type ThemeColor =
	| string
	| Color
	| [string | Color, string | Color]
	| { hue: number; chroma?: number };

/** 颜色主题模式 */
type ColorSchema = 'light' | 'dark';
/** 颜色层级 */
type ColorTier = 'Primary' | 'Secondary';
/** 颜色应用区域 */
type ColorArea = 'Bg' | 'Fg' | 'Border';
/** 交互状态 */
type InteractionState = '' | 'Hover' | 'Active' | 'Focus';
/** 独立令牌 */
type StandaloneToken = 'Primary' | 'Selection';
/** 原始颜色令牌名称 */
type RawColorTokenKey =
	| `${ColorTier}${ColorArea}${InteractionState}`
	| StandaloneToken;
/** 原始颜色令牌 */
export type RawColorTokens = Record<RawColorTokenKey, Oklch | OklchAlpha>;
/** 通用颜色令牌 */
export type ColorTokens = Record<string, string>;

/** WCAG 对比度标准等级 */
interface ContrastRatios {
	/** 等级 A (对比度3:1) */
	A: number;
	/** 等级 AA (对比度4.5:1) */
	AA: number;
	/** 等级 AAA (对比度7:1) */
	AAA: number;
}
/** 亮度约束范围 */
interface BrightnessConstraints {
	/** 等级 A 约束值 */
	a: number;
	/** 等级 AA 约束值 */
	aa: number;
	/** 等级 AAA 约束值 */
	aaa: number;
}

/** 检测浏览器是否支持 OKLCH 颜色格式 */
const supportOklch = CSS.supports('color', 'oklch(0 0 0)');

/** 各主题模式的对比度约束值 */
const THRESHOLDS: Record<Uppercase<ColorSchema>, ContrastRatios> = {
	LIGHT: { A: 0.64, AA: 0.53, AAA: 0.44 },
	DARK: { A: 0.5, AA: 0.6, AAA: 0.7 },
};

//#region Helper

/** 将 OKLCH 元组转换为 CSS 值 */
const toCSSValue: (color: Oklch | OklchAlpha) => string = supportOklch
	? ([l, c, h, a]) => {
			l = clamp(0, l, 1);
			if (a === undefined) return `oklch(${l} ${c} ${h})`;
			return `oklch(${l} ${c} ${h} / ${a})`;
		}
	: (color) => {
			if (color.length === 3) return Color.oklch(color).hex();
			return Color.oklchAlpha(color).hexa();
		};

/**
 * 根据对比度等级计算亮度约束值
 * @param ratios 对比度比率配置
 * @param lightness 基准亮度值
 * @param constraintFn 约束函数 (Math.min 或 Math.max)
 * @returns 各对比度等级下的亮度约束值
 */
function calcBrightnessConstraints(
	ratios: ContrastRatios,
	lightness: number,
	constraintFn: (a: number, b: number) => number,
): BrightnessConstraints {
	return {
		a: constraintFn(lightness, ratios.A),
		aa: constraintFn(lightness, ratios.AA),
		aaa: constraintFn(lightness, ratios.AAA),
	};
}

/** 亮度确定文本颜色亮度 */
function getTextLightness(lightness: number): number {
	return lightness < 0.5 ? 1 : 0;
}

function toColor(input: unknown): Color | null {
	if (input instanceof Color) return input;
	if (typeof input !== 'string') return null;
	try {
		return Color.hex(input);
	} catch {
		return null;
	}
}

function toAccessibleColor(hue: number, chroma = 0.15): [Color, Color] {
	return [Color.oklch([0.4, chroma, hue]), Color.oklch([0.65, chroma, hue])];
}

//#region Main
/** 生成原始亮色令牌 */
export function getRawLightColorTokens(color: Color): RawColorTokens {
	const [l, c, h] = color.oklch();
	const constraints = calcBrightnessConstraints(THRESHOLDS.LIGHT, l, Math.min);
	return {
		Primary: [constraints.a, c, h],
		Selection: [constraints.a, c, h, 0.5],
		PrimaryBg: [constraints.a - 0.08, c, h],
		PrimaryBgHover: [constraints.a - 0.12, c, h],
		PrimaryBgActive: [constraints.a - 0.04, c, h],
		PrimaryBgFocus: [constraints.a, c, h],
		PrimaryFg: [getTextLightness(constraints.a - 0.06), 0, 0],
		PrimaryFgHover: [getTextLightness(constraints.a - 0.09), 0, 0],
		PrimaryFgActive: [getTextLightness(constraints.a - 0.03), 0, 0],
		PrimaryFgFocus: [getTextLightness(constraints.a), 0, 0],
		PrimaryBorder: [constraints.aa * 0.88, c, h],
		PrimaryBorderHover: [constraints.aa * 0.84, c, h],
		PrimaryBorderActive: [constraints.aa * 0.92, c, h],
		PrimaryBorderFocus: [constraints.aa * 0.5, c, h],
		SecondaryBg: [constraints.a, c, h, 0.15],
		SecondaryBgHover: [constraints.a, c, h, 0.25],
		SecondaryBgActive: [constraints.a, c, h, 0.1],
		SecondaryBgFocus: [constraints.a, c, h, 0.05],
		SecondaryFg: [constraints.aaa * 0.6, c, h],
		SecondaryFgHover: [constraints.aaa * 0.7, c, h],
		SecondaryFgActive: [constraints.aaa * 0.5, c, h],
		SecondaryFgFocus: [0, 0, 0],
		SecondaryBorder: [constraints.a, c, h, 0.5],
		SecondaryBorderHover: [constraints.a, c, h, 0.6],
		SecondaryBorderActive: [constraints.a, c, h, 0.4],
		SecondaryBorderFocus: [constraints.a, c, h],
	};
}

/** 生成原始暗色令牌 */
export function getRawDarkColorTokens(color: Color): RawColorTokens {
	const [l, c, h] = color.oklch();
	const constraints = calcBrightnessConstraints(THRESHOLDS.DARK, l, Math.max);
	return {
		Primary: [constraints.a, c, h],
		Selection: [constraints.a, c, h, 0.5],
		PrimaryBg: [constraints.a + 0.12, c, h],
		PrimaryBgHover: [constraints.a + 0.18, c, h],
		PrimaryBgActive: [constraints.a + 0.06, c, h],
		PrimaryBgFocus: [constraints.a, c, h],
		PrimaryFg: [getTextLightness(constraints.a + 0.12), 0, 0],
		PrimaryFgHover: [getTextLightness(constraints.a + 0.18), 0, 0],
		PrimaryFgActive: [getTextLightness(constraints.a + 0.06), 0, 0],
		PrimaryFgFocus: [getTextLightness(constraints.a), 0, 0],
		PrimaryBorder: [constraints.aa * 0.7, c, h],
		PrimaryBorderHover: [constraints.aa * 0.66, c, h],
		PrimaryBorderActive: [constraints.aa * 0.74, c, h],
		PrimaryBorderFocus: [constraints.aa * 0.5, c, h],
		SecondaryBg: [constraints.a, c, h, 0.2],
		SecondaryBgHover: [constraints.a, c, h, 0.27],
		SecondaryBgActive: [constraints.a, c, h, 0.12],
		SecondaryBgFocus: [constraints.a, c, h, 0.05],
		SecondaryFg: [constraints.aaa * 1.4, c, h],
		SecondaryFgHover: [constraints.aaa * 1.5, c, h],
		SecondaryFgActive: [constraints.aaa * 1.3, c, h],
		SecondaryFgFocus: [1, 0, 0],
		SecondaryBorder: [constraints.a, c, h, 0.5],
		SecondaryBorderHover: [constraints.a, c, h, 0.6],
		SecondaryBorderActive: [constraints.a, c, h, 0.4],
		SecondaryBorderFocus: [constraints.a, c, h],
	};
}

/** 生成颜色令牌 */
export function getColorTokens(light: Color, dark: Color): ColorTokens {
	const lightTokens = getRawLightColorTokens(light);
	const darkTokens = getRawDarkColorTokens(dark);
	const keys = Object.keys(lightTokens) as RawColorTokenKey[];
	const pairs = keys.flatMap<[string, string]>((key) => {
		const light = toCSSValue(lightTokens[key]);
		const dark = toCSSValue(darkTokens[key]);
		return [
			[`$light${key}`, light],
			[`$dark${key}`, dark],
			[`$${key}`, `light-dark(${light}, ${dark})`],
		];
	});
	return Object.fromEntries(pairs);
}

function apply<T extends ElementCSSInlineStyle>(
	target: T,
	light: Color,
	dark: Color,
): T {
	return $style(target, getColorTokens(light, dark));
}

/** 应用颜色令牌到指定元素 */
export function $color<T extends ElementCSSInlineStyle>(
	target: T,
	color?: ThemeColor | null,
): T {
	if (!color) return target;
	if (!Array.isArray(color)) {
		const c = toColor(color);
		if (c) return apply(target, c, c);
		if (typeof color !== 'object') return target;
		const { hue, chroma } = color as { hue: number; chroma?: number };
		const [light, dark] = toAccessibleColor(hue, chroma);
		return apply(target, light, dark);
	}
	const [light, dark] = color;
	const l = toColor(light);
	if (!l) return target;
	const d = toColor(dark);
	if (!d) return target;
	return apply(target, l, d);
}

/**
 * 应用符合 WCAG 对比度标准的颜色令牌
 * 基于指定的色相和色度自动生成满足可访问性要求的浅色/深色主题颜色
 *
 * @param target 目标元素
 * @param hue 色相值（0~360）
 * @param chroma 色度值，默认 0.15
 *
 * @example
 * // 应用蓝色系的可访问颜色令牌
 * applyAccessibleColorTokens(element, 240);
 *
 * // 应用高饱和度的红色系可访问颜色令牌
 * applyAccessibleColorTokens(element, 0, 0.25);
 */
export function applyAccessibleColorTokens<T extends ElementCSSInlineStyle>(
	target: T,
	hue: number,
	chroma?: number,
): T {
	const [light, dark] = toAccessibleColor(hue, chroma);
	return apply(target, light, dark);
}
