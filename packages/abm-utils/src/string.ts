export function parseKeyNamespace(
	key: string,
): [namespace: string | null, key: string] {
	const i = key.indexOf(':');
	if (i === -1) return [null, key];
	return [key.slice(0, i), key.slice(i + 1)];
}
