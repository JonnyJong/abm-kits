import { $new, SegmentInput } from 'abm-ui';
import { createArray, range, wrapInRange } from 'abm-utils';

const input = $new(
	SegmentInput,
	{ style: { display: 'flex', gap: 8 }, slidable: true },
	<SegmentInput.Seg />,
	<SegmentInput.Seg />,
	<SegmentInput.Seg />,
	<SegmentInput.Seg />,
	<SegmentInput.Seg />,
	<SegmentInput.Seg />,
);

function handleBlur(input: HTMLInputElement) {
	if (input.value.length === 0) return;
	let num = Number(input.value);
	if (!Number.isFinite(num)) num = 0;
	num = wrapInRange(num, 10);
	input.value = String(num);
}

input.valueFilter = range(10).map(String);
input.handleStep = (input, delta) => {
	let num = Number(input.value);
	if (!Number.isFinite(num)) num = 0;
	num += delta;
	num = wrapInRange(num, 10);
	input.value = String(num);
};
input.handleBlur = handleBlur;
input.handleInput = (input, next) => {
	const { value } = input;
	if (value.length === 0) return;
	handleBlur(input);
	if (input.value === value) next();
};

body.append(input);

function printValue() {
	console.log(input.value);
}

function setValueRandomly() {
	input.value = createArray(6, () => Math.trunc(Math.random() * 10)).map(String);
}

//#region #Reg
__registerControl(input, {
	events: ['input', 'change', 'submit'],
	props: { disabled: 'boolean', invalid: 'boolean' },
	actions: { printValue, setValueRandomly },
});
