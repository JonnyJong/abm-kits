import { $new, Select } from 'abm-ui';
import { range } from 'abm-utils';

const select = $new(
	Select<number>,
	{
		options: range(32).map((value) => ({ value, label: String(value) })),
	},
	'Click to select',
);

select.on('change', () => {
	console.log({
		value: select.value,
		index: select.index,
	});
});

body.append(select);

//#region #Reg
__registerControl(select, {
	events: ['change'],
	props: {
		value: [undefined, ...range(32)],
		index: [-1, ...range(32)],
	},
});
