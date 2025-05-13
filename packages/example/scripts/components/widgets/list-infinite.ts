import { Signal } from '@lit-labs/signals';
import { WidgetListInfinite, WidgetListInfiniteItem } from 'abm-ui';
import { $new, range, sleep } from 'abm-utils';
import { css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { $panel } from '../../utils';

@customElement('test-list-infinite-item')
class TestListInfiniteItem extends WidgetListInfiniteItem<number> {
	static styles = css`
		:host {
			padding: 16px;
			outline: 1px solid;
			outline-offset: -1px;
		}
	`;
	#identifier = new Signal.State(0);
	get identifier() {
		return this.#identifier.get();
	}
	set identifier(value) {
		this.#identifier.set(value);
	}
	protected render() {
		return this.#identifier.get().toString();
	}
	static create(identifier: number): TestListInfiniteItem {
		const node: TestListInfiniteItem = $new('test-list-infinite-item' as any);
		node.identifier = identifier;
		return node;
	}
	static async prev(from: number): Promise<number[] | null> {
		await sleep(Math.trunc(Math.random() * 10));
		if (from < -200) return null;
		return range(-10, 0).map((diff) => from + diff);
	}
	static async next(from: number): Promise<number[] | null> {
		await sleep(Math.trunc(Math.random() * 10));
		if (from > 200) return null;
		return range(1, 11).map((diff) => from + diff);
	}
}

const list = $new<WidgetListInfinite<number>>('w-list-infinite', {
	style: { height: '50vh', scrollbarWidth: 'thin' },
});
list.init(0, TestListInfiniteItem);
list.scrollBufferThreshold = 20;
list.topBoundaryContent = 'End';
list.bottomBoundaryContent = 'End';

export function initListInfinite() {
	$panel('list-infinite', list, [], []);
}
