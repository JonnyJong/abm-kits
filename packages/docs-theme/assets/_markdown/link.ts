import { $$, type Navigable, state } from 'abm-ui';

export function initLinks() {
	for (const a of $$<HTMLAnchorElement & Navigable>('article a')) {
		a.setAttribute('nav', '');
		state.hover.add(a);
		state.active.add(a);
	}
}
