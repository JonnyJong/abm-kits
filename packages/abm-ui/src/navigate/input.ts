import {
	type Direction8,
	RepeatingTriggerController,
	type Vec2,
} from 'abm-utils';
import { CONSTANTS } from '../constant';
import { $on } from '../infra/event';
import {
	GameController,
	type GameControllerButton,
} from '../input/game-controller';
import { keyboard } from '../input/keyboard';
import { state } from '../state';
import { back, blur, emit, moveRect, nav } from './core';
import { getCurrent, getCurrentLayer, getLock } from './layer';
import type { Navigable } from './types';

export const inputConfig = {
	keyboardDisabled: false,
	controllerDisabled: false,
	controller: GameController.get(0),
	ls: true,
	rs: false,
	active: ['A'] as GameControllerButton[],
	cancel: ['B'] as GameControllerButton[],
	up: ['UP'] as GameControllerButton[],
	right: ['RIGHT'] as GameControllerButton[],
	down: ['DOWN'] as GameControllerButton[],
	left: ['LEFT'] as GameControllerButton[],
};

function isGamepadAvailable() {
	if (!document.hasFocus()) return false;
	if (document.activeElement?.tagName === 'IFRAME') return false;
	return true;
}

function isKeyActivated(id: string): boolean {
	if (inputConfig.keyboardDisabled) return false;
	if (keyboard.isInputMode()) return false;
	return keyboard.alias.isActivated(id) || keyboard.shortcut.isActivated(id);
}

function isButtonActivated(buttons: GameControllerButton[]): boolean {
	if (inputConfig.controllerDisabled) return false;
	if (!isGamepadAvailable()) return false;
	for (const button of buttons) {
		if (inputConfig.controller.button(button)) return true;
	}
	return false;
}

function isActivated(id: string, buttons: GameControllerButton[]): boolean {
	return isKeyActivated(id) || isButtonActivated(buttons);
}

const direction8Trigger = new RepeatingTriggerController(() => {
	const up = isActivated(CONSTANTS.NAV_UP, inputConfig.up);
	const right = isActivated(CONSTANTS.NAV_RIGHT, inputConfig.right);
	const down = isActivated(CONSTANTS.NAV_DOWN, inputConfig.down);
	const left = isActivated(CONSTANTS.NAV_LEFT, inputConfig.left);
	const active = up || right || down || left;
	if (!active) return direction8Trigger.stop();
	const direction: Vec2 = [0, 0];
	if (up) direction[1]--;
	if (right) direction[0]++;
	if (down) direction[1]++;
	if (left) direction[0]--;
	nav(direction);
});

function handleActive(down: boolean): void {
	emit({ type: 'active', down });
	if (getLock()) return;
	const target = getCurrent();
	if (!target) return;
	state.active.set(target, down);
}

let prevRoot: WeakRef<Navigable> | undefined;
let prevCurrent: WeakRef<Navigable> | undefined;
function handleCancel(down: boolean): void {
	// Save state when press down cancel
	if (down) {
		const { root, current } = getCurrentLayer();
		prevRoot = new WeakRef(root);
		prevCurrent = current ? new WeakRef(current) : undefined;
	}

	// Emit cancel
	emit({ type: 'cancel', down });
	if (getLock()) return;
	const { root, current } = getCurrentLayer();
	if (current) state.active.set(current, false, true);

	// Check root and current then back
	if (down) return;
	if (root !== prevRoot?.deref()) return;
	if (current !== prevCurrent?.deref()) return;
	back();
}

//#region Pointer
function pointerMoveHandler({ x, y }: PointerEvent) {
	blur();
	moveRect(x, y);
}

//#region Keyboard

function keyboardHandler(id: string): any {
	if (inputConfig.keyboardDisabled) return;
	switch (id) {
		case 'ui.nav.prev':
			return nav('prev');
		case 'ui.nav.next':
			return nav('next');
		case 'ui.nav.up':
		case 'ui.nav.right':
		case 'ui.nav.down':
		case 'ui.nav.left':
			// TODO: 需要更好的处理方式
			if (keyboard.isInputMode()) return;
			direction8Trigger.restart();
	}
}

function keyDownHandler(id: string) {
	if (inputConfig.keyboardDisabled) return;
	if (id === CONSTANTS.NAV_ACTIVE) handleActive(true);
	else if (id === CONSTANTS.NAV_CANCEL) handleCancel(true);
}
function keyUpHandler(id: string) {
	if (inputConfig.keyboardDisabled) return;
	if (id === CONSTANTS.NAV_ACTIVE) handleActive(false);
	else if (id === CONSTANTS.NAV_CANCEL) handleCancel(false);
}

//#region Gamepad

function lsHandler(direction: Direction8, x: number, y: number): any {
	if (inputConfig.controllerDisabled) return;
	if (!inputConfig.ls) return;
	if (!isGamepadAvailable()) return;
	if (!getLock()) return nav(direction);
	emit({ type: 'stick', x, y });
}
function rsHandler(direction: Direction8, x: number, y: number): any {
	if (inputConfig.controllerDisabled) return;
	if (!inputConfig.rs) return;
	if (!isGamepadAvailable()) return;
	if (!getLock()) return nav(direction);
	emit({ type: 'stick', x, y });
}

function buttonHandler() {
	if (inputConfig.controllerDisabled) return;
	direction8Trigger.restart();
}
function buttonDownHandler(btn: GameControllerButton) {
	if (inputConfig.controllerDisabled) return;
	if (inputConfig.active.includes(btn)) handleActive(true);
	else if (inputConfig.cancel.includes(btn)) handleCancel(true);
}
function buttonUpHandler(btn: GameControllerButton) {
	if (inputConfig.controllerDisabled) return;
	if (inputConfig.active.includes(btn)) handleActive(false);
	else if (inputConfig.cancel.includes(btn)) handleCancel(false);
}

export function bindController() {
	inputConfig.controller.on('lsTrigger', lsHandler);
	inputConfig.controller.on('rsTrigger', rsHandler);
	inputConfig.controller.on('trigger', buttonHandler);
	inputConfig.controller.on('down', buttonDownHandler);
	inputConfig.controller.on('up', buttonUpHandler);
}
export function unbindController() {
	inputConfig.controller.off('lsTrigger', lsHandler);
	inputConfig.controller.off('rsTrigger', rsHandler);
	inputConfig.controller.off('trigger', buttonHandler);
	inputConfig.controller.off('down', buttonDownHandler);
	inputConfig.controller.off('up', buttonUpHandler);
}

//#region Main
export function initInput() {
	$on(window, 'pointermove', pointerMoveHandler, { passive: true });
	keyboard.on('shortcutTrigger', keyboardHandler);
	keyboard.on('aliasTrigger', keyboardHandler);
	keyboard.on('aliasDown', keyDownHandler);
	keyboard.on('aliasUp', keyUpHandler);
	bindController();
}
