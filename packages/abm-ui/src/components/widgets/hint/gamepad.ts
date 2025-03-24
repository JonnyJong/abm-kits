import { $div, $new, css } from 'abm-utils';
import CSS from 'hint-gamepad.style';
import { customElement, property } from 'lit/decorators.js';
import { UIDefaultsIcons, configs } from '../../../configs';
import { Widget } from '../base';
import { WidgetIcon } from '../icon';

export type WidgetHintGamepadKey =
	| 'Home'
	| 'Back'
	| 'Start'
	| 'A'
	| 'B'
	| 'X'
	| 'Y'
	| 'LB'
	| 'RB'
	| 'LT'
	| 'RT'
	| 'LSB'
	| 'RSB'
	| 'Up'
	| 'Right'
	| 'Down'
	| 'Left'
	| 'LS'
	| 'RS';

export interface WidgetHintGamepadProp {
	key?: WidgetHintGamepadKey;
}

const KEYS: WidgetHintGamepadKey[] = [
	'Home',
	'Back',
	'Start',
	'A',
	'B',
	'X',
	'Y',
	'LB',
	'RB',
	'LT',
	'RT',
	'LSB',
	'RSB',
	'Up',
	'Right',
	'Down',
	'Left',
	'LS',
	'RS',
];

const ABXY = ['A', 'B', 'X', 'Y'];
const ARROW = ['Up', 'Right', 'Down', 'Left'];

@customElement('w-hint-gamepad')
export class WidgetHintGamepad extends Widget<WidgetHintGamepadProp> {
	static styles = css(CSS);
	#initialized = false;
	#root = this.createRenderRoot();
	connectedCallback(): void {
		super.connectedCallback();
		if (this.#initialized) return;
		this.#initialized = true;
		this.key = this.textContent?.trim() as WidgetHintGamepadKey;
	}
	#icon?: UIDefaultsIcons;
	#key?: WidgetHintGamepadKey;
	@property({ type: String })
	get key() {
		return this.#key;
	}
	set key(value) {
		if (this.#key === value) return;
		this.#initialized = true;

		this.#unbind();

		if (!value) this.#key = undefined;
		else if (!KEYS.includes(value)) return;

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
		this.setAttribute('w-hint-gamepad', this.#key.toLowerCase());
		// ABXY
		if (ABXY.includes(this.#key)) {
			this.#root.replaceChildren(this.#key);
			return;
		}
		// Arrow
		if (ARROW.includes(this.#key)) {
			this.#root.replaceChildren($new('w-icon'));
			this.#icon = this.#key.toLowerCase() as UIDefaultsIcons;
			return;
		}
		// Home
		if (this.#key === 'Home') {
			this.#root.replaceChildren($new('w-icon'));
			this.#icon = 'keyHome';
			return;
		}
		// Start
		if (this.#key === 'Start') {
			this.#root.replaceChildren($new('w-icon'));
			this.#icon = 'gamepadStart';
			return;
		}
		// Back
		if (this.#key === 'Back') {
			this.#root.replaceChildren($new('w-icon'));
			this.#icon = 'gamepadBack';
			return;
		}
		// Other
		if (['LS', 'RS'].includes(this.#key)) {
			this.#root.replaceChildren(this.#key[0]);
			return;
		}
		if (['LSB', 'RSB'].includes(this.#key)) {
			this.#root.replaceChildren(this.#key[0], $div({ class: 'press' }));
			return;
		}
		this.#root.replaceChildren(this.#key);
	}
	#iconUpdateHandler = () => {
		if (!this.#icon) return;
		const icon = this.#root.children[0];
		if (!(icon instanceof WidgetIcon)) return;
		icon.key = configs.icon.defaults[this.#icon];
	};
	cloneNode(deep?: boolean): WidgetHintGamepad {
		const node = super.cloneNode(deep) as WidgetHintGamepad;

		node.key = this.key;

		return node;
	}
}
