import { asArray, toType } from 'abm-utils';
import { defineElement, property } from '../infra/decorator';
import type { ElementProps } from '../infra/dom';
import { $content, $div, $new, $slot, type DOMContents } from '../infra/dom';
import { register } from '../infra/registry';
import { $style, css } from '../infra/style';
import { state } from '../state';
import { type AriaConfig, Component } from './base';
import { FormControl } from './form';

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-nav': Nav;
		'abm-nav-item': NavItem;
		'abm-nav-flex': NavFlex;
	}
}

declare module '../infra/registry' {
	interface Registry {
		nav: Nav;
		'nav-item': NavItem;
		'nav-flex': NavFlex;
	}
}

const kActive = Symbol();

function toKeyFrame(x: number, y: number, w: number, h: number): Keyframe {
	return {
		insetInlineStart: `${x}px`,
		insetBlockStart: `${y}px`,
		inlineSize: `${w}px`,
		blockSize: `${h}px`,
	};
}

function getLogicLayout(
	host: HTMLElement,
	target?: HTMLElement,
): { x: number; y: number; w: number; h: number } {
	if (!target) return { x: 0, y: 0, w: 0, h: 0 };
	const { writingMode, direction } = getComputedStyle(host);
	const ltr = direction === 'ltr';

	const {
		offsetLeft: left,
		offsetTop: top,
		offsetWidth: w,
		offsetHeight: h,
	} = target;
	const right = host.offsetWidth - left - w;
	const bottom = host.offsetHeight - top - h;

	switch (writingMode) {
		case 'vertical-lr':
		case 'vertical-rl':
			return { x: ltr ? top : bottom, y: left, w: h, h: w };
		case 'sideways-rl':
			return { x: ltr ? top : bottom, y: right, w: h, h: w };
		case 'sideways-lr':
			return { x: ltr ? bottom : top, y: left, w: h, h: w };
		default:
			return { x: ltr ? left : right, y: top, w, h };
	}
}

//#region Flex

export interface NavFlexProp extends ElementProps<NavFlex> {}

@register('nav-flex')
@defineElement('abm-nav-flex')
export class NavFlex extends Component<NavFlexProp> {
	protected static style = css`:host { flex: 1 }`;
	constructor(_props?: NavFlexProp) {
		super();
		this.attachShadow();
	}
}

//#region Item

export interface INavItem<T> {
	value: T;
	content: DOMContents;
}

export interface NavItemProp<T> extends ElementProps<NavItem<T>> {}

@register('nav-item')
@defineElement('abm-nav-item')
export class NavItem<T = any>
	extends Component<NavItemProp<T>>
	implements INavItem<T>
{
	protected static hoverable = true;
	protected static navigable = true;
	protected static style = css`
		:host {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 4px;
			padding: 4px 8px;
			border-radius: var(--border-radius);
			transition: .1s background;
		}
		:host([hover]:not([disabled])) {
			background: var(--ui-bg-hover);
		}
		:host([active]:not([disabled])) {
			background: var(--ui-bg-active);
		}
		:host([disabled]) { opacity: .75 }
		:host-context([vertical]) {
			flex-direction: column;
		}
	`;
	protected static aria: AriaConfig = {
		role: 'tab',
		disabled: false,
		checked: false,
	};
	constructor(_props?: NavItemProp<T>) {
		super();
		this.attachShadow({}, $slot());
		state.active.on(this, (active, cancel) => {
			if (this.disabled || active || cancel) return;
			const parent = this.parentNode;
			if (!(parent instanceof Nav)) return;
			if (parent.disabled) return;
			parent[kActive] = this;
			parent.emit('change', this.value);
		});
	}
	/** 值 */
	accessor value!: T;
	/** 内容 */
	get content(): (string | Node)[] {
		return $content(this);
	}
	set content(value: DOMContents) {
		this.replaceChildren(...asArray(value));
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
		this.updateAria({ disabled: value });
	}
}

//#region Nav
export interface NavProp<T> extends ElementProps<Nav<T>> {}

