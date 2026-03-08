import type { SerializableThemeColor } from '../_nav/color';
import type { Direction } from '../_nav/direction';
import type { ColorSchema } from '../_nav/schema';

interface ConfigMap {
	lang: string;
	theme: SerializableThemeColor;
	scheme: ColorSchema;
	dire: Direction;
}

const prefix = '__ABM_DOCS:';
const cache = new Map<string, any>();

function tryParseJSON(text: string): any {
	try {
		return JSON.parse(text);
	} catch (error) {
		console.error(error);
	}
}

/** 读取设置 */
export function $get<T extends keyof ConfigMap>(key: T): ConfigMap[T] | null {
	if (cache.has(key)) return cache.get(key);
	let value: any = localStorage.getItem(prefix + key);
	if (value !== null) value = tryParseJSON(value);
	cache.set(key, value);
	return value;
}

/** 保存设置 */
export function $set<T extends keyof ConfigMap>(
	key: T,
	value: ConfigMap[T],
): void {
	cache.set(key, value);
	localStorage.setItem(prefix + key, JSON.stringify(value));
}
