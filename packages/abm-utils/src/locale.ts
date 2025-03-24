import { runSync } from './function';

export const LOCALE_TEMPLATE_VARIABLE_REGEX = /(?<!\\)\${(.+?)}/g;

export interface LocaleDictOptions {
	/**
	 * 默认值，若未设置，则返回 key
	 */
	default?: string;
	/**
	 * 是否移除未匹配的占位符
	 */
	removeUnmatched?: boolean;
}

export function createLocaleDict<
	Dict extends Record<string, string> = Record<string, string>,
>(dict: Dict, options?: LocaleDictOptions) {
	const defaultValue = options?.default ?? undefined;
	const removeUnmatched = options?.removeUnmatched ?? false;

	return {
		get(key: string, options?: Record<string, any>) {
			if (!(key in dict)) {
				if (typeof defaultValue === 'string') return defaultValue;
				return key;
			}
			if (typeof options !== 'object') return dict[key];

			return dict[key].replace(LOCALE_TEMPLATE_VARIABLE_REGEX, (raw, label) => {
				if (!(label in options)) {
					if (removeUnmatched) return '';
					return raw;
				}

				const str = runSync(options[label]?.toString);
				if (typeof str === 'string') return str;

				return options[label];
			});
		},
	};
}
