import {
	EventBase,
	EventValue,
	Events,
	RepeatingTriggerController,
} from 'abm-utils';
import { GameController } from '../game-controller';
import { keyboard } from '../keyboard';
import {
	INavigate,
	Navigable,
	NavigateCallbackOptions,
	NavigateEvents,
	NavigateEventsInit,
} from './types';
import { NavigateUI } from './view';

const KEY_ALIAS_DIRECTION_MAP = {
	'ui.up': 'up',
	'ui.right': 'right',
	'ui.down': 'down',
	'ui.left': 'left',
};

const GAME_CONTROLLER_SWITCH_DEAD_ZONE = 0.3;

interface NavigateInputInit {
	navigate: INavigate;
	events: Events<NavigateEventsInit>;
	ui: NavigateUI;
	getCurrentLayer(): { root: Navigable; current: Navigable | null };
	clearCurrent(): void;
	callback(options: NavigateCallbackOptions, target?: Navigable | null): void;
}

export function initInput({
	navigate,
	events,
	ui,
	getCurrentLayer: getTarget,
	clearCurrent,
	callback,
}: NavigateInputInit) {
	const upController = new RepeatingTriggerController(() => navigate.nav('up'));
	const rightController = new RepeatingTriggerController(() =>
		navigate.nav('right'),
	);
	const downController = new RepeatingTriggerController(() =>
		navigate.nav('down'),
	);
	const leftController = new RepeatingTriggerController(() =>
		navigate.nav('left'),
	);
	//#region Keyboard
	keyboard.on('aliasTrigger', (event) => {
		if (navigate.blockKeyboard) return;
		const direction = (KEY_ALIAS_DIRECTION_MAP as any)[event.key];
		if (!direction) return;
		navigate.nav(direction);
	});
	keyboard.on('shortcutTrigger', (event) => {
		if (navigate.blockKeyboard) return;
		if (event.key === 'ui.navPrev') navigate.nav('prev');
		else if (event.key === 'ui.navNext') navigate.nav('next');
	});
	keyboard.on('aliasDown', (event) => {
		const { root, current } = getTarget();
		let type: 'active' | 'cancel' | '' = '';
		if (event.key === 'ui.confirm') type = 'active';
		if (event.key === 'ui.cancel') type = 'cancel';
		if (!type) return;
		callback({ [type]: true }, root);
		if (!current) return;
		callback({ [type]: true });
		if (navigate.locking) return;
		events.emit(new EventValue(type, { target: navigate, value: true }));
	});
	keyboard.on('aliasUp', (event) => {
		const { root, current } = getTarget();
		let type: keyof NavigateEvents | '' = '';
		if (event.key === 'ui.confirm') type = 'active';
		if (event.key === 'ui.cancel') type = 'cancel';
		if (!type) return;
		callback({ [type]: false }, root);
		if (!current) return;
		callback({ [type]: false });
		if (navigate.locking) return;
		events.emit(new EventValue(type, { target: navigate, value: false }));
	});
	//#region Gamepad
	const gameController = GameController.getInstance(0);
	gameController.on('ls', () => {
		const vec = gameController.ls;
		let direction = vec.direction;
		if (vec.length < GAME_CONTROLLER_SWITCH_DEAD_ZONE) direction = undefined;
		upController[direction === 'up' ? 'start' : 'stop']();
		rightController[direction === 'right' ? 'start' : 'stop']();
		downController[direction === 'down' ? 'start' : 'stop']();
		leftController[direction === 'left' ? 'start' : 'stop']();
	});
	gameController.on('arrow', () => {
		upController[gameController.up ? 'start' : 'stop']();
		rightController[gameController.right ? 'start' : 'stop']();
		downController[gameController.down ? 'start' : 'stop']();
		leftController[gameController.left ? 'start' : 'stop']();
	});
	gameController.on('a', () => {
		const { root, current } = getTarget();
		callback({ active: gameController.a }, root);
		if (!current) return;
		callback({ active: gameController.a });
		if (navigate.locking) return;
		events.emit(
			new EventValue('active', { target: navigate, value: gameController.a }),
		);
	});
	gameController.on('b', () => {
		const { root, current } = getTarget();
		callback({ cancel: gameController.b }, root);
		if (!current) return;
		callback({ cancel: gameController.b });
		if (navigate.locking) return;
		events.emit(
			new EventValue('cancel', { target: navigate, value: gameController.b }),
		);
	});
	//#region Other
	const stopNavHandler = (event: MouseEvent) => {
		const { current } = getTarget();
		if (current && navigate.locking) callback({ active: false, cancel: true });

		ui.hide(event.x, event.y);

		if (current === null) return;
		clearCurrent();
		events.emit(new EventBase('nav', { target: navigate }));
	};
	addEventListener('wheel', stopNavHandler);
	addEventListener('pointermove', stopNavHandler);
}
