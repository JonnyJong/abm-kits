import { toType } from 'abm-utils';
import { defineElement, property } from '../infra/decorator';
import type { ElementProps } from '../infra/dom';
import { register } from '../infra/registry';
import { css } from '../infra/style';
import { state } from '../state';
import type { AriaConfig } from './base';
import { FormControl } from './form';

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-radio': Radio<any>;
		'abm-radio-group': RadioGroup<any>;
	}
}

declare module '../infra/registry' {
	interface Registry {
		radio: Radio<any>;
		'radio-group': RadioGroup<any>;
	}
}

function findRadioGroup(from: HTMLElement): RadioGroup<any> | null {
	while (from) {
		from = from.parentNode as HTMLElement;
		if (from instanceof RadioGroup) return from;
	}
	return null;
}

function* iter(root: HTMLElement): Iterable<Radio<any>> {
	let current: Element | null | undefined = root.children[0];
	let next = false;
	while (current) {
		if (current === root) return;
		if (current instanceof Radio) yield current;
		if (
			next ||
			current instanceof Radio ||
			current instanceof RadioGroup ||
			current.children.length === 0
		) {
			if (current.nextElementSibling) {
				current = current.nextElementSibling;
				next = false;
				continue;
			}
			current = current.parentNode as Element;
			next = true;
			continue;
		}
		current = current.children[0];
	}
}

function setCheckedByValue(root: RadioGroup<any>, value: any): void {
	let found = false;
	for (const radio of iter(root)) {
		if (!found && radio.value === value) {
			radio.checked = true;
			found = true;
			continue;
		}
		radio.checked = false;
	}
}

function setCheckedFromRadio(from: Radio<any>): void {
	const group = findRadioGroup(from);
	if (!group) return;
	if (group.disabled) return;
	for (const radio of iter(group)) {
		radio.checked = radio === from;
	}
	group.emit('change', from.value);
}

function getValueFromGroup(root: RadioGroup<any>): any {
	for (const radio of iter(root)) {
		if (radio.checked) return radio.value;
	}
}

//#region Radio
export interface RadioProp<T> extends ElementProps<Radio<T>> {}

/**
 * 单选框
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form/radio#radio)
 */
@register('radio')
@defineElement('abm-radio')
export class Radio<T> extends FormControl<T, RadioProp<T>> {
	protected static hoverable = true;
	protected static navigable = true;
	protected static style = css`
		:host {
			display: inline-block;
			height: 32px;
			width: 32px;
			padding: 8px;
			border-radius: var(--border-radius-max);
			vertical-align: middle;
		}
		:host::before {
			content: '';
			display: block;
			box-sizing: border-box;
			height: 100%;
			background: var(--ui-bg);
			border: 1px solid var(--ui-border);
			border-radius: inherit;
			transition: .1s;
			transition-property: background, border;
		}
		:host([hover]:not([disabled]))::before {
			background: var(--ui-bg-hover);
			border-color: var(--ui-border-hover);
		}
		:host([active]:not([disabled]))::before {
			background: var(--ui-bg-active);
			border-color: var(--ui-border-active);
		}
		:host([checked])::before {
			border-width: 4px;
			--ui-border: var(--primary-bg);
			--ui-border-hover: var(--primary-bg-hover);
			--ui-border-active: var(--primary-bg-active);
		}
	`;
	protected static aria: AriaConfig = { role: 'radio', checked: false };
	constructor(_props?: RadioProp<T>) {
		super();
		this.attachShadow();
		state.active.on(this, (active, cancel) => {
			if (this.disabled || active || cancel) return;
			setCheckedFromRadio(this);
		});
	}
	@property()
	accessor default!: T;
	@property()
	accessor value!: T;
	#checked = false;
	/** 已选中 */
	@property({ reflect: true, toValue: Boolean })
	@toType(Boolean)
	get checked() {
		return this.#checked;
	}
	set checked(value) {
		this.#checked = value;
		this.ariaChecked = String(value);
	}
}

//#region Group
export interface RadioGroupProp<T> extends ElementProps<RadioGroup<T>> {}

/**
 * 单选框组
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form/radio#radiogroup)
 */
@register('radio-group')
@defineElement('abm-radio-group')
export class RadioGroup<T> extends FormControl<
	T | undefined,
	RadioGroupProp<T>
> {
	accessor default: T | undefined;
	get value() {
		return getValueFromGroup(this);
	}
	set value(value) {
		setCheckedByValue(this, value);
	}
}
