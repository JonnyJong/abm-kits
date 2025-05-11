import { events, Navigable, WidgetList, WidgetListItem } from 'abm-ui';
import { $div, $new } from 'abm-utils';
import { css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { $panel } from '../../utils';

@customElement('test-list-item')
class TestListItem extends WidgetListItem<string> implements Navigable {
	static styles = css`
		:host { display: flex; align-items: center; gap: 4px; }
		:host([ui-hover]) { background: #0004 }
		:host(.w-list-selected) { background: #4004 }
	`;
	#str = $div();
	constructor() {
		super(undefined, true);
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

const list = $new<WidgetList<string>>('w-list');
list.itemClass = TestListItem;
list.items = ['Item 1', 'Item 2', 'Item 3'];
list.sortable = true;

export function initList() {
	$panel(
		'list',
		list,
		[
			{
				type: 'boolean',
				key: 'sortable',
			},
			{
				type: 'enum',
				key: 'selectType',
				options: [null, 'single', 'multi'],
			},
		],
		['active', 'sort'],
	);
}
