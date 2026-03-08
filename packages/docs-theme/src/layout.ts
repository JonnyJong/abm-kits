import path from 'node:path';
import { Article, type LayoutConfig } from 'ezal';
import { createCompiler } from 'ezal-layout';
import { getLocales, type Language } from './locale';
import { FallbackPage } from './page/doc/fallback-page';
import { getDocsNav } from './page/doc/navigation';
import { parsePagePath } from './page/doc/path';

const EXTERNAL_MODULES = Object.fromEntries(
	['ezal'].map<[string, any]>((name) => [name, require(name)]),
);

function getLanguage(page: FallbackPage | Article): Language {
	if (page instanceof FallbackPage) return page.language;
	return parsePagePath(page)[1];
}

export const layoutConfig: LayoutConfig = {
	root: path.join(__dirname, '../layouts'),
	compiler: createCompiler({
		context: (page) => {
			if (!(page instanceof Article || page instanceof FallbackPage)) {
				return { page, locales: getLocales() };
			}
			const language = getLanguage(page);
			return {
				page,
				language,
				locales: getLocales(),
				nav: getDocsNav(language),
			};
		},
		external: EXTERNAL_MODULES,
	}),
};
