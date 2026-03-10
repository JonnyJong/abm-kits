import { toType } from 'abm-utils';
import { defineElement, property } from '../infra/decorator';
import {
	$$,
	$div,
	$part,
	$path,
	$ready,
	$slot,
	type ElementProps,
} from '../infra/dom';
import { register, registry } from '../infra/registry';
import { css } from '../infra/style';
import { state } from '../state';
import { Component } from './base';
import type { Button } from './button';
import type { FormControl } from './form';

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-collapsible': Collapsible;
	}
}

declare module '../infra/registry' {
	interface Registry {
		collapsible: Collapsible;
	}
}

export interface CollapsibleProps extends ElementProps<Collapsible> {}

export interface CollapsibleEventMap {
	expand: [];
	collapse: [];
}

const TRIGGER = 'collapsible-trigger';
const HEAD_SELECTOR = `:scope>[slot="head"]`;
const TRIGGER_SELECTOR = `${HEAD_SELECTOR} [${TRIGGER}], ${HEAD_SELECTOR}[${TRIGGER}]`;

function checkParent(collapsible: Collapsible, trigger: HTMLElement): boolean {
	for (const element of $path(trigger)) {
		if (!(element instanceof Collapsible)) continue;
		return element === collapsible;
	}
	return false;
}

/**
 * 可折叠面板
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/collapsible)
 */
@register('collapsible')
@defineElement('abm-collapsible')
export class Collapsible extends Component<
	CollapsibleProps,
	CollapsibleEventMap
> {
	protected static style = css`
		:host {
			display: block;
		}
		.content { padding: 4px 8px }
		.body {
			content-visibility: hidden;
			height: 0;
			overflow: clip;
			transition: height .3s ease, content-visibility .3s ease allow-discrete;
			interpolate-size: allow-keywords;
		}
		:host([expanded]) .body {
			content-visibility: visible;
			height: auto;
		}
	`;
	#head = $div(
		{ part: 'head', role: 'button', ariaExpanded: 'false' },
		$slot('head'),
	);
	#body = $div(
		{ class: 'body' },
		$div({ class: 'content', part: 'body' }, $slot()),
	);
	constructor(_props?: CollapsibleProps) {
		super();
		this.attachShadow({}, this.#head, this.#body);
	}
	protected async init(): Promise<void> {
		await $ready();
		for (const trigger of $$(TRIGGER_SELECTOR, this)) {
			if (!checkParent(this, trigger)) continue;
			this.setTrigger(trigger);
		}
	}
	#disabled = false;
	/** 禁用 */
	@property({ reflect: true, toValue: Boolean })
	@toType(Boolean)
	get disabled() {
		return this.#disabled;
	}
	set disabled(value) {
		this.#disabled = value;
		this.#head.ariaDisabled = String(value);
	}
	#expanded = false;
	/** 展开 */
	@property({ reflect: true, toValue: Boolean })
	@toType(Boolean)
	get expanded() {
		return this.#expanded;
	}
	set expanded(value) {
		this.#expanded = value;
		this.#head.ariaExpanded = String(value);
	}
	/**
	 * 切换展开状态
	 * @param force 强制展开/收起
	 * @returns 是否已展开
	 */
	toggle(force?: boolean): boolean {
		if (typeof force === 'boolean') this.expanded = force;
		else this.expanded = !this.expanded;
		return this.expanded;
	}
	#toggle = (force?: any) => {
		if (this.#disabled) return;
		this.emit(this.toggle(force) ? 'expand' : 'collapse');
	};
	#stateToggle = (active: boolean, cancel: boolean) => {
		if (active || cancel) return;
		this.#toggle();
	};
	#triggers = new WeakMap<HTMLElement, 'btn' | 'ctrl' | 'state'>();
	/** 设置触发器 */
	setTrigger(trigger: HTMLElement): void {
		if (this.#triggers.has(trigger)) return;

		// Button
		if (registry.is('button', trigger)) {
			trigger.on('active', this.#toggle);
			this.#triggers.set(trigger, 'btn');
			return;
		}

		// Checkbox, switch...
		if (
			registry.is('control', trigger) &&
			'checked' in trigger &&
			typeof trigger.checked === 'boolean'
		) {
			trigger.on('change', this.#toggle);
			this.#triggers.set(trigger, 'ctrl');
			return;
		}

		// Fallback
		state.active.on(trigger, this.#stateToggle);
		this.#triggers.set(trigger, 'state');
	}
	/** 检查元素是否为触发器 */
	hasTrigger(trigger: HTMLElement): boolean {
		return this.#triggers.has(trigger);
	}
	/** 移除触发器 */
	rmTrigger(trigger: HTMLElement): void {
		const type = this.#triggers.get(trigger);
		switch (type) {
			case 'btn':
				(trigger as Button).off('active', this.#toggle);
				return;
			case 'ctrl':
				(trigger as FormControl<any>).off('change', this.#toggle);
				return;
			case 'state':
				state.active.off(trigger, this.#stateToggle);
		}
	}
	protected clone(from: this): void {
		this.expanded = from.expanded;
	}
	/** `slot="head"` */
	static readonly Head = $part('head');
	/** `collapsible-trigger` */
	static readonly Trigger = $part((e) => e.setAttribute(TRIGGER, ''));
}
