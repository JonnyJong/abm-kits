import {
	clamp,
	css,
	type EventsList,
	EventValue,
	type EventValueInit,
} from 'abm-utils';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { events, type UIEventActive, type UIEventSlide } from '../../../events';
import { type KeyboardEvents, keyboard } from '../../../keyboard';
import type { Navigable } from '../../../navigate';
import { Widget } from '../base';
import CSS from './index.styl';

interface WidgetSwitchEventsInit {
	/** 更改事件 */
	change: EventValueInit<WidgetSwitch, boolean>;
}

export interface WidgetSwitchEvents
	extends EventsList<WidgetSwitchEventsInit> {}

export interface WidgetSwitchProp {
	/** 选中 */
	checked?: boolean;
	/** 禁用 */
	disabled?: boolean;
}

const SAFE_ZONE = 4;
const SWITCH_SIZE = 24;
const SWITCH_DISTANCE = SWITCH_SIZE / 2;

@customElement('w-switch')
export class WidgetSwitch
	extends Widget<WidgetSwitchEventsInit>
	implements Navigable
{
	static styles = css(CSS);
	constructor() {
		super({
			eventTypes: ['change'],
			nav: true,
		});

		events.hover.add(this);
		events.active.on(this, this.#activeHandler);
		events.slide.on(this, this.#slideHandler);
	}
	protected render() {
		return html`
			<div class="thumb"></div>
		`;
	}
	/** 选中 */
	@property({ type: Boolean, reflect: true }) accessor checked = false;
	/** 禁用 */
	@property({ type: Boolean, reflect: true }) accessor disabled = false;
	//#region Events
	#emit() {
		this.events.emit(
			new EventValue('change', {
				target: this,
				value: this.checked,
			}),
		);
	}
	#activeHandler(event: UIEventActive) {
		if (this.disabled) return;
		if (event.cancel || event.active) return;
		this.checked = !this.checked;
		this.#emit();
	}
	#sliding = false;
	#slideHandler(event: UIEventSlide) {
		if (this.disabled) return;
		// Start
		if (event.state === 'start') {
			keyboard.on('aliasPress', this.#aliasPressHandler);
			return;
		}
		// Move
		const dx = event.dx;
		if (event.state === 'move') {
			if (!this.#sliding) {
				this.#sliding = Math.abs(dx) >= SAFE_ZONE;
			}
			if (!this.#sliding) return;
			events.active.cancel(this);
			this.classList.add('w-switch-sliding');
			this.style.setProperty(
				'--offset',
				`${clamp(0, dx + (this.checked ? SWITCH_SIZE : 0), SWITCH_SIZE)}px`,
			);
			return;
		}
		// End
		if (!this.#sliding) return;
		this.#sliding = false;
		keyboard.off('aliasPress', this.#aliasPressHandler);
		this.classList.remove('w-switch-sliding');
		const newValue = dx > 0;
		if (Math.abs(dx) < SWITCH_DISTANCE || newValue === this.checked) return;
		this.checked = newValue;
		this.#emit();
	}
	#aliasPressHandler = (event: KeyboardEvents['aliasPress']) => {
		if (event.key !== 'ui.cancel') return;
		keyboard.off('aliasPress', this.#aliasPressHandler);
		events.slide.cancel(this);
		this.classList.remove('w-switch-sliding');
	};
	get nonNavigable() {
		return this.disabled;
	}
	cloneNode(deep?: boolean): WidgetSwitch {
		const node = super.cloneNode(deep) as WidgetSwitch;

		node.checked = this.checked;
		node.disabled = this.disabled;

		return node;
	}
}
