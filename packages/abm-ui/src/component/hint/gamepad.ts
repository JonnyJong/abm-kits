import { defineElement, property } from '../../infra/decorator';
import type { ElementProps } from '../../infra/dom';
import { css } from '../../infra/style';
import { getGamepadButtons } from '../../input/game-controller';
import { ico } from '../icon';
import { HintBase } from './base';

declare module '../../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-hint-gamepad': GamepadHint;
	}
}

declare module '../icon' {
	interface PresetIcons {
		/** 按键提示：无效 */
		keyInvalid: string;
		/** 按键提示：主页 */
		keyHome: string;
		/** 按键提示：退格 */
		keyBackspace: string;
		/** 按键提示：上挡 */
		keyShift: string;
		/** 按键提示：返回 */
		keyBack: string;
		/** 按键提示：开始 */
		keyStart: string;
	}
}

export interface GamepadHintProp extends ElementProps<GamepadHint> {}

export type GamepadHintKey = (typeof KEYS)[number];

const KEYS = [...getGamepadButtons(), 'LS', 'RS'] as const;
const ARROW_KEYS = new Set<GamepadHintKey>(['UP', 'RIGHT', 'DOWN', 'LEFT']);
const ICON_KEYS = new Set<GamepadHintKey>([
	'BACK',
	'START',
	'HOME',
	...ARROW_KEYS,
]);

/**
 * 游戏手柄提示
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/hint#gamepadhint)
 */
@defineElement('abm-hint-gamepad')
export class GamepadHint extends HintBase<GamepadHintKey, GamepadHintProp> {
	protected static style = css`
		:host {
			position: relative;
			display: inline-flex;
			justify-content: center;
			align-items: center;
			width: 28px;
			height: 28px;
			border: 2px solid;
			border-radius: 50%;
		}
		:host([key="A"]) { color: var(--gamepad-a) }
		:host([key="B"]) { color: var(--gamepad-b) }
		:host([key="X"]) { color: var(--gamepad-x) }
		:host([key="Y"]) { color: var(--gamepad-y) }
		:host(:is([key="LB"], [key="RB"], [key="LT"], [key="RT"])) { border-radius: var(--border-radius) }
		:host([key="LT"]) { border-bottom-left-radius: 50% }
		:host([key="RT"]) { border-bottom-right-radius: 50% }
		:host(:is([key="LSB"], [key="RSB"])) {
			background: var(--primary);
			color: var(--primary-fg);
			border-color: var(--fg);
			font-weight: bold;
		}
	`;
	#root = this.attachShadow({}, ico('ui.keyInvalid'));
	#render(): Node | string {
		const { key } = this;
		if (!key) return ico('ui.keyInvalid');
		if (key[1] === 'S') return key[0];
		if (!ICON_KEYS.has(key)) return key;
		let name = key[0] + key.slice(1).toLowerCase();
		if (ARROW_KEYS.has(key)) name = `Arrow${name}`;
		return ico(`ui.key${name}` as any);
	}
	protected update() {
		this.#root.replaceChildren(this.#render());
	}
	@property({ reflect: true })
	get key() {
		return super.key;
	}
	set key(value) {
		if (value !== undefined && !KEYS.includes(value!)) return;
		super.key = value;
	}
}

// TODO：优化游戏手柄提示外观
