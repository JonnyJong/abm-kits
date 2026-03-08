import { $new, ico, Select, t } from 'abm-ui';
import { $emit, $handle } from '../_internal/channel';
import { $get, $set } from '../_internal/config';

export type ColorSchema = 'system' | 'light' | 'dark';

export function setSchema(schema: ColorSchema) {
	document.documentElement.setAttribute('ui-scheme', schema);
}

export function ThemeSchemaSetter() {
	const select = $new(Select<ColorSchema>);
	select.options = [
		{ value: 'system', label: [ico('scheme.auto'), t('theme.schema.auto')] },
		{ value: 'light', label: [ico('scheme.light'), t('theme.schema.light')] },
		{ value: 'dark', label: [ico('scheme.dark'), t('theme.schema.dark')] },
	];
	select.value = $get('scheme')!;
	if (!select.value) select.value = 'system';
	select.on('change', () => {
		const value = select.value;
		if (!value) return;
		$set('scheme', value);
		$emit('scheme', value);
		setSchema(value);
	});
	$handle('scheme', (schema) => {
		select.value = schema;
		setSchema(schema);
	});
	return select;
}
