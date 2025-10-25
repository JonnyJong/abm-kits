import { events } from 'abm-ui';
import { $ } from 'abm-utils';

const target = $('#active-target')!;
events.active.on(target, (event) => {
	console.log(event);
});
