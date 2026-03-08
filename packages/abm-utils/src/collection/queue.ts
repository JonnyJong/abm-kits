interface QueueItem<T> {
	data: T;
	next?: QueueItem<T>;
}

/** 队列 */
export class Queue<T> {
	#head?: QueueItem<T> | null;
	#tail?: QueueItem<T> | null;
	constructor(...items: T[]) {
		this.enqueue(...items);
	}
	/** 队列是否空 */
	get empty(): boolean {
		return !this.#head;
	}
	/** 入队 */
	enqueue(...items: T[]): void {
		if (items.length === 0) return;
		const item: QueueItem<T> = { data: items[0] };
		this.#head ??= item;
		if (this.#tail) this.#tail.next = item;
		this.#tail = item;
		for (const data of items.slice(1)) {
			const item: QueueItem<T> = { data };
			this.#tail.next = item;
			this.#tail = item;
		}
	}
	/** 出队 */
	dequeue(): T | null {
		if (!this.#head) return null;
		const { data } = this.#head;
		this.#head = this.#head.next;
		if (!this.#head) this.#tail = null;
		return data;
	}
	*[Symbol.iterator](): Generator<T> {
		while (true) {
			if (!this.#head) return;
			const { data } = this.#head;
			this.#head = this.#head.next;
			if (!this.#head) this.#tail = null;
			yield data;
		}
	}
	/**
	 * 遍历队列
	 * @description
	 * 支持同时入队
	 */
	entries(): Iterator<T> {
		return this[Symbol.iterator]();
	}
}
