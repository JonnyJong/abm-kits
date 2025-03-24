import { $new } from 'abm-utils';
import { $panel } from '../../utils';

export function initLang() {
	$panel(
		'lang',
		$new('w-lang', 'ui.confirm'),
		[
			{
				type: 'string',
				key: 'namespace',
			},
			{
				type: 'string',
				key: 'key',
			},
		],
		[],
	);
}
