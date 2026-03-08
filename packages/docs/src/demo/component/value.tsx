import { $new, Form, Value } from 'abm-ui';

const value = $new(Value<number>, { name: 'value', value: 0, default: 0 });
const form = $new(Form, {}, value);

function printValue() {
	console.log(form.value);
}

body.append(form);

//#region #Reg
__registerControl(value, {
	props: {
		name: 'string',
		value: 'number',
		default: 'number',
	},
	actions: {
		printValue,
		reset: () => value.reset(),
	},
});
