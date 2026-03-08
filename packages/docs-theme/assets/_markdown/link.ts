import { $$, type Navigable, state } from 'abm-ui';

export function handleActive(target: Navigable, handler: () => any): void {
	let activated = false;
	target.navCallback = (state) => {
		if (state.type !== 'active') {
			activated = false;
			return;
		}
		if (state.down) activated = true;
		else if (!activated) return;
		activated = false;
		handler();
	};
}

export function initLinks() {
	for (const a of $$<HTMLAnchorElement & Navigable>('article a')) {
		a.setAttribute('nav', '');
		state.hover.add(a);
		state.active.add(a);
		handleActive(a, () => a.click());
	}
}
