import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { asArray, Color } from '../packages/abm-utils/dist/index.mjs';
import type {
	ArrayOr,
	Oklch,
	OklchAlpha,
} from '../packages/abm-utils/src/index.js';

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
/** CSS 声明 */
type CSSDeclares = [selector: ArrayOr<string>, rules: Record<string, string>][];

const PATTERN_CSS_VAR_DECLARE = /^\$(.)/;
const PATTERN_CSS_UPPER = /[A-Z]/g;

//#region Helper

/** 解析简写 CSS 变量 */
function parseCSSVar(input: string): string {
	return input
		.replace(PATTERN_CSS_VAR_DECLARE, (_, c: string) => `--${c.toLowerCase()}`)
		.replaceAll(PATTERN_CSS_UPPER, (c) => `-${c.toLowerCase()}`);
}

function renderRules(rules: Record<string, string>): string {
	return Object.entries(rules)
		.map(([prop, value]) => `${parseCSSVar(prop)}:${value}`)
		.join(';');
}

function toCSS(declares: CSSDeclares): string {
	return declares
		.map(
			([selector, rules]) =>
				`${asArray(selector).join(',')}{${renderRules(rules)}}`,
		)
		.join('');
}

//#region Main

function font(...names: string[]): string {
	return names
		.map((name) => (name.includes(' ') ? `'${name}'` : name))
		.join(',');
}

async function main() {
	const toValue = (input: number | Oklch | OklchAlpha): string => {
		if (typeof input === 'number') return String(input);
		if (input.length === 3) return Color.oklch(input).hex();
		return Color.oklchAlpha(input).hexa();
	};
	const light: Record<string, string> = {};
	const dark: Record<string, string> = {};
	const auto: Record<string, string> = {};
	for (const key of Object.keys(SCHEME_LIGHT) as (keyof typeof SCHEME_LIGHT)[]) {
		const l = toValue(SCHEME_LIGHT[key]);
		const d = toValue(SCHEME_DARK[key]);
		const p = `$${key}`;
		light[p] = l;
		dark[p] = d;
		auto[p] = `light-dark(${l}, ${d})`;
	}
	for (const key of RAW_COLOR_TOKEN_KEYS) {
		const p = `$${key}`;
		const v = parseCSSVar(key);
		light[p] = `var(--light${v})`;
		dark[p] = `var(--dark${v})`;
		auto[p] = `light-dark(${light[p]}, ${dark[p]})`;
	}
	const declares: CSSDeclares = [
		...PRESET_CSS,
		[[`[ui-scheme='system']`, `[ui-scheme='light']`, ':root'], light],
		[`[ui-scheme='dark']`, dark],
		[[`[ui-scheme='system']`, ':root'], auto],
	];
	const darkDeclares: CSSDeclares = [
		[[`[ui-scheme='system']`, ':root'], dark],
		[[`[ui-scheme='system']`, ':root'], auto],
	];

	const css = `${toCSS(declares)}@media (prefers-color-scheme: dark) {${toCSS(darkDeclares)}}`;

	await writeFile(
		path.join(import.meta.dirname, '../packages/abm-ui/src/style/var.css'),
		css,
		'utf8',
	);
}

