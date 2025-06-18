import { tooltips } from 'abm-ui';
import { $, $div, $new } from 'abm-utils';

export function initTooltips() {
	const panel = $('#dev-tooltips')!;
	const div = $div('Hover me!');
	const input = $new('w-text', {
		id: 'dev-tooltips-content',
		prop: { value: 'Hello world!' },
	});

	tooltips.set(div, 'Hello world!');

	input.on('input', ({ value }) => tooltips.set(div, value || undefined));
	input.on('confirm', ({ value }) => tooltips.set(div, value || undefined));

	panel.append(
		$new(
			'w-label',
			{ prop: { for: 'dev-tooltips-content' } },
			$new('w-lang', 'dev.components.tooltips.content'),
		),
		input,
		div,
	);
}
