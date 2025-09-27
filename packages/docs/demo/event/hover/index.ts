import { events } from 'abm-ui';
import { $ } from 'abm-utils';

const target = $('#hover-target')!;
events.hover.on(target, (event)=>{
	console.log(event);
});