const PRESET_CSS: CSSDeclares = [
	[
		':root',
		{
			$font: font(
				'Noto Sans SC',
				'WenQuanYi Micro Hei',
				'Noto Sans',
				'Microsoft YaHei UI',
				'Microsoft YaHei',
				'HarmonyOS Sans SC',
				'MiSans',
				'PingFang SC',
				'Hiragino Sans GB',
				'ui-sans-serif',
				'system-ui',
				'sans-serif',
			),
			$fontMono: font(
				'Maple Mono NF CN',
				'Maple Mono SC NF',
				'Sarasa Term SC',
				'LXGW WenKai Mono',
				'JetBrains Mono',
				'Fira Code',
				'Cascadia Code',
				'Source Code Pro',
				'Monaco',
				'SF Mono',
				'Menlo',
				'Consolas',
				'DejaVu Sans Mono',
				'Liberation Mono',
				'Courier New',
				'monospace',
			),
			$borderRadius: '8px',
			$borderRadiusMax: 'calc(var(--border-radius) * 1e10)',
			$lightSurfaceGlass: '1.05',
			$darkSurfaceGlass: '.7',
			$safeTop: 'env(safe-area-inset-top)',
			$safeRight: 'env(safe-area-inset-right)',
			$safeBottom: 'env(safe-area-inset-bottom)',
			$safeLeft: 'env(safe-area-inset-left)',
		},
	],
	[
		'body',
		{
			$safeVStart: 'var(--safe-top)',
			$safeVEnd: 'calc(100vh - var(--safe-bottom))',
			$safeVSize: 'calc(100vh - var(--safe-bottom) - var(--safe-top))',
			$safeHStart: 'var(--safe-left)',
			$safeHEnd: 'calc(100vw - var(--safe-right))',
			$safeHSize: 'calc(100vw - var(--safe-right) - var(--safe-left))',
		},
	],
	[[':root', `[ui-scheme='system']`], { colorScheme: 'dark light' }],
	[`[ui-scheme='light']`, { colorScheme: 'light' }],
	[`[ui-scheme='dark']`, { colorScheme: 'dark' }],
];

const RAW_COLOR_TOKEN_KEYS: RawColorTokenKey[] = [
	'Primary',
	'Selection',
	'PrimaryBg',
	'PrimaryBgHover',
	'PrimaryBgActive',
	'PrimaryBgFocus',
	'PrimaryFg',
	'PrimaryFgHover',
	'PrimaryFgActive',
	'PrimaryFgFocus',
	'PrimaryBorder',
	'PrimaryBorderHover',
	'PrimaryBorderActive',
	'PrimaryBorderFocus',
	'SecondaryBg',
	'SecondaryBgHover',
	'SecondaryBgActive',
	'SecondaryBgFocus',
	'SecondaryFg',
	'SecondaryFgHover',
	'SecondaryFgActive',
	'SecondaryFgFocus',
	'SecondaryBorder',
	'SecondaryBorderHover',
	'SecondaryBorderActive',
	'SecondaryBorderFocus',
];

const SCHEME_LIGHT = {
	bg: [0.985, 0, 0],
	fg: [0.02, 0, 0],
	fgDim: [0.02, 0, 0, 0.6],
	// Surface
	surfaceBg: [0.95, 0, 0, 0.5],
	surfaceBorder: [0, 0, 0, 0.2],
	// surfaceGlass: 1.05,
	// UI
	uiBg: [0.95, 0, 0, 0.5],
	uiBgHover: [0.91, 0, 0],
	uiBgActive: [0.97, 0, 0, 0.4],
	uiBgFocus: [1, 0, 0],
	uiBorder: [0, 0, 0, 0.25],
	uiBorderHover: [0, 0, 0, 0.35],
	uiBorderActive: [0, 0, 0, 0.15],
	uiBorderFocus: [0, 0, 0, 0.5],
	// Danger
	danger: [0.45, 0.3, 30],
	dangerBg: [0.45, 0.3, 30, 0.15],
	dangerBgHover: [0.45, 0.3, 30, 0.25],
	dangerBgActive: [0.45, 0.3, 30, 0.1],
	dangerBgFocus: [0.45, 0.3, 30, 0.05],
	dangerFg: [0.262, 0.3, 30],
	dangerFgHover: [0.306, 0.3, 30],
	dangerFgActive: [0.219, 0.3, 30],
	dangerFgFocus: [0, 0, 0],
	dangerBorder: [0.45, 0.3, 30, 0.5],
	dangerBorderHover: [0.45, 0.3, 30, 0.6],
	dangerBorderActive: [0.45, 0.3, 30, 0.4],
	dangerBorderFocus: [0.45, 0.3, 30],
	// Critical
	criticalBg: [0.37, 0.3, 30],
	criticalBgHover: [0.33, 0.3, 30],
	criticalBgActive: [0.41, 0.3, 30],
	criticalBgFocus: [0.45, 0.3, 30],
	criticalFg: [1, 0, 0],
	criticalFgHover: [1, 0, 0],
	criticalFgActive: [1, 0, 0],
	criticalFgFocus: [1, 0, 0],
	criticalBorder: [0.396, 0.3, 30],
	criticalBorderHover: [0.378, 0.3, 30],
	criticalBorderActive: [0.414, 0.3, 30],
	criticalBorderFocus: [0.225, 0.3, 30],
	// === Widget ===
	// Toast
	toastBgSuccess: [0.4, 0.2, 142, 0.15],
	toastBorderSuccess: [0.5, 0.2, 142, 0.5],
	toastBgWarn: [0.5, 0.2, 60, 0.15],
	toastBorderWarn: [0.4, 0.2, 60, 0.5],
	toastBgError: [0.4, 0.2, 30, 0.15],
	toastBorderError: [0.4, 0.2, 30, 0.5],
	// Gamepad
	gamepadA: [0.6, 0.2, 145],
	gamepadB: [0.6, 0.2, 20],
	gamepadX: [0.6, 0.2, 240],
	gamepadY: [0.6, 0.2, 90],
} as const satisfies Record<string, Oklch | OklchAlpha | number>;

