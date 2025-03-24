import { $div, $new, DOMContents, asArray, callTask } from 'abm-utils';
import { customElement } from 'lit/decorators.js';
import { GameController, GameControllerEvents } from '../../../game-controller';
import { Widget } from '../base';

//#region Define
export interface WidgetHintProp {
	mouse?: DOMContents;
	gamepad?: DOMContents;
	touch?: DOMContents;
	pen?: DOMContents;
}

type OperateType = 'mouse' | 'gamepad' | 'touch' | 'pen';

const FALLBACK_MAP: Record<OperateType, OperateType[]> = {
	mouse: ['mouse', 'pen', 'touch', 'gamepad'],
	gamepad: ['gamepad', 'mouse', 'pen', 'touch'],
	touch: ['touch', 'pen', 'mouse', 'gamepad'],
	pen: ['pen', 'mouse', 'touch', 'gamepad'],
};

let slot: OperateType = 'mouse';
const hints = new Set<WidgetHint>();

//#region Switch
const useGamepad = () => update('gamepad');
const gamepad = GameController.getInstance(0);
gamepad.on('connectivity', () => {
	if (gamepad.connecting) useGamepad();
	else update('mouse');
});
const GAMEPAD_EVENTS: (keyof GameControllerEvents)[] = [
	'arrow',
	'a',
	'b',
	'x',
	'y',
	'home',
	'start',
	'back',
	'lsb',
	'rsb',
	'ls',
	'rs',
	'lb',
	'rb',
];
for (const name of GAMEPAD_EVENTS) {
	gamepad.on(name, useGamepad);
}

addEventListener('keydown', () => update('mouse'));

const POINTER_EVENTS: ['pointerdown', 'pointermove'] = [
	'pointerdown',
	'pointermove',
];
for (const name of POINTER_EVENTS) {
	addEventListener(name, (event: PointerEvent) =>
		update(event.pointerType as OperateType),
	);
}

function update(value: OperateType) {
	if (value === slot) return;
	slot = value;
	for (const hint of hints) {
		callTask(hint.updateView, hint);
	}
}

//#region Widget
@customElement('w-hint')
export class WidgetHint extends Widget {
	#root = this.createRenderRoot();
	#slot = $new('slot', { attr: { name: 'mouse' } });
	constructor() {
		super();
		this.#root.append(this.#slot);
	}
	connectedCallback(): void {
		super.connectedCallback();
		this.updateView();
		hints.add(this);
	}
	disconnectedCallback(): void {
		super.disconnectedCallback();
		hints.delete(this);
	}
	updateView() {
		let target: OperateType | null = null;
		for (const name of FALLBACK_MAP[slot]) {
			if (!this[name]) continue;
			target = name;
			break;
		}
		if (!target) return;
		this.#slot.name = target;
	}
	#getSlot(type: OperateType) {
		let slot = this.querySelector(`[slot="${type}"]`);
		if (!slot) {
			slot = $div({ attr: { slot: type } });
			this.append(slot);
		}
		return slot;
	}
	get mouse(): HTMLElement | null {
		return this.querySelector('[slot="mouse"]');
	}
	set mouse(value: DOMContents) {
		this.#getSlot('mouse').replaceChildren(...asArray(value));
	}
	get gamepad(): HTMLElement | null {
		return this.querySelector('[slot="gamepad"]');
	}
	set gamepad(value: DOMContents) {
		this.#getSlot('gamepad').replaceChildren(...asArray(value));
	}
	get touch(): HTMLElement | null {
		return this.querySelector('[slot="touch"]');
	}
	set touch(value: DOMContents) {
		this.#getSlot('touch').replaceChildren(...asArray(value));
	}
	get pen(): HTMLElement | null {
		return this.querySelector('[slot="pen"]');
	}
	set pen(value: DOMContents) {
		this.#getSlot('pen').replaceChildren(...asArray(value));
	}
}
