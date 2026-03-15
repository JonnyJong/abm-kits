import { $new, DatetimePicker } from 'abm-ui';

const picker = $new(DatetimePicker);
body.append(picker);

function toDateTimePicker() {
	picker.intlOptions = { dateStyle: 'short', timeStyle: 'short' };
	picker.locale = picker.locale as string;
}

function toTimePicker() {
	picker.intlOptions = { timeStyle: 'short' };
	picker.locale = picker.locale as string;
}

function toDatePicker() {
	picker.intlOptions = { dateStyle: 'short' };
	picker.locale = picker.locale as string;
}

function localeAuto() {
	picker.locale = undefined;
}

function localeEN() {
	picker.locale = 'en';
}

function localeZH() {
	picker.locale = 'zh';
}

//#region #Reg
__registerControl(picker, {
	events: ['input', 'change', 'submit'],
	props: { disabled: 'boolean', invalid: 'boolean' },
	actions: {
		toDateTimePicker,
		toTimePicker,
		toDatePicker,
		localeAuto,
		localeEN,
		localeZH,
	},
});
