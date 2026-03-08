import { $new, Button, Icon, toast } from 'abm-ui';
import { normalizeError, sleep } from 'abm-utils';
import Checkmark from '../../../node_modules/@fluentui/svg-icons/icons/checkmark_20_regular.svg';
import ErrorCircle from '../../../node_modules/@fluentui/svg-icons/icons/error_circle_20_regular.svg';

const createNormalToast = $new(Button, {}, 'Create Normal Toast');
createNormalToast.on('active', () => toast('Hello world'));

const createSuccessToast = $new(Button, {}, 'Create Success Toast');
createSuccessToast.on('active', () => toast.success('Success'));

const createWarnToast = $new(Button, {}, 'Create Warning Toast');
createWarnToast.on('active', () => toast.success('Warning'));

const createErrToast = $new(Button, {}, 'Create Error Toast');
createErrToast.on('active', () => toast.success('Error'));

const createPromiseToast = $new(Button, {}, 'Create Promise Toast');
createPromiseToast.on('active', () =>
	toast.promise(
		sleep(1000).then(() => {
			const num = Math.random();
			if (num < 0.5) throw new Error('Error thrown!');
			return num;
		}),
		{
			loading: 'Loading...',
			success: (result) => ({
				title: `Success! Got ${result}.`,
				icon: Icon.svg(Checkmark),
				level: 'success',
			}),
			error: (reason) => ({
				title: `Error: ${normalizeError(reason).message}`,
				icon: Icon.svg(ErrorCircle),
				level: 'error',
			}),
		},
	),
);

body.append(
	createNormalToast,
	createSuccessToast,
	createWarnToast,
	createErrToast,
	createPromiseToast,
);
