import { $, $$, type Navigable, state } from 'abm-ui';

export function initFolds() {
	for (const fold of $$('details')) {
		const trigger = $<Navigable>(':scope>summary', fold);
		if (!trigger) continue;
		state.hover.add(trigger);
		state.active.add(trigger);
		trigger.setAttribute('nav', '');
	}
}
