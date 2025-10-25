import {
	events,
	type Navigable,
	type WidgetList,
	WidgetListItem,
} from 'abm-ui';
import { $, $div, $new } from 'abm-utils';
import { css } from 'lit';
import { customElement } from 'lit/decorators.js';

class TestListItem extends WidgetListItem<string> implements Navigable {
	static styles = css`
		:host { display: flex; align-items: center; gap: 4px; }
		:host([ui-hover]) { background: #0004 }
		:host(.w-list-selected) { background: #4004 }
	`;
	#str = $div();
	constructor() {
		super({ nav: true });
		this.dragHandle = this;
		this.activeTrigger = this;
		this.selectTrigger = this;

		events.hover.add(this);
	}
	protected render(): unknown {
		return this.#str;
	}
	get data() {
		return this.#str.textContent ?? '';
	}
	set data(value: string) {
		this.#str.textContent = value;
	}
	static create(data: string): TestListItem {
		const item: TestListItem = $new('test-list-item' as any);
		item.data = data;
		return item;
	}
}

customElement('test-list-item')(TestListItem);

const list = $<WidgetList>('w-list')!;
list.itemClass = TestListItem;
list.items = ['Item 1', 'Item 2', 'Item 3'];
list.sortable = true;

list.on('active', (event) => {
	console.log(event);
	emit('active');
});

list.on('sort', (event) => {
	console.log(event);
	emit('sort');
});

list.on('select', (event) => {
	console.log(event);
	emit('select');
});

const { emit } = window.register({
	events: ['active', 'sort', 'select'],
	attrs: [
		{
			id: 'sortable',
			type: 'boolean',
			value: list.sortable,
			action(v) {
				list.sortable = v;
			},
		},
		{
			id: 'selectType',
			type: 'enum',
			options: [null, 'single', 'multi'],
			value: list.selectType,
			action(v) {
				list.selectType = v;
			},
		},
		{
			id: 'sortStartDelay',
			type: 'number',
			value: list.sortStartDelay,
			action(v) {
				list.sortStartDelay = v;
			},
		},
	],
});
