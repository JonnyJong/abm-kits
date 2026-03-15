import { runSync, toType, typeCheck, type Vec2, Vector2 } from 'abm-utils';
import { defineElement, property } from '../infra/decorator';
import {
	$$,
	$div,
	$new,
	$rect,
	$slot,
	type DOMApplyOptions,
} from '../infra/dom';
import { $off, $on } from '../infra/event';
import { register } from '../infra/registry';
import { css } from '../infra/style';
import { keyboard } from '../input/keyboard';
import {
	type MovementAxisGetter,
	type MovementChecker,
	MovementController,
	type MovementEventHandler,
} from '../movement';
import { type Navigable, type NavState, navigate } from '../navigate/index';
import { state } from '../state';
import { FormControl, type FormControlProps } from './form';

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-segment-input': SegmentInput;
	}
}

declare module '../infra/registry' {
	interface Registry {
		'segment-input': SegmentInput;
	}
}

interface Seg extends HTMLInputElement {
	navCallback?: Navigable['navCallback'];
}
const Seg = HTMLInputElement;

function $vec(element: Element): Vec2 {
	const { x, y } = $rect(element);
	return [x, y];
}

function vec2Delta(vec: Vec2): number {
	const y = Math.abs(vec[1]);
	if (y < Number.EPSILON) return 0;
	if (Math.abs(vec[0]) > y) return 0;
	return -Math.sign(vec[1]);
}

function tryStep(target: Seg, direction: Vec2): boolean {
	const delta = vec2Delta(direction);
	if (!delta) return false;
	const host = target.parentNode;
	if (!(host instanceof SegmentInput)) return false;
	if (!host.handleStep) return false;
	runSync(host.handleStep, target, delta);
	host.emit('input', host.value);
	return true;
}

function tryNav(input: Seg, direction?: Vec2) {
	if (direction && tryStep(input, direction)) return;
	navigate.unlock();
	if (direction ? navigate.nav(direction) : navigate.back()) return;
	navigate.lock(input);
}

function handleNav(this: Seg, state: NavState) {
	switch (state.type) {
		case 'focus':
			return this.focus();
		case 'blur':
			return this.blur();
		case 'nav':
			navigate.unlock();
			this.blur();
			navigate.nav(state.direction, this);
			return;
		case 'cancel':
			if (state.down) return;
			return tryNav(this);
		case 'stick': {
			const { x, y } = state;
			return tryNav(this, [x, y]);
		}
		case 'direction':
			return tryNav(this, state.direction);
	}
}

function isAvailable(target: unknown): target is Seg {
	if (!(target instanceof Seg)) return false;
	return getComputedStyle(target).display !== 'none';
}

function focusPrev(current: HTMLElement) {
	let target = current.previousElementSibling;
	while (target) {
		if (isAvailable(target)) {
			state.hover.set(current, false);
			target.focus();
			return;
		}
		target = target.previousElementSibling;
	}
}

function focusNext(current: HTMLElement) {
	let target = current.nextElementSibling;
	while (target) {
		if (isAvailable(target)) {
			state.hover.set(current, false);
			target.focus();
			return;
		}
		target = target.nextElementSibling;
	}
}

export interface SegmentInputProps<T extends string[] = string[]>
	extends FormControlProps<SegmentInput<T>> {}

/**
 * 分段输入框
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form/segment-input)
 */
@register('segment-input')
@defineElement('abm-segment-input')
export class SegmentInput<T extends string[] = string[]> extends FormControl<
	T,
	SegmentInputProps<T>
