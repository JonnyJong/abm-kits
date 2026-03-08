import { $new, Checkbox, NumberBox, Table, TextBox } from 'abm-ui';
import { createArray, shift } from 'abm-utils';

interface Data {
	string: string;
	number: number;
	boolean: boolean;
}

const table = $new(Table<Data>);
table.columns = [
	{
		key: 'string',
		head: () => 'String',
		cell: TextBox as any,
	},
	{
		key: 'number',
		head: () => 'Number',
		cell: NumberBox as any,
	},
	{
		key: 'boolean',
		head: () => 'Boolean',
		cell: Checkbox as any,
	},
];

function generateData() {
	return {
		string: Math.trunc(Math.random() * 1000).toString(36),
		number: Math.random() * 100,
		boolean: Math.random() > 0.5,
	};
}

function fillDataRandomly() {
	table.value = createArray(10, generateData);
}

fillDataRandomly();

body.append(table);

//#region #Reg
__registerControl(table, {
	events: ['input', 'change', 'submit'],
	actions: {
		fillDataRandomly,
		pushRow: () => table.value.push(generateData()),
		popRow: () => table.value.pop(),
		shuffle: () => {
			for (const i of table.value.keys()) {
				shift(table.value, i, Math.random() * table.value.length);
			}
		},
	},
});
