import { KEYS_ALLOW } from 'abm-ui';
import { $, $new } from 'abm-utils';

export function initHintKey() {
	$('#dev-hint-key')?.append(
		...KEYS_ALLOW.map((key) => $new('w-hint-key', { prop: { key } })),
		$new('w-hint-key'),
	);
}
