import { clamp, toType, type Vec2, Vector2 } from 'abm-utils';
import { defineElement, property } from '../infra/decorator';
import type { ElementProps } from '../infra/dom';
import { $div } from '../infra/dom';
import { register } from '../infra/registry';
import { css } from '../infra/style';
import { MovementController, type MovementEvent } from '../movement';
import { state } from '../state';
import type { AriaConfig } from './base';
import { FormControl } from './form';

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-switch': Switch;
	}
}

declare module '../infra/registry' {
	interface Registry {
		switch: Switch;
	}
}

export interface SwitchProp extends ElementProps<Switch> {}

/**
 * 开关
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/form/component/switch)
 */
@register('switch')
@defineElement('abm-switch')
export class Switch extends FormControl<boolean, SwitchProp> {
	protected static navigable = true;
	protected static hoverable = true;
	protected static style = css`
		:host {
			--size: 24px;
			position: relative;
			display: inline-block;
			height: var(--size);
			width: calc(var(--size) * 2);
			background: var(--ui-bg);
			border: 1px solid var(--ui-border);
			border-radius: var(--border-radius-max);
			transition: .1s;
			transition-property: background, border-color;
		}
		.anchor { position: absolute }
		.a { inset-inline-start: 0 }
		.b { inset-inline-end: 0 }
		.thumb {
			position: absolute;
			--thumb-size: calc(var(--size) - 2px);
			width: var(--thumb-size);
			height: var(--thumb-size);
			background: var(--fg);
			inset-inline-start: 0px;
			border-radius: var(--border-radius-max);
			scale: .7;
			transition: .1s;
			transition-property: background, scale, inset;
		}
		:host([hover]:not([disabled])) .thumb { scale: .8 }
		:host([active]:not([disabled])) .thumb { scale: .6 }
		.move { transition-property: scale }
		:host([checked]) { background: var(--primary) }
		:host([checked]) .thumb {
			inset-inline-start: var(--size);
			background: var(--primary-fg);
		}
	`;
	protected static aria: AriaConfig = { role: 'switch', checked: false };
	#anchorA = $div({ className: 'anchor a' });
	#anchorB = $div({ className: 'anchor b' });
	#thumb = $div({ className: 'thumb' });
	#move: MovementController<number>;
	constructor(_props?: SwitchProp) {
		super();
		this.attachShadow({}, this.#anchorA, this.#anchorB, this.#thumb);
		this.#move = new MovementController<number>(
			{
				value: 0,
				touchStartDelay: 0,
				penStartDelay: 0,
			},
			{
				handler: this.#handleMove,
				check: () => this.#track(),
				axis: () => ({ o: this.#anchorA, x: this.#anchorB }),
				triggers: this,
			},
		);
		state.active.on(this, (active, cancel) => {
			if (this.disabled || active || cancel) return;
			this.value = !this.value;
			this.emitUpdate(true);
		});
	}
	#track(): Vec2 {
		const a = this.#anchorA.getBoundingClientRect();
		const b = this.#anchorB.getBoundingClientRect();
		return [b.x - a.x, b.y - a.y];
	}
	#handleMove = (event: MovementEvent<number>) => {
		if (event.state === 'cancel') {
			this.#thumb.classList.remove('move');
			this.#thumb.style.insetInlineStart = '';
			return;
		}
		if (this.disabled) return this.#move.stop(true);
		if (!event.pointer) return;
		if (event.state === 'start') this.#thumb.classList.add('move');
		const track = this.#track();
		const size = Vector2.length(track) / 2;
		if (Vector2.length(event.pointer.offset) > 4) {
			state.active.set(this, false, true);
			this.setAttribute('active', '');
		}
		let offset = Vector2.scalarProjection(track, event.pointer.offset);
		if (this.value) offset += size;
		const clamped = clamp(0, offset, size);
		if (!event.end) {
			this.#thumb.style.insetInlineStart = `${clamped}px`;
			return;
		}
		const value = clamped > size / 2;
		this.#thumb.classList.remove('move');
		this.#thumb.style.insetInlineStart = '';
		this.removeAttribute('active');
		if (this.value === value) return;
		this.value = value;
		this.emitUpdate(true);
	};
	@property({ toValue: Boolean })
	@toType(Boolean)
	accessor default = false;
	#checked = false;
	@property({ reflect: true, toValue: Boolean })
	@toType(Boolean)
	get checked() {
		return this.#checked;
	}
	set checked(value) {
		this.#checked = value;
		this.updateAria({ checked: value });
	}
	@toType(Boolean)
	get value() {
		return this.#checked;
	}
	set value(value) {
		this.checked = value;
	}
}
