import { $new, Select } from 'abm-ui';
import { $emit, $handle } from '../_internal/channel';
import { $set } from '../_internal/config';

const languages = (globalThis as any).__LOCALES as Record<string, string>;

export function changeLanguage(lang: string): void {
	const current = document.documentElement.lang;
	if (current === lang) return;
	if (!(lang in languages)) return;
	const path = location.pathname.slice(10 + current.length);
	location.href = `/abm-kits/${lang}${path}`;
}

export default function LanguageSetter() {
	const select = $new(Select<string>);
	select.options = Object.entries(languages).map(([value, label]) => ({
		value,
		label,
	}));
	select.value = document.documentElement.lang;
	select.on('change', (lang) => {
		$set('lang', lang!);
		$emit('lang', lang!);
		changeLanguage(lang!);
	});
	$handle('lang', changeLanguage);
	return select;
}
