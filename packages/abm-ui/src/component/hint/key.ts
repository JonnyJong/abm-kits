import { asArray } from 'abm-utils';
import { defineElement } from '../../infra/decorator';
import type { DOMContents, ElementProps } from '../../infra/dom';
import { css } from '../../infra/style';
import { KEY_CODE, type KeyCode } from '../../input/keyboard';
import { ico } from '../icon';
import { HintBase } from './base';

declare module '../../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-hint-key': KeyHint;
	}
}

declare module '../icon' {
	interface PresetIcons {
		/** 按键提示：无效 */
		keyInvalid: string;
		/** 按键提示：Tab */
		keyTab: string;
		/** 按键提示：回车 */
		keyEnter: string;
		/** 按键提示：加 */
		keyNumpadAdd: string;
		/** 按键提示：减 */
		keyNumpadSubtract: string;
		/** 按键提示：乘 */
		keyNumpadMultiply: string;
		/** 按键提示：除 */
		keyNumpadDivide: string;
		/** 按键提示：上 */
		keyArrowUp: string;
		/** 按键提示：右 */
		keyArrowRight: string;
		/** 按键提示：下 */
		keyArrowDown: string;
		/** 按键提示：左 */
		keyArrowLeft: string;
		/** 按键提示：空格 */
		keySpace: string;
	}
}

export interface KeyHintProps extends ElementProps<KeyHint> {}

const ICON_KEYS = new Set<KeyCode>([
	'Tab',
	'Enter',
	'NumpadAdd',
	'NumpadSubtract',
	'NumpadMultiply',
	'NumpadDivide',
	'ArrowUp',
	'ArrowRight',
	'ArrowDown',
	'ArrowLeft',
	'Space',
	'Home',
	'Backspace',
]);
const KEY_MAP: { [K in KeyCode]?: string } = {
	Escape: 'ESC',
	ControlLeft: 'L CTRL',
	AltLeft: 'L ALT',
	ControlRight: 'R CTRL',
	AltRight: 'R ALT',
	Backquote: '~',
	NumpadDecimal: '.',
	PageUp: 'PgUp',
	PageDown: 'PgDn',
	Minus: '_',
	Equal: '=',
	BracketLeft: '[',
	BracketRight: ']',
	Backslash: '\\',
	Slash: '/',
	Semicolon: ':',
	Quote: '"',
	Comma: '<',
	Period: '>',
	CapsLock: 'Caps',
};

/**
 * 按键提示
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/hint#keyhint)
 */
@defineElement('abm-hint-key')
export class KeyHint extends HintBase<KeyCode, KeyHintProps> {
	protected static style = css`
		:host {
			display: inline-flex;
			justify-content: center;
			align-items: center;
			gap: .5ex;
			padding-inline: 6px;
			min-inline-size: 28px;
			block-size: 28px;
			border: 1px solid var(--ui-border);
			border-radius: var(--border-radius);
			background: var(--ui-bg);
			white-space: pre;
			font-size: 14px;
		}
	`;
	#root = this.attachShadow({}, ico('ui.keyInvalid'));
	#render(): DOMContents {
		const { key } = this;
		// None
		if (!key) return ico('ui.keyInvalid');
		// Icon Only
		if (ICON_KEYS.has(key)) return ico(`ui.key${key}` as any);
		// Text Only
		if (KEY_MAP[key]) return KEY_MAP[key]!;
		// Shift
		if (key.startsWith('Shift')) return [key[5], ico('ui.keyShift')];
		// Letter
		if (key.startsWith('Key')) return key[3];
		// Digit
		if (key.startsWith('Digit')) return key[5];
		// Numpad
		if (key.startsWith('Numpad')) return `Num${key[6]}`;
		// Other
		return key;
	}
	protected update() {
		this.#root.replaceChildren(...asArray(this.#render()));
	}
	protected validate(key: unknown): key is KeyCode | undefined {
		if (key === undefined) return true;
		return KEY_CODE.has(key as any);
	}
}
