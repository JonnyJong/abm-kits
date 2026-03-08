import { $new, Progress } from 'abm-ui';

const progress = $new(Progress);

body.append(progress);

//#region #Reg
__registerControl(progress, {
	props: { value: { type: 'number', min: 0, max: 100, default: NaN } },
});
