import {
	$new,
	css,
	defineElement,
	type ElementProps,
	List,
	ListItem,
	type Navigable,
	type NavState,
	navigate,
} from 'abm-ui';
import { range, shift, Timeout } from 'abm-utils';

@defineElement('my-list-item')
class MyListItem extends ListItem<number> implements Navigable {
	protected static hoverable = true;
	protected static activatable = true;
	protected static navigable = true;
	protected static style = css`
		:host { padding: 8px 12px }
		:host(.selected) {
			background: var(--primary-bg);
			color: var(--primary-fg);
			--ui-bg-hover: var(--primary-bg-hover);
			--ui-bg-active: var(--primary-bg-active);
		}
		:host([hover]) { background: var(--ui-bg-hover) }
		:host([active]) { background: var(--ui-bg-active) }
	`;
	#timeout = new Timeout(() => this.startSort());
	#root = this.attachShadow();
	constructor(_prop?: ElementProps<MyListItem>) {
		super();
		this.activeTrigger = this;
		this.selectTrigger = this;
		this.dragHandle = this;
	}
	#value = 0;
	get value() {
		return this.#value;
	}
	set value(value) {
		this.#value = value;
		this.#root.replaceChildren(String(value));
	}
	navCallback(state: NavState) {
		this.#timeout.stop();
		// 激活时等待开始排序
		if (state.type === 'active' && state.down) {
			this.#timeout.start(500);
			return;
		}
		// 取消或失去焦点时停止排序
		if (state.type === 'cancel' || state.type === 'blur') {
			navigate.unlock();
			this.stopSort();
			return;
		}
		// 自动处理导航排序
		this.handleNavSort(state);
	}
	// 开始排序设置
	sortStart(): void {
		super.sortStart();
		navigate.lock(this);
	}
	static create(value: number): MyListItem {
		return $new(MyListItem, { value });
	}
}

const list = $new(List<number>, { style: { width: '100%' } });
list.itemCreator = MyListItem.create;
list.value = range(10);
list.mouseStartDelay = 500;

list.on('active', (value, index) => {
	console.log('active', { value, index });
});
list.on('select', () => {
	console.log('select', {
		value: list.getSelected(),
		index: list.getSelectedIndex(),
	});
});
list.on('sort', () => {
	console.log('sort', { value: list.value });
});

body.append(list);

//#region #Reg
__registerControl(list, {
	events: ['active', 'select', 'sort'],
	props: {
		selectType: [null, 'single', 'multi'],
		mouseSortDelay: { type: 'number', min: 0 },
		penSortDelay: { type: 'number', min: 0 },
		touchSortDelay: { type: 'number', min: 0 },
	},
	actions: {
		add: () => list.value.push(list.value.length),
		remove: () => list.value.splice(list.value.indexOf(list.value.length - 1), 1),
		shuffle: () => {
			for (const i of list.value.keys()) {
				shift(list.value, i, Math.random() * list.value.length);
			}
		},
		sort: () => list.sort((a, b) => a - b),
		reverse: () => list.value.reverse(),
	},
});
