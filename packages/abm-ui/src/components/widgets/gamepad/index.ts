import { Signal } from '@lit-labs/signals';
import { $new, Vec2, css } from 'abm-utils';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { GameController } from '../../../game-controller';
import { Navigable } from '../../../navigate';
import { Widget } from '../base';
import { WidgetBtn } from '../btn';
import CSS from './index.styl';

const TRIGGER_HEIGHT = 27.985;

export interface WidgetGamepadProp {
	target?: number;
}

@customElement('w-gamepad')
export class WidgetGamepad extends Widget implements Navigable {
	static styles = css(CSS);
	#vibrate: WidgetBtn & Navigable = $new('w-btn', {
		class: 'vibrate',
		prop: { content: { icon: 'PhoneVibrate' }, disabled: true },
	});
	#connected = new Signal.State(false);
	#home = new Signal.State(false);
	#start = new Signal.State(false);
	#back = new Signal.State(false);
	#a = new Signal.State(false);
	#b = new Signal.State(false);
	#x = new Signal.State(false);
	#y = new Signal.State(false);
	#up = new Signal.State(false);
	#right = new Signal.State(false);
	#down = new Signal.State(false);
	#left = new Signal.State(false);
	#lb = new Signal.State(false);
	#rb = new Signal.State(false);
	#lsb = new Signal.State(false);
	#rsb = new Signal.State(false);
	#ls = new Signal.State<Vec2>([0, 0]);
	#rs = new Signal.State<Vec2>([0, 0]);
	#lt = new Signal.State(0);
	#rt = new Signal.State(0);
	protected render() {
		const [lsX, lsY] = this.#ls.get();
		const [rsX, rsY] = this.#rs.get();

		return html`
			<svg class=${classMap({
				connected: this.#connected.get(),
				home: this.#home.get(),
				start: this.#start.get(),
				back: this.#back.get(),
				a: this.#a.get(),
				b: this.#b.get(),
				x: this.#x.get(),
				y: this.#y.get(),
				up: this.#up.get(),
				right: this.#right.get(),
				down: this.#down.get(),
				left: this.#left.get(),
				lb: this.#lb.get(),
				rb: this.#rb.get(),
				lsb: this.#lsb.get(),
				rsb: this.#rsb.get(),
			})} width="600" height="400" viewBox="0 0 158.75 105.83333">
				<defs>
					<mask id="lt">
						<path d="m 26.222569,2.5299458 c 3.589765,0 4.26917,1.7589791 2.443847,4.2445918 L 11.806023,29.733978 C 10.578597,31.192911 8.4023728,30.581351 8.4023728,28.117604 V 6.1781925 c 0,-2.2216777 1.2628493,-3.6482467 3.5663782,-3.6482467 z"/>
					</mask>
					<mask id="rt">
						<path d="m 132.52743,2.5299458 c -3.58976,0 -4.26917,1.7589791 -2.44385,4.2445918 l 16.8604,22.9594404 c 1.22742,1.458933 3.40365,0.847373 3.40365,-1.616374 V 6.1781925 c 0,-2.2216777 -1.26285,-3.6482467 -3.56638,-3.6482467 z"/>
					</mask>
				</defs>
				<path class="shell" d="m 51.277344,7.2871094 c -7.148674,0 -19.399567,4.7771466 -23.369141,7.9218746 -4.359868,3.453923 -19.5058593,45.469112 -19.5058593,64.234375 0,12.585943 3.3468653,21.703121 14.6582033,21.703121 11.91593,0 14.70098,-27.593746 31.423828,-27.593746 h 49.781245 c 16.72285,0 19.5079,27.593746 31.42383,27.593746 11.31134,0 14.65821,-9.117178 14.65821,-21.703121 0,-18.765263 -15.146,-60.780452 -19.50586,-64.234375 -3.96958,-3.144728 -16.22047,-7.9218746 -23.36914,-7.9218746 -3.29939,3e-7 -4.6763,1.2265625 -7.42579,1.2265625 H 58.703125 c -2.749489,0 -4.126395,-1.2265622 -7.425781,-1.2265625 z"/>
				<path class="lb" d="m 50.767443,2.7946614 c -8.117687,0 -20.94058,5.6443434 -21.090702,11.2261876 5.069327,-3.031967 15.305963,-6.7339554 21.600748,-6.7339554 3.299386,3e-7 4.675898,1.2267985 7.425387,1.2267985 h 0.42168 V 5.8554565 c 0,0 -4.842041,-3.0607951 -8.357113,-3.0607951 z"/>
				<path class="rb" d="M 50.767446 2.7946614 C 54.282518 2.7946614 59.124558 5.8554565 59.124558 5.8554565 L 59.124558 8.5136921 L 58.702878 8.5136921 C 55.953388 8.5136921 54.576882 7.2868939 51.277492 7.2868936 C 44.98271 7.2868936 34.746074 10.988882 29.676744 14.020849 C 29.826866 8.4390048 42.649758 2.7946614 50.767446 2.7946614 z" transform="matrix(-1,0,0,1,158.75,0)"/>
				<circle class="home" cx="79.375" cy="15.534613" r="5.2927661" />
				<path class="back" d="m 71.740326,29.502968 a 3.2079008,3.2079008 0 0 1 -3.207901,3.207901 3.2079008,3.2079008 0 0 1 -3.207901,-3.207901 3.2079008,3.2079008 0 0 1 3.207901,-3.207901 3.2079008,3.2079008 0 0 1 3.207901,3.207901 z"/>
				<path class="start" d="m 71.740326,29.502968 a 3.2079008,3.2079008 0 0 1 -3.207901,3.207901 3.2079008,3.2079008 0 0 1 -3.207901,-3.207901 3.2079008,3.2079008 0 0 1 3.207901,-3.207901 3.2079008,3.2079008 0 0 1 3.207901,3.207901 z" transform="matrix(-1,0,0,1,158.75,0)"/>
				<circle class="ls" cx="42.376499" cy="29.660114" r="10.310583"/>
				<circle class="lsb" cx="42.376499" cy="29.660114" r="5.1552916" style=${styleMap({ transform: `translate(${lsX}px, ${lsY}px)` })}/>
				<circle class="rs" cx="97.641228" cy="51.243603" r="10.310583"/>
				<circle class="rsb" cx="97.641228" cy="51.243603" r="5.1552916" style=${styleMap({ transform: `translate(${rsX}px, ${rsY}px)` })}/>
				<path class="up" d="m 57.974609,42.621094 c -0.760404,0 -0.949218,0.60553 -0.949218,0.949218 v 5.585938 c 0,0.617983 2.192677,2.802029 2.68551,2.806641 0.492834,-0.0046 2.685583,-2.188658 2.685583,-2.806641 v -5.585938 c 0,-0.343688 -0.188814,-0.949218 -0.949218,-0.949218 h -1.736329 z"/>
				<path class="right" d="m 57.974609,42.621094 c -0.760404,0 -0.949218,0.60553 -0.949218,0.949218 v 5.585938 c 0,0.617983 2.192677,2.802029 2.68551,2.806641 0.492834,-0.0046 2.685583,-2.188658 2.685583,-2.806641 v -5.585938 c 0,-0.343688 -0.188814,-0.949218 -0.949218,-0.949218 h -1.736329 z" transform="rotate(90,59.711366,52.796547)"/>
				<path class="down" d="m 57.974609,42.621094 c -0.760404,0 -0.949218,0.60553 -0.949218,0.949218 v 5.585938 c 0,0.617983 2.192677,2.802029 2.68551,2.806641 0.492834,-0.0046 2.685583,-2.188658 2.685583,-2.806641 v -5.585938 c 0,-0.343688 -0.188814,-0.949218 -0.949218,-0.949218 h -1.736329 z" transform="rotate(180,59.711366,52.796547)"/>
				<path class="left" d="m 57.974609,42.621094 c -0.760404,0 -0.949218,0.60553 -0.949218,0.949218 v 5.585938 c 0,0.617983 2.192677,2.802029 2.68551,2.806641 0.492834,-0.0046 2.685583,-2.188658 2.685583,-2.806641 v -5.585938 c 0,-0.343688 -0.188814,-0.949218 -0.949218,-0.949218 h -1.736329 z" transform="rotate(-90,59.711366,52.796547)"/>
				<g class="a">
					<path d="m 120.78229,39.307159 c 0,2.739851 -2.22109,4.960938 -4.96094,4.960938 -2.73985,0 -4.96094,-2.221087 -4.96094,-4.960938 0,-2.73985 2.22109,-4.960937 4.96094,-4.960937 2.73985,0 4.96094,2.221087 4.96094,4.960937 z"/>
					<path class="text" d="m 112.95962,42.460995 1.9558,-6.307669 h 1.81187 l 1.9558,6.307669 h -1.59174 l -0.7874,-3.149602 q -0.127,-0.474133 -0.254,-1.007533 -0.11853,-0.5334 -0.24553,-1.016001 h -0.0339 q -0.11006,0.491067 -0.23706,1.024467 -0.127,0.524934 -0.24554,0.999067 l -0.7874,3.149602 z m 1.32927,-1.447801 v -1.1684 h 3.048 v 1.1684 z"/>
				</g>
				<g class="b">
					<path d="m 120.78229,39.307159 c 0,2.739851 -2.22109,4.960938 -4.96094,4.960938 -2.73985,0 -4.96094,-2.221087 -4.96094,-4.960938 0,-2.73985 2.22109,-4.960937 4.96094,-4.960937 2.73985,0 4.96094,2.221087 4.96094,4.960937 z" transform="rotate(-90,115.82039,29.80283)"/>
					<path class="text" d="m 122.90325,32.955704 v -6.307669 h 2.20134 q 0.65193,0 1.18533,0.143933 0.5334,0.135467 0.84667,0.474133 0.31326,0.338667 0.31326,0.948268 0,0.2794 -0.1016,0.5588 -0.1016,0.270933 -0.28786,0.491067 -0.1778,0.211666 -0.4318,0.313266 v 0.03387 q 0.47413,0.127 0.79586,0.491067 0.32174,0.364067 0.32174,0.9906 0,0.643467 -0.3302,1.058334 -0.3302,0.4064 -0.889,0.6096 -0.5588,0.194734 -1.2446,0.194734 z m 1.51554,-3.801535 h 0.62653 q 0.4826,0 0.70273,-0.194734 0.2286,-0.194733 0.2286,-0.516466 0,-0.338667 -0.2286,-0.482601 -0.2286,-0.1524 -0.70273,-0.1524 h -0.62653 z m 0,2.641601 h 0.75353 q 0.55033,0 0.82127,-0.194733 0.2794,-0.203201 0.2794,-0.609601 0,-0.389467 -0.2794,-0.5588 -0.27094,-0.169333 -0.82127,-0.169333 h -0.75353 z"/>
				</g>
				<g class="x">
					<path d="m 120.78229,39.307159 c 0,2.739851 -2.22109,4.960938 -4.96094,4.960938 -2.73985,0 -4.96094,-2.221087 -4.96094,-4.960938 0,-2.73985 2.22109,-4.960937 4.96094,-4.960937 2.73985,0 4.96094,2.221087 4.96094,4.960937 z" transform="rotate(90,115.82039,29.80283)"/>
					<path class="text" d="m 103.6406,32.957626 1.7272,-3.242734 -1.63407,-3.064935 h 1.68487 l 0.508,1.134534 q 0.11007,0.220133 0.21167,0.474133 0.11006,0.254001 0.24553,0.558801 h 0.0339 q 0.11006,-0.3048 0.21166,-0.558801 0.1016,-0.254 0.19474,-0.474133 l 0.4572,-1.134534 h 1.6002 l -1.6256,3.132668 1.73567,3.175001 h -1.68487 l -0.5842,-1.227667 q -0.11007,-0.245533 -0.2286,-0.499533 -0.11007,-0.262467 -0.23707,-0.550334 h -0.0339 q -0.11006,0.287867 -0.22013,0.550334 -0.1016,0.254 -0.21167,0.499533 l -0.54186,1.227667 z"/>
				</g>
				<g class="y">
					<path d="m 120.78229,39.307159 c 0,2.739851 -2.22109,4.960938 -4.96094,4.960938 -2.73985,0 -4.96094,-2.221087 -4.96094,-4.960938 0,-2.73985 2.22109,-4.960937 4.96094,-4.960937 2.73985,0 4.96094,2.221087 4.96094,4.960937 z" transform="rotate(180,115.82039,29.80283)"/>
					<path class="text" d="m 115.06167,23.452335 v -2.226734 l -1.89654,-4.080935 h 1.60867 l 0.52493,1.405467 q 0.127,0.355601 0.24554,0.694267 0.127,0.338667 0.26246,0.711201 h 0.0339 q 0.13547,-0.372534 0.26247,-0.711201 0.127,-0.338666 0.26246,-0.694267 l 0.52494,-1.405467 h 1.58327 l -1.90501,4.080935 v 2.226734 z"/>
				</g>
				<rect class="lt" width="21.242867" height="${this.#lt.get()}" x="8.4023724" y="2.5299459" ry="0" mask="url(#lt)"/>
				<rect class="lt" width="21.242867" height="${this.#rt.get()}" x="129.10475" y="2.5299459" ry="0" mask="url(#rt)"/>
			</svg>
			${this.#vibrate}
		`;
	}
	constructor() {
		super(undefined, false, true);

		this.#vibrate.on('active', this.#vibrateHandler);
		this.#vibrate.navParent = this;
	}
	#gamepad: GameController | null = null;
	#target = -1;
	@property({ type: Number })
	get target() {
		return this.#target;
	}
	set target(value) {
		if (this.#target === value) return;
		this.#unbind();
		value = Math.trunc(value);
		if (value < 0 || value > 3) value = -1;
		this.#target = value;
		this.#bind();
	}
	#bind() {
		if (this.#target === -1) return;
		this.#vibrate.disabled = false;
		this.#gamepad = GameController.getInstance(this.#target);

		this.#gamepad.on('connectivity', this.#connectivityHandler);
		this.#gamepad.on('home', this.#homeHandler);
		this.#gamepad.on('start', this.#startHandler);
		this.#gamepad.on('back', this.#backHandler);
		this.#gamepad.on('a', this.#aHandler);
		this.#gamepad.on('b', this.#bHandler);
		this.#gamepad.on('x', this.#xHandler);
		this.#gamepad.on('y', this.#yHandler);
		this.#gamepad.on('arrow', this.#arrowHandler);
		this.#gamepad.on('lb', this.#lbHandler);
		this.#gamepad.on('rb', this.#rbHandler);
		this.#gamepad.on('lsb', this.#lsbHandler);
		this.#gamepad.on('rsb', this.#rsbHandler);
		this.#gamepad.on('ls', this.#lsHandler);
		this.#gamepad.on('rs', this.#rsHandler);
		this.#gamepad.on('lt', this.#ltHandler);
		this.#gamepad.on('rt', this.#rtHandler);

		this.#connected.set(this.#gamepad.connecting);
		this.#home.set(this.#gamepad.home);
		this.#start.set(this.#gamepad.start);
		this.#back.set(this.#gamepad.back);
		this.#a.set(this.#gamepad.a);
		this.#b.set(this.#gamepad.b);
		this.#x.set(this.#gamepad.x);
		this.#y.set(this.#gamepad.y);
		this.#up.set(this.#gamepad.up);
		this.#right.set(this.#gamepad.right);
		this.#down.set(this.#gamepad.down);
		this.#left.set(this.#gamepad.left);
		this.#lb.set(this.#gamepad.lb);
		this.#rb.set(this.#gamepad.rb);
		this.#lsb.set(this.#gamepad.lsb);
		this.#rsb.set(this.#gamepad.rsb);
		this.#lt.set(this.#gamepad.lt * TRIGGER_HEIGHT);
		this.#rt.set(this.#gamepad.rt * TRIGGER_HEIGHT);
	}
	#unbind() {
		if (this.#target === -1) return;
		if (!this.#gamepad) return;
		this.#vibrate.disabled = true;

		this.#gamepad.off('connectivity', this.#connectivityHandler);
		this.#gamepad.off('home', this.#homeHandler);
		this.#gamepad.off('start', this.#startHandler);
		this.#gamepad.off('back', this.#backHandler);
		this.#gamepad.off('a', this.#aHandler);
		this.#gamepad.off('b', this.#bHandler);
		this.#gamepad.off('x', this.#xHandler);
		this.#gamepad.off('y', this.#yHandler);
		this.#gamepad.off('arrow', this.#arrowHandler);
		this.#gamepad.off('lb', this.#lbHandler);
		this.#gamepad.off('rb', this.#rbHandler);
		this.#gamepad.off('lsb', this.#lsbHandler);
		this.#gamepad.off('rsb', this.#rsbHandler);
		this.#gamepad.off('ls', this.#lsHandler);
		this.#gamepad.off('rs', this.#rsHandler);

		this.#connected.set(false);
		this.#home.set(false);
		this.#start.set(false);
		this.#back.set(false);
		this.#a.set(false);
		this.#b.set(false);
		this.#x.set(false);
		this.#y.set(false);
		this.#up.set(false);
		this.#right.set(false);
		this.#down.set(false);
		this.#left.set(false);
		this.#lb.set(false);
		this.#rb.set(false);
		this.#lsb.set(false);
		this.#rsb.set(false);
		this.#lt.set(0);
		this.#rt.set(0);

		this.#gamepad = null;
	}
	#connectivityHandler = () => this.#connected.set(!!this.#gamepad?.connecting);
	#homeHandler = () => this.#home.set(!!this.#gamepad?.home);
	#startHandler = () => this.#start.set(!!this.#gamepad?.start);
	#backHandler = () => this.#back.set(!!this.#gamepad?.back);
	#aHandler = () => this.#a.set(!!this.#gamepad?.a);
	#bHandler = () => this.#b.set(!!this.#gamepad?.b);
	#xHandler = () => this.#x.set(!!this.#gamepad?.x);
	#yHandler = () => this.#y.set(!!this.#gamepad?.y);
	#arrowHandler = () => {
		this.#up.set(!!this.#gamepad?.up);
		this.#right.set(!!this.#gamepad?.right);
		this.#down.set(!!this.#gamepad?.down);
		this.#left.set(!!this.#gamepad?.left);
	};
	#lbHandler = () => this.#lb.set(!!this.#gamepad?.lb);
	#rbHandler = () => this.#rb.set(!!this.#gamepad?.rb);
	#lsbHandler = () => this.#lsb.set(!!this.#gamepad?.lsb);
	#rsbHandler = () => this.#rsb.set(!!this.#gamepad?.rsb);
	#lsHandler = () => {
		if (!this.#gamepad) return;
		const ls = this.#gamepad.ls;
		ls.length *= 5;
		this.#ls.set(ls.vec);
	};
	#rsHandler = () => {
		if (!this.#gamepad) return;
		const rs = this.#gamepad.rs;
		rs.length *= 5;
		this.#rs.set(rs.vec);
	};
	#ltHandler = () => {
		if (!this.#gamepad) return;
		this.#lt.set(this.#gamepad.lt * TRIGGER_HEIGHT);
	};
	#rtHandler = () => {
		if (!this.#gamepad) return;
		this.#rt.set(this.#gamepad.rt * TRIGGER_HEIGHT);
	};
	#vibrateHandler = () => {
		if (!this.#gamepad) return;
		this.#gamepad.rumbleOnce('dual-rumble', {
			duration: 500,
			strongMagnitude: 0.2,
			weakMagnitude: 1,
		});
	};
	get navChildren() {
		return [this.#vibrate];
	}
}
