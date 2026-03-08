import { $new, Button, Dialog, type DialogInit, Form, t } from 'abm-ui';
import { sleep } from 'abm-utils';

const form = $new(Form<DialogInit>);

const createNormalDialog = $new(Button, {}, 'Create & Open Dialog');
createNormalDialog.on('active', () => {
	const options = form.value;
	console.log(options);
	const cancel = $new(Button, {}, t('ui.cancel'));
	const confirm = $new(Button, { variant: 'primary' }, t('ui.confirm'));
	const dialog = new Dialog({
		...options,
		actions: [cancel, confirm],
		onClose: () => console.log('onClose'),
	});
	dialog.open();
	cancel.on('active', () => {
		console.log('cancel');
		dialog.close();
	});
	confirm.on('active', () => {
		console.log('confirm');
		dialog.close();
	});
});

const createConfirmDialog = $new(Button, {}, 'Create Confirm Dialog');
createConfirmDialog.on('active', async () => {
	const options = form.value;
	console.log(options);
	console.log(await Dialog.confirm(options));
});

const createAlertDialog = $new(Button, {}, 'Create Alert Dialog');
createAlertDialog.on('active', async () => {
	const options = form.value;
	console.log(options);
	console.log(await Dialog.alert(options));
});

const createOverlayDialog = $new(Button, {}, 'Create Overlay Dialog');
createOverlayDialog.on('active', async () => {
	const options = form.value;
	console.log(options);
	const dialog = Dialog.overlay(options);
	await sleep(3000);
	dialog.close();
});

//#region #Reg

import {
	$style,
	Checkbox,
	FormField,
	Icon,
	type IconDict,
	type IconPackageDefine,
	ico,
	Label,
	Select,
	type SelectOption,
	TextArea,
	TextBox,
} from 'abm-ui';
import Delete from '../../../node_modules/@fluentui/svg-icons/icons/delete_20_regular.svg';
import Home from '../../../node_modules/@fluentui/svg-icons/icons/home_20_regular.svg';

declare module 'abm-ui' {
	interface IconRegistry extends IconPackageDefine<typeof ICONS> {}
}

const ICONS = { Home, Delete } as const satisfies IconDict;

Icon.register(ICONS);

const ICON_OPTIONS: SelectOption<Node | undefined>[] = [
	{ label: 'None', value: undefined },
	...Object.keys(ICONS).map((key) => ({ label: key, value: ico(key as any) })),
];

const FIELD_STYLE = { display: 'flex', alignItems: 'center', gap: 8 };

form.append(
	<>
		<FormField name="icon" style={FIELD_STYLE}>
			<Label>icon</Label>
			<Select options={ICON_OPTIONS} />
		</FormField>
		<FormField name="title" style={FIELD_STYLE}>
			<Label>title</Label>
			<TextBox value="Hello world" />
		</FormField>
		<FormField name="content">
			<Label>content</Label>
			<TextArea style="min-height: 100px;" />
		</FormField>
		<FormField name="hideCloseButton" style={FIELD_STYLE}>
			<Label>hideCloseButton</Label>
			<Checkbox />
		</FormField>
		<FormField name="disableClickOutside" style={FIELD_STYLE}>
			<Label>disableClickOutside</Label>
			<Checkbox />
		</FormField>
		<FormField name="disableGlobalBackClose" style={FIELD_STYLE}>
			<Label>disableGlobalBackClose</Label>
			<Checkbox />
		</FormField>
		<FormField name="layout" style={FIELD_STYLE}>
			<Label>layout</Label>
			<Select
				options={[
					{ label: 'horizontal', value: 'horizontal' },
					{ label: 'vertical', value: 'vertical' },
				]}
				value="horizontal"
			/>
		</FormField>
		<FormField name="actionsLayout" style={FIELD_STYLE}>
			<Label>actionsLayout</Label>
			<Select
				options={[
					{ label: 'horizontal', value: 'horizontal' },
					{ label: 'horizontal-full', value: 'horizontal-full' },
					{ label: 'vertical', value: 'vertical' },
				]}
				value="horizontal"
			/>
		</FormField>
	</>,
);
$style(form, {
	display: 'flex',
	flexDirection: 'column',
	gap: '8px',
});
$style(createNormalDialog, { marginTop: '16px' });
$style(createConfirmDialog, { marginTop: '16px' });
$style(createAlertDialog, { marginTop: '16px' });
$style(createOverlayDialog, { marginTop: '16px' });
body.append(
	form,
	createNormalDialog,
	createConfirmDialog,
	createAlertDialog,
	createOverlayDialog,
);
body.style.display = 'block';
