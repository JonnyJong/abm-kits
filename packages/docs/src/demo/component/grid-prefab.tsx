import { $new, css, Grid, PrefabGridItem } from 'abm-ui';
import { range, shift } from 'abm-utils';

const grid = $new(Grid<number>, { style: { width: '100%' } });
grid.value = range(100);
grid.itemCreator = PrefabGridItem.creator<number>({
	render(self) {
		self.replaceChildren(String(self.value));
	},
	activeTrigger: true,
	selectTrigger: true,
	hoverable: true,
	activatable: true,
	navigable: true,
	style: css`
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
	`,
});

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
