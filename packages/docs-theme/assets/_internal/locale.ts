import { LOCALES as DEFAULT } from 'abm-ui';
import type { LocaleDict, LocalePackage, LocaleVariant } from 'abm-utils';

declare module 'abm-utils' {
	interface LocaleRegistry extends LocalePackage<typeof ZH> {}
}

const ZH = {
	...DEFAULT.ZH,
	theme: {
		mode: {
			setup: '设置主题色',
			single: '单一颜色',
			dual: '亮暗双色',
			adaptive: '自适应',
			light: '亮色配色',
			dark: '暗色配色',
			hue: '色相',
			chroma: '色度',
		},
		schema: {
			auto: '自动',
			light: '亮色',
			dark: '暗色',
		},
	},
	source: '源代码',
	search: '键入以搜索...',
} as const satisfies LocaleDict;

const EN: LocaleVariant<typeof ZH> = {
	...DEFAULT.EN,
	theme: {
		mode: {
			setup: 'Set Theme Color',
			single: 'Single Color',
			dual: 'Light/Dark Pair',
			adaptive: 'Adaptive',
			light: 'Light Color',
			dark: 'Dark Color',
			hue: 'Hue',
			chroma: 'Chroma',
		},
		schema: {
			auto: 'Auto',
			light: 'Light',
			dark: 'Dark',
		},
	},
	source: 'Source Code',
	search: 'Type to search...',
};

export const LOCALES = { ZH, EN };
