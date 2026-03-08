import { $, $$, type Navigable, state } from 'abm-ui';
import { handleActive } from './link';

export function initFolds() {
	for (const fold of $$('details')) {
		const trigger = $<Navigable>(':scope>summary', fold);
		if (!trigger) continue;
		state.hover.add(trigger);
		state.active.add(trigger);
		trigger.setAttribute('nav', '');
		handleActive(trigger, () => {
			fold.open = !fold.open;
		});
	}
}
