import { UIDefaultLocaleDict, defaultLocale } from 'abm-ui';
import { LocaleDictDefine } from 'abm-utils';
import { LOCALE_EN } from './en';
import { LOCALE_ZH } from './zh';

export type AppLocaleDict = LocaleDictDefine<typeof LOCALE_ZH> &
	UIDefaultLocaleDict;

const LOCALES: Record<string, AppLocaleDict> = {
	zh: LOCALE_ZH,
	en: LOCALE_EN,
};

export function initLocale() {
	defaultLocale.loader = (locale) => {
		return LOCALES[locale] ?? null;
	};
}
