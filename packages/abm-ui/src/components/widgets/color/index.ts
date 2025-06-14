import {
	$new,
	Color,
	EventValue,
	EventValueInit,
	EventsList,
	css,
} from 'abm-utils';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { configs } from '../../../configs';
import { events, UIEventActive } from '../../../events';
import { Navigable } from '../../../navigate';
import { Dialog } from '../../dialog';
import { Widget } from '../base';
import CSS from './index.styl';

interface WidgetColorEventsInit {
	/** 更改事件 */
	change: EventValueInit<WidgetColor, Color>;
}

export interface WidgetColorEvents extends EventsList<WidgetColorEventsInit> {}

export interface WidgetColorProp {
	/** 颜色 */
	value?: string | Color;
	/** 只读 */
	readOnly?: boolean;
	/** 启用透明度 */
	enableAlpha?: boolean;
}

@customElement('w-color')
export class WidgetColor
	extends Widget<WidgetColorEventsInit>
	implements Navigable
{
	static styles = css(CSS);
	#value = configs.theme.color;
	constructor() {
		super(['change'], true);

		events.active.on(this, this.#activeHandler);
	}
	protected render() {
		return html`<div style="background:${this.#value[this.enableAlpha ? 'hexa' : 'hex']()}"></div>`;
	}
	/** 只读 */
	@property({ type: Boolean, reflect: true, attribute: 'readonly' })
	accessor readOnly = false;
	/** 启用透明度 */
	@property({ type: Boolean, reflect: true, attribute: 'alpha' })
	accessor enableAlpha = false;
	/** 颜色 */
	@property({ type: String })
	get value(): Color {
		return this.#value.clone();
	}
	set value(value: string | Color) {
		if (typeof value === 'string') this.#value = Color.hexa(value);
		else if (value instanceof Color) this.#value = value.clone();
	}
	#activeHandler = async ({ cancel, active }: UIEventActive) => {
		if (this.readOnly) return;
		if (cancel || active) return;
		const picker = $new('w-color-picker', {
			prop: {
				enableAlpha: this.enableAlpha,
				value: this.#value,
			},
		});
		const confirm = await Dialog.confirm({
			title: 'ui.color_picker',
			content: picker,
			autoHide: true,
		});
		if (!confirm) return;
		this.#value = picker.value;
		this.requestUpdate();
		this.events.emit(
			new EventValue('change', {
				target: this,
				value: this.#value,
			}),
		);
	};
	get nonNavigable() {
		return this.readOnly;
	}
	cloneNode(deep?: boolean): WidgetColor {
		const node = super.cloneNode(deep) as WidgetColor;

		node.enableAlpha = this.enableAlpha;
		node.value = this.value;
		node.readOnly = this.readOnly;

		return node;
	}
}