> {
	protected static style = css`
		:host { position: relative }
		.anchor { position: absolute }
		.o { top: 8px }
		.x { top: 0 }
		::slotted(input) {
			all: unset;
			text-align: center;
			font-size: 1em;
			width: 3.5ex;
			height: 3.5ex;
			line-height: 3.5ex;
			background: var(--ui-bg);
			color: var(--fg);
			border-radius: var(--border-radius);
			transition: .1s background, .1s color;
		}
		:host(:not([disabled])) ::slotted(input[hover]) { background: var(--ui-bg-hover) }
		:host(:not([disabled])) ::slotted(input:focus) { background: var(--ui-bg-focus) }
		:host([disabled]) ::slotted(input) { opacity: .75 }
		:host([invalid]) ::slotted(input) {
			color: var(--danger-fg);
			--ui-bg: var(--danger-bg);
			--ui-bg-hover: var(--danger-bg-hover);
			--ui-bg-active: var(--danger-bg-active);
		}
	`;
	#o = $div({ class: 'anchor o' });
	#x = $div({ class: 'anchor x' });
	#observer = new MutationObserver((entries) => {
		for (const entry of entries) {
			for (const node of entry.addedNodes) {
				if (node instanceof Seg) this.#setSegment(node);
			}
			for (const node of entry.removedNodes) {
				if (node instanceof Seg) this.#unsetSegment(node);
			}
		}
	});
	#move: MovementController<number, Seg>;
	#focusing?: WeakRef<Seg> | null;
	#activated?: WeakRef<Seg> | null;
	#composition = false;
	constructor(_props?: SegmentInputProps<T>) {
		super();
		this.#move = new MovementController<number, Seg>(
			{ value: 0, step: 1, touchStartDelay: 0, penStartDelay: 0 },
			{ handler: this.#handleMove, check: this.#check, axis: this.#axis },
		);
		this.attachShadow({}, this.#o, this.#x, $slot());
		$on(this, 'compositionstart', this.#handleComposition);
		$on(this, 'compositionend', this.#handleComposition);
		$on(this, 'input', this.#handleInput);
		$on(this, 'wheel', this.#handleWheel);
		$on(this, 'keydown', this.#handleKeyDown);
		this.#observer.observe(this, { childList: true });
	}
	#check: MovementChecker<Seg> = (_, trigger) => {
		const focusing = this.#focusing?.deref();
		if (!focusing) return Vector2.sub($vec(this.#o), $vec(this.#x));
		if (trigger === this.#focusing) return false;
		trigger?.focus();
		return false;
	};
	#axis: MovementAxisGetter<number> = () => ({ o: this.#o, x: this.#x });
	#setSegment(seg: Seg) {
		seg.navCallback = handleNav;
		seg.setAttribute('nav', '');
		state.hover.add(seg);
		$on(seg, 'focus', this.#handleFocus);
		$on(seg, 'blur', this.#handleBlur);
		seg.disabled = super.disabled;
		if (!this.#slidable) return;
		this.#move.addTriggers(seg);
	}
	#unsetSegment(seg: Seg) {
		$off(seg, 'focus', this.#handleFocus);
		$off(seg, 'blur', this.#handleBlur);
		const focusing = this.#focusing?.deref();
		const activated = this.#activated?.deref();
		if (focusing === seg) this.#focusing = null;
		if (activated === seg) {
			this.#activated = null;
			this.#move.stop();
		}
		if (!this.#slidable) return;
		this.#move.rmTriggers(seg);
	}
	protected connectedCallback(): void {
		super.connectedCallback();
		for (const node of this.children) {
			if (node instanceof Seg) this.#setSegment(node);
		}
	}
	#verifySegment(target: unknown): target is Seg {
		if (!(target instanceof Seg)) return false;
		return target.parentNode === this;
	}
	//#region Handle
	#handleFocus = ({ target }: FocusEvent) => {
		if (!this.#verifySegment(target)) return;
		this.#focusing = new WeakRef(target);
		keyboard.setInputMode(true);
		navigate.setCurrent(target);
		navigate.lock(target);
		target.select();
	};
	#handleBlur = ({ target }: FocusEvent) => {
		if (!this.#verifySegment(target)) return;
		runSync(this.handleBlur, target);
		this.#focusing = null;
		keyboard.setInputMode(false);
		navigate.unlock();
		this.emitUpdate(true);
	};
	#handleWheel(event: WheelEvent) {
		if (super.disabled) return;
		if (!this.scrollable) return;
		if (!this.handleStep) return;
		const { target, deltaY } = event;
		if (!deltaY) return;
		if (!this.#verifySegment(target)) return;
		event.preventDefault();
		runSync(this.handleStep, target, -Math.sign(deltaY));
		this.emitUpdate(true);
	}
	#handleComposition(event: CompositionEvent) {
		this.#composition = event.type.at(-1) === 't';
		if (!this.#composition) this.#handleChange(event);
	}
	#handleInput(event: Event) {
		if (this.#composition) return;
		this.#handleChange(event);
	}
	#handleChange({ target }: Event) {
		if (super.disabled) return;
		if (!this.handleInput) return;
		if (!this.#verifySegment(target)) return;
		runSync(this.handleInput, target, () => focusNext(target));
	}
	#handleKeyDown(event: KeyboardEvent) {
		if (this.#composition) return;
		const { target, key, shiftKey, ctrlKey, altKey, metaKey } = event;
		if (shiftKey || ctrlKey || altKey || metaKey) return;
		if (!this.#verifySegment(target)) return;
		if (key === 'Enter' && keyboard.alias.has('ui.nav.active', key)) {
			this.emit('submit');
			return;
		}
		const { selectionStart, selectionEnd, value } = target;
		const selectStart = selectionStart === 0;
		const selectEnd = selectionEnd === value.length;
		switch (key) {
			case 'ArrowUp':
				if (!this.handleStep) return;
				runSync(this.handleStep, target, 1);
				this.emitUpdate();
				break;
			case 'ArrowDown':
				if (!this.handleStep) return;
				runSync(this.handleStep, target, -1);
				this.emitUpdate();
				break;
			case 'ArrowLeft':
				if (!selectStart) return;
				focusPrev(target);
				break;
			case 'ArrowRight':
				if (!selectEnd) return;
				focusNext(target);
				break;
			case 'Backspace':
				if (!(selectStart && selectEnd)) return;
				target.value = '';
				focusPrev(target);
				break;
			default:
				if (!Array.isArray(this.valueFilter)) return;
				if (this.valueFilter.includes(key)) return;
				break;
		}
		event.preventDefault();
	}
	#handleMove: MovementEventHandler<number, Seg> = ({
		trigger,
		delta,
		state,
		end,
	}) => {
		if (super.disabled) return this.#move.stop();
		if (!trigger) return;
		if (!this.handleStep) {
			this.#move.stop();
			trigger.focus();
			return;
		}
		if (end) {
			const activated = this.#activated?.deref();
			if (activated) activated.focus();
			this.#activated = null;
			return;
		}
		if (state === 'start') {
			this.#activated = new WeakRef(trigger);
			return;
		}
		this.#activated = null;
		if (!delta) return;
		runSync(this.handleStep, trigger, delta);
		this.emitUpdate();
	};
	//#region Props
	/**
	 * 步进处理器
	 * @param input 输入框
	 * @param delta 步进量，始终为整数
	 */
	@typeCheck(Function, undefined)
	handleStep?: (input: HTMLInputElement, delta: number) => any;
	/**
	 * 失焦处理器
	 * @param input 输入框
	 */
	@typeCheck(Function, undefined)
	handleBlur?: (input: HTMLInputElement) => any;
	/**
	 * 输入处理器
	 * @param input 输入框
	 * @param next 切换到下一个输入框
	 */
	@typeCheck(Function, undefined)
	handleInput?: (input: HTMLInputElement, next: () => void) => any;
	/**
	 * 输入值过滤
	 * @description
	 * 若定义，则只允许输入列表中的字符
	 */
	@typeCheck(Array, undefined)
	valueFilter?: string[];
	@typeCheck(Array)
	accessor default: T = [] as any;
	@typeCheck(Array)
	get value(): T {
		return $$<Seg>(':scope>input', this).map((i) => i.value) as any;
	}
	set value(value) {
		for (const [index, input] of $$<Seg>(':scope>input', this).entries()) {
			input.value = value.at(index) ?? '';
		}
	}
	#slidable = false;
	/**
	 * 可滑动
	 * @description
	 * 启用或关闭滑动修改数值，需同时配置 {@link handleStep} 才能生效
	 */
	@property({ toValue: Boolean })
	@toType(Boolean)
	get slidable() {
		return this.#slidable;
	}
	set slidable(value) {
		if (value === this.#slidable) return;
		this.#slidable = value;
		if (value) {
			this.#move.addTriggers(...$$<Seg>(':scope>input', this));
		} else {
			this.#move.stop();
			this.#move.clearTriggers();
		}
	}
	/**
	 * 可滚动
	 * @description
	 * 启用或关闭鼠标滚轮滚动修改数值，需同时配置 {@link handleStep} 才能生效
	 */
	@property({ toValue: Boolean })
	@toType(Boolean)
	accessor scrollable = false;
	get disabled() {
		return super.disabled;
	}
	@toType(Boolean)
	set disabled(value) {
		if (value === super.disabled) return;
		super.disabled = value;
		if (value) this.#move.stop();
		for (const e of $$<Seg>(':scope>input', this)) e.disabled = value;
	}
	static readonly Seg = (
		options?: DOMApplyOptions<'input', HTMLInputElement> | null,
	) => $new('input', options);
}
