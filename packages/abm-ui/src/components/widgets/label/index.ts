import { IterableWeakSet } from 'abm-utils';
import { customElement, property } from 'lit/decorators.js';
import { events } from '../../../events';
import { Widget, navigableWidgets } from '../base';

export interface WidgetLabelProp {
	/** 关联元素 ID */
	for?: string;
}

@customElement('w-label')
export class WidgetLabel extends Widget {
	#for?: string;
	#targets = new IterableWeakSet<Widget>();
	#hovering = false;
	#activating = false;
	constructor() {
		super();
		events.hover.on(this, ({ hover }) => {
			this.#hovering = hover;
			if (hover) this.#startHover();
			else this.#endHover();
		});
		events.active.on(this, ({ active, cancel }) => {
			this.#activating = active;
			if (cancel) this.#cancelActive();
			else if (active) this.#startActive();
			else this.#endActive();
		});
	}
	#startHover() {
		const targets = navigableWidgets.findAll((w) => w.id === this.#for);
		for (const target of targets) {
			this.#targets.add(target);
			events.hover.start(target);
		}
	}
	#endHover() {
		for (const widget of this.#targets) {
			events.hover.end(widget);
		}
		if (!this.#activating) this.#targets.clear();
	}
	#startActive() {
		for (const widget of this.#targets) {
			events.active.start(widget);
		}
	}
	#endActive() {
		for (const widget of this.#targets) {
			events.active.end(widget);
		}
	}
	#cancelActive() {
		for (const widget of this.#targets) {
			events.active.cancel(widget);
		}
		if (!this.#hovering) this.#targets.clear();
	}
	createRenderRoot() {
		return this;
	}
	/** 关联元素 ID */
	@property({ type: String })
	get for() {
		return this.#for;
	}
	set for(value) {
		if (this.#for === value) return;
		this.#for = value;
		if (this.#activating) this.#cancelActive();
		if (this.#hovering) {
			this.#endHover();
			this.#startHover();
		}
		if (this.#activating) this.#startActive();
	}
}
