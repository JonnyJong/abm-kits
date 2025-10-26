import type { Stats } from 'node:fs';
import util from 'node:util';
import type { FSWatcher } from 'chokidar';
import type { EventName } from 'chokidar/handler';

export function stringify(data: any) {
	// TODO：可能需要优化输出效果
	return util.inspect(data);
}

const PATTERN_HTML_CHAR = /[&<>"']/g;
const HTML_ESCAPE_MAP: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
};
/** 转义 HTML */
export function escapeHTML(text: string): string {
	return text.replace(PATTERN_HTML_CHAR, (char) => HTML_ESCAPE_MAP[char]);
}

export type Comparer<T> = (a: T, b: T) => number;

export class OrderedMap<K, V> extends Map<K, V> {
	#compareFn?: Comparer<[K, V]>;
	#sortedEntries: [K, V][] = [];
	get compareFn() {
		return this.#compareFn;
	}
	set compareFn(value) {
		this.#compareFn = value;
		this.#sortEntries();
	}
	constructor(
		entries?: readonly (readonly [K, V])[] | null,
		compareFn?: Comparer<[K, V]>,
	) {
		super(entries);
		this.#compareFn = compareFn;
		this.#sortedEntries = entries?.map(([k, v]) => [k, v]) ?? [];
		this.#sortEntries();
	}
	#sortEntries(): void {
		if (this.#compareFn) {
			this.#sortedEntries.sort(this.#compareFn);
			return;
		}
		this.#sortedEntries = Array.from(super.entries());
	}
	#findInsertIndex(key: K, value: V): number {
		if (!this.#compareFn) return this.#sortedEntries.length;
		const target: [K, V] = [key, value];
		let left = 0;
		let right = this.#sortedEntries.length;
		while (left < right) {
			const mid = Math.floor((left + right) / 2);
			const cmp = this.#compareFn(target, this.#sortedEntries[mid]);
			if (cmp < 0) right = mid;
			else left = mid + 1;
		}
		return left;
	}
	set(key: K, value: V): this {
		super.set(key, value);

		const oldIndex = this.#sortedEntries.findIndex(([k]) => k === key);
		if (oldIndex !== -1) {
			this.#sortedEntries.splice(oldIndex, 1);
		}

		const newIndex = this.#findInsertIndex(key, value);
		this.#sortedEntries.splice(newIndex, 0, [key, value]);

		return this;
	}
	clear(): void {
		super.clear();
		this.#sortedEntries = [];
	}
	*entries(): MapIterator<[K, V]> {
		for (const [k, v] of this.#sortedEntries) {
			yield [k, v];
		}
	}
	*values(): MapIterator<V> {
		for (const [_, v] of this.#sortedEntries) {
			yield v;
		}
	}
	*keys(): MapIterator<K> {
		for (const [k] of this.#sortedEntries) {
			yield k;
		}
	}
	[Symbol.iterator](): MapIterator<[K, V]> {
		return this.entries();
	}
}

const ALLOWED_FS_EVENTS: EventName[] = [
	'add',
	'addDir',
	'change',
	'unlink',
	'unlinkDir',
];
export function setupWatcher(
	watcher: FSWatcher,
	handler: (path: string, stats?: Stats) => any,
) {
	watcher.once('ready', () => {
		watcher.on('all', (event, path, stats) => {
			if (!ALLOWED_FS_EVENTS.includes(event)) return;
			handler(path, stats);
		});
	});
}
