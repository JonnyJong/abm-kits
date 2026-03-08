import { $new, Button, Flyout } from 'abm-ui';

function close() {
	console.log('close');
	flyout.close();
}

const openNormalFlyout = $new(Button, {}, 'Open Flyout');
const flyout = new Flyout(openNormalFlyout, {
	content: ['Hello world', <Button $active={close}>Close</Button>],
	onClose: () => console.log('onClose'),
});
openNormalFlyout.on('active', () => flyout.open());

const openConfirmFlyout = $new(Button, {}, 'Open Confirm Flyout');
openConfirmFlyout.on('active', async () => {
	const result = await Flyout.confirm(openConfirmFlyout, {
		content: ['Are you sure?'],
	});
	console.log(result);
});

const openAlertFlyout = $new(Button, {}, 'Open Alert Flyout');
openAlertFlyout.on('active', async () => {
	const result = await Flyout.alert(openAlertFlyout, {
		content: ['Warning!'],
	});
	console.log(result);
});

//#region #Reg

body.append(openNormalFlyout, openConfirmFlyout, openAlertFlyout);
