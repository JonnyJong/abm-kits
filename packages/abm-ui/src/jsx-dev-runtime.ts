import type { Constructor } from 'abm-utils';
import {
	$new,
	$path,
	type CustomElementTagNameMap,
	type DOMApplyOptions,
	type ElementConstructor,
	type GlobalAttributes,
} from './infra/dom';
import { $on } from './infra/event';

interface DevSource {
	fileName: string;
	lineNumber: number;
	columnNumber: number;
}

export const Fragment = DocumentFragment;

const kOwner = Symbol('owner');
const kSource = Symbol('source');

$on(window, 'click', (event) => {
	if (event.button !== 0) return;
	if (!event.altKey) return;
	if (!(event.target instanceof Element)) return;
	for (const element of $path(event.target)) {
		if (!(kOwner in element || kSource in element)) continue;
		console.group('Inspect Element');

		console.log('DOM Node: %o %O', element, element);

		if (kOwner in element) {
			console.log('Component Instance (Owner):', element[kOwner]);
		}

		if (!(kSource in element)) return console.groupEnd();
		const { fileName, lineNumber, columnNumber } = element[kSource] as DevSource;
		console.log(`Source: ${fileName}:${lineNumber}:${columnNumber}`);
		const url = `__open-in-editor?file=${encodeURIComponent(fileName)}:${lineNumber}:${columnNumber}`;
		fetch(url);

		return console.groupEnd();
	}
});

function info<T>(
	o: T,
	p: PropertyKey,
	attributes: PropertyDescriptor & ThisType<any>,
): T {
	return Object.defineProperty(o, p, {
		enumerable: false,
		writable: true,
		configurable: true,
		...attributes,
	});
}

export function jsxDEV<
	T extends K extends Constructor<infer E extends HTMLElement>
		? E
		: K extends keyof HTMLElementTagNameMap
			? HTMLElementTagNameMap[K]
			: K extends keyof CustomElementTagNameMap
				? CustomElementTagNameMap[K]
				: K extends DocumentFragment
					? DocumentFragment
					: K extends (options?: GlobalAttributes | null) => infer R
						? R
						: HTMLElement,
	K extends
		| keyof HTMLElementTagNameMap
		| keyof CustomElementTagNameMap
		| (string & {})
		| ElementConstructor
		| typeof DocumentFragment
		| ((options?: GlobalAttributes | null) => any),
>(
	type: K,
	options: DOMApplyOptions<K, T> | null | undefined,
	key: string | null | undefined,
	_isStaticChildren: boolean,
	source?: DevSource,
	self?: any,
): T {
	if (key !== undefined) {
		if (!options) options = {} as any;
		(options as any).key ??= key;
	}

	const node = $new(type, options);

	if (self) {
		if (typeof self !== 'object') info(node, kOwner, { value: self });
		else {
			const ref = new WeakRef(self);
			info(node, kOwner, { get: () => ref.deref() });
		}
	}
	if (source) info(node, kSource, { value: source });

	return node;
}
