/** 解析键名空间 */
export function parseKeyNamespace(
	key: string,
): [namespace: string | null, key: string] {
	const i = key.indexOf(':');
	if (i === -1) return [null, key];
	return [key.slice(0, i), key.slice(i + 1)];
}

/** 通过码点比较字符串 */
export function compareString(a: unknown, b: unknown): number {
	const A = String(a);
	const B = String(b);
	if (A === B) return 0;
	return A > B ? 1 : -1;
}