const SCHEME_DARK: Record<
	keyof typeof SCHEME_LIGHT,
	Oklch | OklchAlpha | number
> = {
	bg: [0.173, 0, 0],
	fg: [0.97, 0, 0],
	fgDim: [0.97, 0, 0, 0.7],
	// Surface
	surfaceBg: [0.25, 0, 0, 0.5],
	surfaceBorder: [1, 0, 0, 0.1],
	// surfaceGlass: 0.7,
	// UI
	uiBg: [0.25, 0, 0, 0.5],
	uiBgHover: [0.3, 0, 0],
	uiBgActive: [0.3, 0, 0, 0.3],
	uiBgFocus: [0.1, 0, 0],
	uiBorder: [1, 0, 0, 0.25],
	uiBorderHover: [1, 0, 0, 0.35],
	uiBorderActive: [1, 0, 0, 0.15],
	uiBorderFocus: [1, 0, 0, 0.5],
	// Danger
	danger: [0.75, 0.3, 30],
	dangerBg: [0.75, 0.3, 30, 0.15],
	dangerBgHover: [0.75, 0.3, 30, 0.25],
	dangerBgActive: [0.75, 0.3, 30, 0.1],
	dangerBgFocus: [0.75, 0.3, 30, 0.05],
	dangerFg: [1, 0.3, 30],
	dangerFgHover: [1, 0.3, 30],
	dangerFgActive: [0.975, 0.3, 30],
	dangerFgFocus: [1, 0, 0],
	dangerBorder: [0.75, 0.3, 30, 0.5],
	dangerBorderHover: [0.75, 0.3, 30, 0.6],
	dangerBorderActive: [0.75, 0.3, 30, 0.4],
	dangerBorderFocus: [0.75, 0.3, 30],
	// Critical
	criticalBg: [0.87, 0.3, 30],
	criticalBgHover: [0.93, 0.3, 30],
	criticalBgActive: [0.81, 0.3, 30],
	criticalBgFocus: [0.75, 0.3, 30],
	criticalFg: [0, 0, 0],
	criticalFgHover: [0, 0, 0],
	criticalFgActive: [0, 0, 0],
	criticalFgFocus: [0, 0, 0],
	criticalBorder: [0.525, 0.3, 30],
	criticalBorderHover: [0.495, 0.3, 30],
	criticalBorderActive: [0.555, 0.3, 30],
	criticalBorderFocus: [0.375, 0.3, 30],
	// === Widget ===
	// Toast
	toastBgSuccess: [0.65, 0.2, 142, 0.2],
	toastBorderSuccess: [0.65, 0.2, 142, 0.5],
	toastBgWarn: [0.65, 0.2, 60, 0.2],
	toastBorderWarn: [0.65, 0.2, 60, 0.5],
	toastBgError: [0.65, 0.2, 30, 0.2],
	toastBorderError: [0.65, 0.2, 30, 0.5],
	// Gamepad
	gamepadA: [0.7, 0.2, 145],
	gamepadB: [0.7, 0.2, 20],
	gamepadX: [0.7, 0.2, 240],
	gamepadY: [0.7, 0.2, 90],
};

main();
