import type { LanguageCode } from 'ezal';

export type Language = LanguageCode | `${LanguageCode}-${string}`;
export type Locales = {
	[K in Language]?: string;
};

let locales: Locales;
let languages: Language[];

export function setLocales(langs: Locales): void {
	locales = langs;
	languages = Object.keys(langs) as Language[];
}

export function getLocales(): Locales {
	return locales;
}

export function getLanguages(): Language[] {
	return languages;
}
