import { WidgetIcon } from 'abm-ui';
import { $new } from 'abm-utils';
import { $panel } from '../../utils';

const file = $new(
	'w-file',
	$new<WidgetIcon, {}>('w-icon', {
		prop: { key: 'Document' },
		style: { fontSize: 32 },
	}),
	$new('w-lang', 'dev.widgets.file.placeholder'),
);

export function initFile() {
	$panel(
		'file',
		file,
		[
			{
				type: 'string',
				key: 'accept',
			},
			{
				type: 'boolean',
				key: 'multiple',
			},
			{
				type: 'enum',
				key: 'display',
				options: ['row', 'block'],
			},
			{
				type: 'boolean',
				key: 'previewImage',
			},
			{
				type: 'boolean',
				key: 'readonly',
			},
		],
		['change'],
	);
}
