import type { Widget } from './components/widgets/base';

export function initContextMenu() {
	addEventListener('contextmenu', (event) => {
		for (const element of event.composedPath()) {
			if ((element as Widget).contextMenuBehavior) return;
		}
		event.preventDefault();
	});
}
