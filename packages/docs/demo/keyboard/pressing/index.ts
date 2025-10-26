import { keyboard } from 'abm-ui';
import { $, $new } from 'abm-utils';

const container = $('#main')!;

keyboard.on('down', (event) => {
	container.append(
		$new({ tag: 'w-hint-key', prop: { key: event.key }, id: event.key }),
	);
	console.log(event);
});

keyboard.on('up', (event) => {
	console.log(event);
	$(`#${event.key}`, container)?.remove();
});
