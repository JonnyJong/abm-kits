import {
	$div,
	$new,
	css,
	List,
	type Navigable,
	PrefabListItem,
	state,
} from 'abm-ui';
import { range, shift } from 'abm-utils';

const list = $new(List<number>, { style: { width: '100%' } });
list.value = range(10);
list.itemCreator = PrefabListItem.creator<number, { main: HTMLElement }>({
	init(self) {
		const main = $div({ class: 'grid-item-main', attr: { nav: '' } });
		const drag = $div<Navigable>(
			{ class: 'grid-item-drag', attr: { nav: '' } },
			'Drag',
		);
		self.main = main;
		main.replaceChildren(String(self.value));
		state.hover.add(main);
		state.active.add(main);

		state.hover.add(drag);
		state.active.add(drag);

		self.activeTrigger = main;
		self.selectTrigger = main;
		self.dragHandle = drag;
		self.replaceChildren(drag, main);
	},
	render(self) {
		self.main?.replaceChildren(String(self.value));
	},
	style: css`
		:host { display: flex }
		:host(.selected) {
			background: var(--primary-bg);
			color: var(--primary-fg);
			--ui-bg-hover: var(--primary-bg-hover);
			--ui-bg-active: var(--primary-bg-active);
		}
		::slotted(*) { padding: 8px }
		::slotted(.grid-item-main) { flex: 1 }
		::slotted([hover]) { background: var(--ui-bg-hover) }
		::slotted([active]) { background: var(--ui-bg-active) }
	`,
});

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
