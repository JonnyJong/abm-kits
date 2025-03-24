import { ColorScheme, WidgetColor, WidgetSelect, configs } from 'abm-ui';
import { $ } from 'abm-utils';

export function initSettings() {
	const theme = $<WidgetColor>('#settings-theme')!;
	theme.on('change', () => {
		configs.theme.color = theme.value;
	});

	const schema = $<WidgetSelect<ColorScheme>>('#settings-schema')!;
	schema.options = [
		{ value: 'system', label: 'System' },
		{ value: 'light', label: 'Light' },
		{ value: 'dark', label: 'Dark' },
	];
	schema.value = 'system';
	schema.on('change', () => {
		configs.theme.colorScheme = schema.value!;
	});
}
