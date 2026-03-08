import { transformerColorizedBrackets } from '@shikijs/colorized-brackets';
import { ModelOperations } from '@vscode/vscode-languagedetection';
import {
	type CodeblockParsed,
	type CommonPlugin,
	plugins,
	utils,
} from 'ezal-markdown';
import {
	type BundledLanguage,
	type BundledTheme,
	createHighlighter,
	type HighlighterGeneric,
	type ShikiTransformer,
} from 'shiki';
import { LANGUAGE_MAP } from './data';

const modelOperations = new ModelOperations();

async function getLang(code: string, lang?: string): Promise<string> {
	if (lang) return lang;
	const result = await modelOperations.runModel(code);
	return result.toSorted((a, b) => b.confidence - a.confidence)[0].languageId;
}

let shiki: HighlighterGeneric<BundledLanguage, BundledTheme>;
const transformers: ShikiTransformer[] = [transformerColorizedBrackets()];

export async function highlight(
	code: string,
	lang?: string,
): Promise<[html: string, lang: string]> {
	lang = await getLang(code, lang);
	let loadedLanguage = lang;
	try {
		await shiki.loadLanguage(lang as any);
	} catch {
		loadedLanguage = 'plain';
	}
	const html = shiki.codeToHtml(code, {
		lang: loadedLanguage,
		themes: { light: 'light-plus', dark: 'dark-plus' },
		defaultColor: false,
		transformers,
	});
	return [html, lang];
}

function toCodeName(lang: string) {
	return LANGUAGE_MAP.get(lang) ?? lang;
}

const { $ } = utils;

export const PATTERN_EMPTY_LINE =
	/\n<span class="line">(<span class="mtk-\d+"><\/span>)?<\/span><\/code><\/pre>$/;

async function render({
	code,
	lang,
	children,
}: CodeblockParsed): Promise<string> {
	const result = await highlight(code, lang);
	return $('figure', {
		class: ['surface', 'code'],
		html: [
			$('figcaption', {
				class: 'sticky',
				html: [$('code', toCodeName(result[1])), children?.html ?? ''],
			}),
			result[0].replace(PATTERN_EMPTY_LINE, '</code></pre>'),
		],
	});
}

const origin = plugins.codeblock();
export async function codeblock() {
	shiki = await createHighlighter({
		themes: ['light-plus', 'dark-plus'],
		langs: ['ts', 'tsx', 'pug', 'stylus'],
	});
	return {
		indented: { ...origin.indentedCodeblock, render },
		fenced: { ...origin.fencedCodeblock, render },
	} satisfies Record<string, CommonPlugin<'block', CodeblockParsed>>;
}