/**
 * 导航
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form/nav)
 */
@register('nav')
@defineElement('abm-nav')
export class Nav<T = any> extends FormControl<T | undefined, NavProp<T>> {
	protected static style = css`
		:host {
			position: relative;
			display: flex;
		}
		:host([vertical]) {
			flex-direction: column;
		}
		:host([disabled]) {
			pointer-events: none;
			opacity: .75;
		}
		.indicator {
			position: absolute;
			inset-block-start: var(--y);
			inset-inline-start: var(--x);
			inline-size: var(--w);
			block-size: var(--h);
			background: var(--ui-bg);
			border: 1px solid var(--ui-border);
			border-radius: var(--border-radius);
		}
		::slotted(*) { z-index: 1 }
	`;
	protected static aria: AriaConfig = { role: 'tablist' };
	#indicator = $div({ class: 'indicator' });
	#resizeObserver = new ResizeObserver(() => this.#updateView());
	#mutationObserver = new MutationObserver(([entry]) => {
		if (!this.#active) return;
		if (![...entry.removedNodes].includes(this.#active)) return;
		this.#setValue(this.#active.value);
	});
	constructor(_props?: NavProp<T>) {
		super();
		this.attachShadow({}, this.#indicator, $slot());
		this.#resizeObserver.observe(this);
		this.#mutationObserver.observe(this, { childList: true });
	}
	#updateView(animation?: boolean) {
		let c: ReturnType<typeof getLogicLayout> | undefined;
		if (animation) c = getLogicLayout(this, this.#indicator);
		const { x, y, w, h } = getLogicLayout(this, this.#active);
		$style(this.#indicator, { $x: x, $y: y, $w: w, $h: h });
		if (!c) return;
		const left = Math.min(x, c.x);
		const top = Math.min(y, c.y);
		const right = Math.max(x + w, c.x + c.w);
		const bottom = Math.max(y + h, c.y + c.h);
		const frames: Keyframe[] = [
			toKeyFrame(c.x, c.y, c.w, c.h),
			toKeyFrame(left, top, right - left, bottom - top),
			{},
		];
		this.#indicator
			.animate(frames, { duration: 200, easing: 'cubic-bezier(1, 0, 0, 1)' })
			.play();
	}
	#setValue(value: T | undefined) {
		let target: NavItem<T> | undefined;
		for (const element of this.children) {
			if (!(element instanceof NavItem)) continue;
			const checked = element.value === value;
			element.ariaChecked = String(checked);
			if (!checked) continue;
			target = element;
		}
		this[kActive] = target;
	}
	#active?: NavItem<T>;
	get [kActive]() {
		return this.#active;
	}
	set [kActive](value) {
		if (this.#active === value) return;
		if (value) this.#resizeObserver.observe(value);
		if (this.#active) this.#resizeObserver.unobserve(this.#active);
		this.#active = value;
		this.#updateView(true);
	}
	/** 垂直 */
	@property({ reflect: true, toValue: Boolean })
	accessor vertical = false;
	default: T | undefined;
	get value() {
		return this.#active?.value;
	}
	set value(value) {
		if (value === this.#active?.value) return;
		this.#setValue(value);
		if (value === this.#active?.value) return;
		this.emitUpdate(true);
	}
	setup(items: (INavItem<T> | T | { type: 'flex' })[]) {
		for (const element of this.children) {
			if (element instanceof NavItem) element.remove();
			else if (element instanceof NavFlex) element.remove();
		}
		this.prepend(
			...items.map((item) => {
				if (item && typeof item === 'object') {
					if ('type' in item && item.type === 'flex') return $new(NavFlex);
					if ('value' in item && 'content' in item)
						return $new(NavItem, { value: item.value, children: item.content });
				}
				return $new(NavItem, { value: item, children: item });
			}),
		);
	}
	/** @see {@link NavItem} */
	static readonly Item = NavItem;
	/** @see {@link NavFlex} */
	static readonly Flex = NavFlex;
}
