import { css } from 'abm-utils';
import CSS from 'checkbox.style';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { events, UIEventActive } from '../../events';
import { EventValue, EventValueInit } from '../../events/api/value';
import { EventsList } from '../../events/events';
import { Navigable } from '../../navigate';
import { Widget } from './base';
import { WidgetSelectProp } from './select';

interface WidgetCheckboxEventsInit {
	/** 更改事件 */
	change: EventValueInit<WidgetCheckbox, boolean>;
}

export type WidgetCheckboxEvents = EventsList<WidgetCheckboxEventsInit>;

export interface WidgetCheckboxProp {
	/** 选中 */
	checked?: boolean;
	/** 禁用 */
	disabled?: boolean;
}

/** 单选 */
@customElement('w-checkbox')
export class WidgetCheckbox
	extends Widget<WidgetSelectProp, WidgetCheckboxEventsInit>
	implements Navigable
{
	static styles = css(CSS);
	constructor() {
		super(['change'], true);

		events.hover.add(this);
		events.active.on(this, this.#activeHandler);
	}
	protected render() {
		return html`
			<svg width="12" height="9" fill="none" viewBox="0 0 12 9">
				<path d="M 0.99038251,4.9854434 4.0129808,8.0145144 11.009617,0.98551681"></path>
			</svg>
		`;
	}
	/** 选中 */
	@property({ type: Boolean, reflect: true }) accessor checked = false;
	/** 禁用 */
	@property({ type: Boolean, reflect: true }) accessor disabled = false;
	#activeHandler(event: UIEventActive) {
		if (this.disabled) return;
		if (event.cancel || event.active) return;
		this.checked = !this.checked;
		this.events.emit(
			new EventValue('change', {
				target: this,
				value: this.checked,
			}),
		);
	}
	get nonNavigable() {
		return this.disabled;
	}
	cloneNode(deep?: boolean): WidgetCheckbox {
		const node = super.cloneNode(deep) as WidgetCheckbox;

		node.checked = this.checked;
		node.disabled = this.disabled;

		return node;
	}
}
