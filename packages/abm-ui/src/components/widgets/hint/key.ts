import { $new, css } from 'abm-utils';
import CSS from 'hint-key.style';
import { customElement, property } from 'lit/decorators.js';
import { UIDefaultsIcons, configs } from '../../../configs';
import { KEYS_ALLOW, KeysAllow } from '../../../keyboard';
import { Widget } from '../base';
import { WidgetIcon } from '../icon';

export interface WidgetHintKeyProp {
	key?: KeysAllow;
}

const ICON_KEYS = [
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
];
const KEY_MAP: Record<string, string> = {
	Escape: 'ESC',
	ControlLeft: 'L CTRL',
	AltLeft: 'L ALT',
	ControlRight: 'R CTRL',
	AltRight: 'R ALT',
	Backquote: '~',
	Digit0: '0',
	Digit1: '1',
	Digit2: '2',
	Digit3: '3',
	Digit4: '4',
	Digit5: '5',
	Digit6: '6',
	Digit7: '7',
	Digit8: '8',
	Digit9: '9',
	Numpad0: 'Num0',
	Numpad1: 'Num1',
	Numpad2: 'Num2',
	Numpad3: 'Num3',
	Numpad4: 'Num4',
	Numpad5: 'Num5',
	Numpad6: 'Num6',
	Numpad7: 'Num7',
	Numpad8: 'Num8',
	Numpad9: 'Num9',
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

@customElement('w-hint-key')
export class WidgetHintKey extends Widget<WidgetHintKeyProp> {
	static styles = css(CSS);
	#initialized = false;
	#root = this.createRenderRoot();
	connectedCallback(): void {
		super.connectedCallback();
		if (this.#initialized) return;
		this.#initialized = true;
		this.key = this.textContent?.trim() as KeysAllow;
	}
	#icon?: UIDefaultsIcons;
	#key?: KeysAllow;
	@property({ type: String })
	get key() {
		return this.#key;
	}
	set key(value) {
		if (this.#key === value) return;
		this.#initialized = true;

		this.#unbind();

		if (!value) this.#key = undefined;
		else if (!KEYS_ALLOW.includes(value)) return;

		this.#key = value;

		this.#render();
		this.#bind();
		this.#iconUpdateHandler();
	}
	#bind() {
		if (!this.#icon) return;
		configs.icon.on(this.#icon, this.#iconUpdateHandler);
	}
	#unbind() {
		if (!this.#icon) return;
		configs.icon.off(this.#icon, this.#iconUpdateHandler);
	}
	#render() {
		// Clean
		if (!this.#key) {
			this.#root.replaceChildren($new('w-icon'));
			this.#icon = 'keyDisallow';
			return;
		}
		this.#icon = undefined;
		// Icon
		if (ICON_KEYS.includes(this.#key)) {
			this.#root.replaceChildren($new('w-icon'));
			this.#icon = `key${this.#key}` as UIDefaultsIcons;
			return;
		}
		// Text
		if (KEY_MAP[this.#key]) {
			this.#root.replaceChildren(KEY_MAP[this.#key]);
			return;
		}
		// Shift
		if (this.#key.startsWith('Shift')) {
			this.#root.replaceChildren(`${this.#key[5]} `, $new('w-icon'));
			this.#icon = 'keyShift';
			return;
		}
		// Normal Key
		if (this.#key.startsWith('Key')) {
			this.#root.replaceChildren(this.#key[3]);
			return;
		}
		// Other
		this.#root.replaceChildren(this.#key);
	}
	#iconUpdateHandler = () => {
		if (!this.#icon) return;
		const icon = [...this.#root.children].at(-1);
		if (!(icon instanceof WidgetIcon)) return;
		icon.key = configs.icon.defaults[this.#icon];
	};
	cloneNode(deep?: boolean): WidgetHintKey {
		const node = super.cloneNode(deep) as WidgetHintKey;

		node.key = this.key;

		return node;
	}
}
