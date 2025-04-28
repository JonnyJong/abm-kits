import { Signal } from '@lit-labs/signals';
import { css } from 'abm-utils';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Widget } from '../base';
import CSS from './mouse.styl';

export type WidgetHintMouseKey =
	| 'Move'
	| 'MoveHorizontal'
	| 'MoveVertical'
	| 'Wheel'
	| 'WheelPress'
	| 'WheelUp'
	| 'WheelDown'
	| 'Left'
	| 'Right';

export interface WidgetHintMouseProp {
	key?: WidgetHintMouseKey;
}

const KEYS: WidgetHintMouseKey[] = [
	'Move',
	'MoveHorizontal',
	'MoveVertical',
	'Wheel',
	'WheelPress',
	'WheelUp',
	'WheelDown',
	'Left',
	'Right',
];

@customElement('w-hint-mouse')
export class WidgetHintMouse extends Widget<WidgetHintMouseProp> {
	static styles = css(CSS);
	#initialized = false;
	protected render() {
		return html`
			<svg class="${this.#key.get()}" width="28" height="28" viewBox="0 0 28 28">
				<path class="btn-left" d="M 7.3461655,6.5813524 9.5569901,4.4047893 H 13.998347 V 16.799779 H 7.357214 Z"/>
				<path class="btn-right" d="M 20.650528,6.5813524 18.439704,4.4047893 H 13.998347 V 16.799779 h 6.641133 z"/>
				<rect class="wheel" width="1.7927351" height="6.9301248" x="13.103632" y="7.8175921" ry="0.89636755"/>
				<path class="wheel-up" d="m 16,7.6659692 -2,-2 -2,1.999998"/>
				<path class="wheel-down" d="m 12,14.817592 2,2 2,-2"/>
				<path class="up" d="M 16,2.4999793 14,0.49997929 12,2.4999773"/>
				<path class="right" d="m 22.5,12 2,2 -1.999998,2"/>
				<path class="down" d="m 16,25.500021 -2,2 -2,-1.999998"/>
				<path class="left" d="m 5.4999793,16 -2,-2 1.999998,-2"/>
				<path class="shell" d="m 10.936088,4.2618602 h 6.127824 c 2.209139,0 4,1.790861 4,4 v 8.4298048 c 0,3.916068 -3.143957,7.081994 -7.063912,7.090937 -3.919955,0.0089 -7.0639117,-3.105766 -7.0639117,-7.037424 V 8.2618602 c 0,-2.2091389 1.7908608,-3.9999998 3.9999997,-4 z"/>
			</svg>
		`;
	}
	connectedCallback(): void {
		super.connectedCallback();
		if (this.#initialized) return;
		this.#initialized = true;
		this.key = this.textContent?.trim() as WidgetHintMouseKey;
	}
	#key = new Signal.State<WidgetHintMouseKey | undefined>(undefined);
	@property({ type: String })
	get key() {
		return this.#key.get();
	}
	set key(value) {
		if (this.#key.get() === value) return;
		this.#initialized = true;

		if (!value) value = undefined;
		else if (!KEYS.includes(value)) return;

		this.#key.set(value);
	}
	cloneNode(deep?: boolean): WidgetHintMouse {
		const node = super.cloneNode(deep) as WidgetHintMouse;

		node.key = this.key;

		return node;
	}
}
