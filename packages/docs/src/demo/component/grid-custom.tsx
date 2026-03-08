import {
	$new,
	css,
	defineElement,
	type ElementProps,
	Grid,
	GridItem,
} from 'abm-ui';
import { range, shift } from 'abm-utils';

@defineElement('my-grid-item')
class MyGridItem extends GridItem<number> {
	protected static hoverable = true;
	protected static activatable = true;
	protected static navigable = true;
	protected static style = css`
		:host {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 32px;
			width: 32px;
		}
		:host(.selected) {
			background: var(--primary-bg);
			color: var(--primary-fg);
			--ui-bg-hover: var(--primary-bg-hover);
			--ui-bg-active: var(--primary-bg-active);
		}
		:host([hover]) { background: var(--ui-bg-hover) }
		:host([active]) { background: var(--ui-bg-active) }
	`;
	#root = this.attachShadow();
	#value = 0;
	constructor(_prop?: ElementProps<MyGridItem>) {
		super();
		this.activeTrigger = this;
		this.selectTrigger = this;
	}
	get value() {
		return this.#value;
	}
	set value(value) {
		this.#value = value;
		this.#root.replaceChildren(String(value));
	}
	static create(value: number): MyGridItem {
		return $new(MyGridItem, { value });
	}
}

const grid = $new(Grid<number>, { style: { width: '100%' } });
grid.itemCreator = MyGridItem.create;
grid.value = range(100);

grid.on('active', (value, index) => {
	console.log('active', { value, index });
});
grid.on('select', () => {
	console.log('select', {
		value: grid.getSelected(),
		index: grid.getSelectedIndex(),
	});
});

body.append(grid);

//#region #Reg
__registerControl(grid, {
	events: ['active', 'select'],
	props: {
		selectType: [null, 'single', 'multi'],
		hGap: { type: 'number', min: 0 },
		vGap: { type: 'number', min: 0 },
	},
	actions: {
		add: () => grid.value.push(grid.value.length),
		remove: () => grid.value.splice(grid.value.indexOf(grid.value.length - 1), 1),
		shuffle: () => {
			for (const i of grid.value.keys()) {
				shift(grid.value, i, Math.random() * grid.value.length);
			}
		},
		sort: () => grid.value.sort((a, b) => a - b),
		reverse: () => grid.value.reverse(),
	},
});
