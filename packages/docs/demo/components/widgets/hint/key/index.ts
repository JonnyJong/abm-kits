import { KEYS_ALLOW } from 'abm-ui';
import { $, $apply, $new } from 'abm-utils';

$('#main')?.append(
	...KEYS_ALLOW.map((key) => $new('w-hint-key', { prop: { key } })),
	$new('w-hint-key'),
);

$apply($('#panel')!, { style: { display: 'none' } });
