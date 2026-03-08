import { Label, Radio, RadioGroup } from 'abm-ui';

const radioGroup = (
	<RadioGroup style="display: flex; flex-direction: column;">
		<Label for="radio-0">
			<Radio value={0} id="radio-0" />
			选项0
		</Label>
		<Label for="radio-1">
			<Radio value={1} id="radio-1" />
			选项1
		</Label>
		<Label for="radio-2">
			<Radio value={2} id="radio-2" />
			选项2
		</Label>
	</RadioGroup>
) as RadioGroup<number>;

radioGroup.on('change', (value) => {
	console.log(value);
});

body.append(radioGroup);

//#region #Reg
__registerControl(radioGroup, {
	events: ['change'],
	props: {
		value: [undefined, 0, 1, 2],
	},
});
