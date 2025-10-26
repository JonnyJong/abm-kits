import { KEYS_ALLOW } from 'abm-ui';
import { $, $apply, $new } from 'abm-utils';

$('#main')?.append(
	...KEYS_ALLOW.map((key) => $new({ tag: 'w-hint-key', prop: { key } })),
	$new({ tag: 'w-hint-key' }),
);

$apply($('#panel')!, { style: { display: 'none' } });
