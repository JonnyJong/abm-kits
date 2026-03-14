import { asArray, callTask } from 'abm-utils';
import { defineElement } from '../../infra/decorator';
import {
	$,
	$$,
	$new,
	$part,
	$slot,
	type DOMContents,
	type ElementProps,
} from '../../infra/dom';
import { $on } from '../../infra/event';
import {
	GameController,
	type GameControllerEventMap,
} from '../../input/game-controller';
import { navigate } from '../../navigate/index';
import { Component } from '../base';

declare module '../../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-hint': Hint;
	}
}

type OperateType = 'mouse' | 'gamepad' | 'touch' | 'pen';

const FALLBACK_MAP: Record<OperateType, OperateType[]> = {
	mouse: ['mouse', 'pen', 'touch', 'gamepad'],
	gamepad: ['gamepad', 'mouse', 'pen', 'touch'],
	touch: ['touch', 'pen', 'mouse', 'gamepad'],
	pen: ['pen', 'mouse', 'touch', 'gamepad'],
};

let slot: OperateType = 'mouse';
const hints = new Set<Hint>();

//#region Switch

let gamepad: GameController;
const GAMEPAD_EVENTS: (keyof GameControllerEventMap)[] = ['down', 'ls', 'rs'];
const useGamepad = () => update('gamepad');
function setupGamepad() {
	gamepad = GameController.get(navigate.gameController.index);
	for (const event of GAMEPAD_EVENTS) gamepad.on(event, useGamepad);
}
setupGamepad();
$on(window, '__ABM_NAV:gamepad', () => {
	for (const event of GAMEPAD_EVENTS) gamepad.off(event, useGamepad);
	setupGamepad();
});

$on(window, 'keydown', () => {
	if (slot === 'pen') return;
	update('mouse');
});

for (const event of ['pointerdown', 'pointermove'] as const) {
	$on(window, event, (event) => update(event.pointerType as OperateType));
}

function update(type: OperateType) {
	if (type === slot) return;
	slot = type;
	for (const hint of hints) callTask(hint.update, hint);
}

//#region Hint

export interface HintProps extends ElementProps<Hint> {}

/**
 * 操作提示
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/hint#hint)
 */
@defineElement('abm-hint')
export class Hint extends Component<HintProps> {
	#slot = $slot(slot);
	constructor(_props?: HintProps) {
		super();
		this.attachShadow({}, this.#slot);
		new MutationObserver(() => this.update()).observe(this, { childList: true });
	}
	protected connectedCallback(): void {
		super.connectedCallback();
		hints.add(this);
	}
	protected disconnectedCallback(): void {
		super.disconnectedCallback();
		hints.delete(this);
	}
	update(): void {
		let target: OperateType | null = null;
		for (const name of FALLBACK_MAP[slot]) {
			if (!$(`:scope>[slot="${name}"]`, this)) continue;
			target = name;
			break;
		}
		if (!target) return;
		this.#slot.name = target;
	}
	#getSlot(type: OperateType): HTMLElement[] {
		return $$(`:scope>[slot="${type}"]`, this);
	}
	#setSlot(type: OperateType, content: DOMContents) {
		for (const node of this.#getSlot(type)) node.remove();
		const nodes = asArray(content)
			.map((node) => (node instanceof Element ? node : $new('span', {}, node)))
			.map((node) => {
				node.slot = type;
				return node;
			});
		this.append(...nodes);
	}
	get mouse(): HTMLElement[] {
		return this.#getSlot('mouse');
	}
	set mouse(content: DOMContents) {
		this.#setSlot('mouse', content);
	}
	get gamepad(): HTMLElement[] {
		return this.#getSlot('gamepad');
	}
	set gamepad(content: DOMContents) {
		this.#setSlot('gamepad', content);
	}
	get touch(): HTMLElement[] {
		return this.#getSlot('touch');
	}
	set touch(content: DOMContents) {
		this.#setSlot('touch', content);
	}
	get pen(): HTMLElement[] {
		return this.#getSlot('pen');
	}
	set pen(content: DOMContents) {
		this.#setSlot('pen', content);
	}
	/** `slot="mouse"` */
	static readonly Mouse = $part('mouse');
	/** `slot="gamepad" */
	static readonly Gamepad = $part('gamepad');
	/** `slot="touch"` */
	static readonly Touch = $part('touch');
	/** `slot="pen"` */
	static readonly Pen = $part('pen');
}
