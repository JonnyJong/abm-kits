import { DEFAULT_LOCALE_DICTS } from 'abm-ui';
import { defineTranslation as dt } from 'abm-utils';
import { AppLocaleDict } from '.';

export const LOCALE_EN: AppLocaleDict = {
	...DEFAULT_LOCALE_DICTS.en,
	dev: {
		properties: 'Properties',
		events: 'Events',
		ops: 'Operations',
		widget: {
			select: dt('Option {i}', {}),
		},
		empty: '',
		components: {
			tooltips: { content: 'Tooltips content' },
			dialog: {
				title: 'Title',
				content: 'Content (HTML)',
				color: 'Theme color',
				normal: 'Create Normal Dialog',
				confirm: 'Create Confirm Dialog',
				alert: 'Create Alert Dialog',
				mask_action: 'The action ID that is triggered when the mask is clicked',
			},
		},
		widgets: {
			file: {
				placeholder: 'Click here to select files or drag files here to add files',
			},
		},
	},
};
