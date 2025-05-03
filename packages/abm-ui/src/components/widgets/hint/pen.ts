import { Signal } from '@lit-labs/signals';
import { css } from 'abm-utils';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Widget } from '../base';
import CSS from './pen.styl';

export type WidgetHintPenKey =
	| 'Tap'
	| 'DualTap'
	| 'Hold'
	| 'Draw'
	| 'DrawHorizontal'
	| 'DrawVertical'
	| 'Move'
	| 'MoveHorizontal'
	| 'MoveVertical';

export interface WidgetHintPenProp {
	key?: WidgetHintPenKey;
}

const KEYS: WidgetHintPenKey[] = [
	'Tap',
	'DualTap',
	'Hold',
	'Draw',
	'DrawHorizontal',
	'DrawVertical',
	'Move',
	'MoveHorizontal',
	'MoveVertical',
];

@customElement('w-hint-pen')
export class WidgetHintPen extends Widget {
	static styles = css(CSS);
	#initialized = false;
	protected render() {
		return html`
			<svg class="${this.#key.get()}" width="28" height="28" viewBox="0 0 28 28">
				<circle class="tap" cx="9.8397074" cy="18.347969" r="6.3974333"/>
				<circle class="tap-2" cx="9.8397074" cy="18.347969" r="3.4747479"/>
				<path class="up" d="m 6.6734646,22.309831 3.0000611,3 2.9999393,-3" transform="rotate(180,9.7262371,17.948223)"/>
				<path class="right" d="m 6.6734646,22.309831 3.0000611,3 2.9999393,-3" transform="rotate(-90,10.034743,17.931986)"/>
				<path class="down" d="m 6.6734646,22.309831 3.0000611,3 2.9999393,-3" transform="translate(0.03247428,0.61701133)"/>
				<path class="left" d="m 6.6734646,22.309831 3.0000611,3 2.9999393,-3" transform="rotate(90,9.4177315,17.96446)"/>
				<path class="draw" d="m 9.612387,18.640237 c 0.736605,3.001086 2.7802,3.563335 5.385438,3.563335 2.350118,0 3.812383,-3.169028 6.69567,-3.169028 2.630696,0 4.093391,1.840081 4.093391,3.468221"/>
				<path class="draw-up" d="M 9.6448613,18.607763 V 10.083264" transform="rotate(180,9.6286241,18.632119)"/>
				<path class="draw-right" d="M 9.6448613,18.607763 V 10.083264" transform="rotate(-90,9.6286241,18.632119)"/>
				<path class="draw-down" d="M 9.6448613,18.607763 V 10.083264"/>
				<path class="draw-left" d="M 9.6448613,18.607763 V 10.083264" transform="rotate(90,9.6286241,18.632119)"/>
				<path class="pen" d="m 27.720312,3.3760057 q 0,0.6669632 -0.250111,1.2922412 -0.250111,0.6252782 -0.722544,1.0977106 L 14.909059,17.604556 q -0.11116,0.11116 -0.254743,0.185268 -0.143582,0.07411 -0.301059,0.12042 l -4.5853736,1.148658 q -0.092633,0.01853 -0.1389506,0.01853 -0.2408478,0 -0.4168522,-0.171372 -0.1760041,-0.171373 -0.1760041,-0.41222 0,-0.05559 0.018527,-0.148215 l 1.1486575,-4.585369 q 0.04631,-0.157477 0.12042,-0.30106 0.07411,-0.143582 0.185268,-0.254743 L 22.477235,1.236165 q 0.435379,-0.43537891 1.014341,-0.67159511 0.578962,-0.2362163 1.190344,-0.2362163 0.639173,0 1.194975,0.2362163 0.555804,0.2362162 0.968024,0.64843651 0.41222,0.4122202 0.643805,0.9680231 0.231584,0.5558028 0.231584,1.1949762 z M 26.5346,3.4130587 q 0,-0.3983254 -0.134319,-0.7457022 Q 26.265962,2.3199804 26.020482,2.0606056 25.775002,1.8012311 25.432257,1.6576487 25.089512,1.5140662 24.681923,1.5140662 q -0.352007,0 -0.620646,0.097266 -0.268638,0.097266 -0.49559,0.2640062 -0.226953,0.1667408 -0.430747,0.3797988 -0.203795,0.2130575 -0.43538,0.4446419 l 2.714171,2.7141701 q 0.231585,-0.2223212 0.435379,-0.4353788 0.203794,-0.2130579 0.35664,-0.4446423 0.152846,-0.2315847 0.240848,-0.5002225 0.088,-0.2686382 0.088,-0.6206466 z M 10.44411,17.6694 14.066092,16.761589 24.580026,6.2476532 21.865856,3.5334831 11.351921,14.047418 Z"/>
			</svg>
		`;
	}
	connectedCallback(): void {
		super.connectedCallback();
		if (this.#initialized) return;
		this.#initialized = true;
		this.key = this.textContent?.trim() as WidgetHintPenKey;
	}
	#key = new Signal.State<WidgetHintPenKey | undefined>(undefined);
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
	cloneNode(deep?: boolean): WidgetHintPen {
		const node = super.cloneNode(deep) as WidgetHintPen;

		node.key = this.key;

		return node;
	}
}
