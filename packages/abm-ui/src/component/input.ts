import {
	asArray,
	resolveStep,
	steppedClamp,
	toType,
	typeCheck,
	type Vec2,
	wrapInRange,
} from 'abm-utils';
import { defineElement, property } from '../infra/decorator';
import type { ElementProps } from '../infra/dom';
import { $div, $new, $slot, type DOMContents } from '../infra/dom';
import { $on } from '../infra/event';
import { register } from '../infra/registry';
import { safeRect } from '../infra/screen';
import { css } from '../infra/style';
import { keyboard } from '../input/keyboard';
import { LayoutController } from '../layout';
import { type Navigable, type NavState, navigate } from '../navigate/index';
import { PrefabListItem } from '../prefab/list';
import type { AriaConfig } from './base';
import { Button } from './button';
import { FormControl, type FormControlEventMap } from './form';
import { ico } from './icon';
import { List } from './list';

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-text-box': TextBox;
		'abm-number-box': NumberBox;
		'abm-password-box': PasswordBox;
		'abm-textarea': TextArea;
	}
}

declare module '../infra/registry' {
	interface Registry {
		input: InputBox<unknown>;
		'text-box': TextBox;
		'number-box': NumberBox;
		'password-box': PasswordBox;
		textarea: TextArea;
	}
}

declare module './icon' {
	interface PresetIcons {
		/** 数字输入框增加 */
		increase: string;
		/** 数字输入框减少 */
		decrease: string;
	}
}

//#region Autofill
/** 自动填充项 */
export interface AutofillItem<T> {
	id: string;
	/**
	 * 应用该自动填充项目时：
	 * - 若 value 为空，则不修改输入框的值
	 * - 若 value 为非空，则将输入框的值修改为 value
	 */
	value?: T;
	/**
	 * 自动填充列表中显示的内容，若为空，则显示 value
	 */
	label?: DOMContents;
}

const itemCreator = PrefabListItem.creator<AutofillItem<any>>({
	render(self) {
		const content = asArray(self.value.label ?? self.value.value);
		self.replaceChildren(...content);
	},
	activeTrigger: true,
	hoverable: true,
	activatable: true,
	navigable: true,
});

/** 自动填充 */
class Autofill<T> {
	#list = $new(List<AutofillItem<T>>);
	#container = $div(
		{ className: 'surface-glass abm-input-autofill' },
		this.#list,
	);
	#input: HTMLElement;
	#onFill: (item: AutofillItem<T>) => void;
	#controller: LayoutController;
	#shown = false;
	constructor(input: HTMLElement, onFill: (item: AutofillItem<T>) => void) {
		this.#input = input;
		this.#onFill = onFill;
		this.#list.selectType = 'single';
		this.#list.itemCreator = itemCreator;
		this.#list.on('active', onFill);
		$on(this.#container, 'pointerdown', (e) => e.preventDefault());
		this.#controller = new LayoutController(
			[input, this.#container],
			this.#updateView,
		);
	}
	get items() {
		return this.#list.value;
	}
	set items(value) {
		this.#list.value = value;
		if (this.#shown) this.show();
	}
	#updateView = ({ left, width, top, bottom }: DOMRect, { height }: DOMRect) => {
		if (this.items.length === 0) return this.#hide();
		this.#show();
		const { vEnd } = safeRect;
		const downSide = bottom + height < Math.min(vEnd, innerHeight - 32);
		const position = downSide ? bottom : top - height;
		this.#container.setAttribute('side', downSide ? 'down' : 'up');
		this.#input.setAttribute('autofill-side', downSide ? 'down' : 'up');
		this.#container.style.top = `${position}px`;
		this.#container.style.left = `${left}px`;
		this.#container.style.width = `${width}px`;
	};
	#show() {
		if (this.#container.isConnected) return;
		document.body.append(this.#container);
	}
	#hide() {
		if (!this.#container.isConnected) return;
		this.#container.remove();
		this.#input.removeAttribute('autofill-side');
	}
	/** 显示自动填充 */
	show() {
		if (this.#container.isConnected) return;
		this.#controller.start();
		this.#list.select(false);
		this.#show();
		this.#shown = true;
	}
	/** 隐藏自动填充 */
	hide() {
		if (!this.#container.isConnected) return;
		this.#controller.stop();
		this.#hide();
		this.#shown = false;
	}
	/**
	 * @param type
	 * - `true`：向下选择
	 * - `false`：向上选择
	 * - `undefined`：确认选择
	 */
	select(type?: boolean): void {
		if (!this.#container.isConnected) return;
		if (type === undefined) {
			const item = this.#list.getSelected()[0];
			if (item) this.#onFill(item);
			return;
		}
		let index = this.#list.getSelectedIndex()[0];
		if (index === undefined) index = type ? 0 : -1;
		else if (type) index++;
		else index--;
		index = wrapInRange(index, this.items.length);
		this.#list.select([index]);
		this.#list.children[index]?.scrollIntoView({
			block: 'center',
			behavior: 'smooth',
		});
	}
}

//#region Input

function tryNav(input: HTMLElement, direction?: Vec2) {
	navigate.unlock();
	if (direction ? navigate.nav(direction) : navigate.back()) return;
	navigate.lock(input);
}

function handleNav(state: NavState, input: HTMLElement) {
	switch (state.type) {
		case 'focus':
			return input.focus();
		case 'blur':
			return input.blur();
		case 'nav':
			navigate.unlock();
			input.blur();
			navigate.nav(state.direction, input);
			return;
		case 'cancel':
			if (state.down) return;
			return tryNav(input);
		case 'stick': {
			const { x, y } = state;
			return tryNav(input, [x, y]);
		}
		case 'direction':
			return tryNav(input, state.direction);
	}
}

export interface InputBoxEventMap<T> extends FormControlEventMap<T> {
	autofill: [id: string];
}

interface InputBoxInit {
	left?: DOMContents;
	right?: DOMContents;
}

/**
 * 输入框
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form/input#类-inputbox)
 */
// @ts-expect-error
@register('input')
abstract class InputBox<T>
	extends FormControl<T, {}, InputBoxEventMap<T>>
	implements Navigable
{
	protected static hoverable = true;
	protected static style = css`
		:host {
			vertical-align: middle;
			display: inline-block;
			position: relative;
			padding: 8px 10px;
			width: 256px;
			height: 32px;
			background: var(--ui-bg);
			border: 1px solid var(--ui-border);
			border-radius: var(--border-radius);
			transition: .1s background, .1s border-color;
			overflow: clip;
		}
		:host([hover]:not([disabled])) {
			background: var(--ui-bg-hover);
			border-color: var(--ui-border-hover);
		}
		:host(:focus-within:not([disabled])) {
			background: var(--ui-bg-focus);
			border-color: var(--ui-border-focus);
		}
		:host([autofill-side="down"]) {
			border-bottom-left-radius: 0;
			border-bottom-right-radius: 0;
		}
		:host([autofill-side="up"]) {
			border-top-left-radius: 0;
			border-top-right-radius: 0;
		}
		:host([invalid]) {
			border-color: var(--danger-border);
			background: var(--danger-bg);
		}
		:host([invalid][hover]:not([disabled])) {
			border-color: var(--danger-border-hover);
			background: var(--danger-bg-hover);
		}
		:host([invalid]:focus-within:not([disabled])) {
			border-color: var(--danger-border-focus);
			background: var(--danger-bg-focus);
		}
		:host([disabled]) { opacity: .75 }
		:host([disabled])>* { pointer-events: none }
		:host([autosize]) { width: auto }
		input { all: unset }
		.placeholder, input, .size {
			color: var(--fg);
			font-size: 14px;
			line-height: 1;
		}
		input {
			box-sizing: border-box;
			position: absolute;
			inset: 0;
			display: block;
			border-radius: inherit;
			padding: inherit;
			padding-inline: calc(var(--p-l) + 12px) calc(var(--p-r) + 12px);
			height: calc(100% - 1px);
			cursor: text;
			-moz-appearance: textfield;
		}
		input::-webkit-inner-spin-button { display: none }
		.placeholder, .size {
			border-inline: 2px solid #0000;
			padding-inline: var(--p-l) var(--p-r);
			pointer-events: none;
		}
		.placeholder {
			white-space: nowrap;
			overflow: clip visible;
			text-overflow: ellipsis;
			opacity: .8;
			transition: .1s opacity;
		}
		.size {
			visibility: hidden;
			white-space: pre;
		}
		.slot {
			position: absolute;
			top: 0;
			height: 100%;
			display: flex;
			align-items: center;
			/* gap: 8px; */
		}
		.left { inset-inline-start: 0 }
		.right { inset-inline-end: 0 }
		input:focus~.placeholder {
			opacity: .5;
		}
		.size:not(:empty)~.placeholder, .size:empty { display: none }
		:where(.slot) ::slotted(abm-btn) { padding: .5em }
	`;
	protected static aria: AriaConfig = { role: 'group' };
	#size = $div({ className: 'size' });
	#placeholder = $div(
		{ className: 'placeholder', part: 'placeholder' },
		$slot(),
	);
	#input: Navigable;
	#left = $div({ className: 'slot left', part: 'left' }, $slot('left'));
	#right = $div({ className: 'slot right', part: 'right' }, $slot('right'));
	#resizeObserver = new ResizeObserver((entries) => {
		for (const entry of entries) {
			const width = `${entry.borderBoxSize[0].inlineSize}px`;
			const side = entry.target === this.#left ? 'l' : 'r';
			this.style.setProperty(`--p-${side}`, width);
		}
	});
	#autofill = new Autofill<T>(this, ({ id, value }) => {
		if (value !== undefined) this.value = value;
		this.emit('autofill', id);
	});
	#focusing = false;
	#changed = false;
	constructor(input: Navigable, init?: InputBoxInit) {
		super();
		this.#input = input;
		input.setAttribute('nav', '');
		input.navParent = this;
		input.navCallback = (state) => handleNav(state, input);
		$on(input, 'input', this.#handleInput);
		$on(input, 'focus', this.#handleFocus);
		$on(input, 'blur', this.#handleBlur);
		$on(input, 'keydown', this.#handleKey);
		if (init?.left) this.#left.append(...asArray(init.left));
		if (init?.right) this.#right.append(...asArray(init.right));
		this.attachShadow(
			{},
			this.#size,
			this.#input,
			this.#left,
			this.#placeholder,
			this.#right,
		);
		this.#resizeObserver.observe(this.#left);
		this.#resizeObserver.observe(this.#right);
		keyboard.on('aliasTrigger', this.#handleAlias);
		this.addEventListener('pointerdown', () => {
			if (!this.#focusing) return;
			setTimeout(() => this.focus());
		});
	}
	protected handleValue() {
		if (this.#focusing) this.#changed = true;
		this.#size.textContent = String(this.value);
	}
	#handleInput = () => {
		this.handleValue();
		this.emit('input', this.value);
	};
	#handleFocus = () => {
		this.#focusing = true;
		this.#changed = false;
		keyboard.setInputMode(true);
		navigate.lock(this.#input);
		this.#autofill.show();
	};
	#handleBlur = () => {
		this.#focusing = false;
		keyboard.setInputMode(false);
		navigate.unlock();
		this.#autofill.hide();
		if (!this.#changed) return;
		this.#changed = false;
		this.emit('change', this.value);
	};
	#handleKey = (event: KeyboardEvent) => {
		if (event.key === 'Enter' && keyboard.alias.has('ui.nav.active', 'Enter')) {
			this.emit('submit');
			return;
		}
		if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
		if (this.autofill.length === 0) return;
		event.preventDefault();
	};
	#handleAlias = (id: string) => {
		if (!this.#focusing) return;
		switch (id) {
			case 'ui.nav.up':
				return this.#autofill.select(false);
			case 'ui.nav.down':
				return this.#autofill.select(true);
			case 'ui.nav.active':
				return this.#autofill.select();
		}
	};
	handleLabelActive(active: boolean, cancel: boolean): void {
		if (active || cancel) return;
		this.focus();
	}
	/** 自动填充列表 */
	get autofill() {
		return this.#autofill.items;
	}
	set autofill(value) {
		this.#autofill.items = value;
	}
	/** 自动大小 */
	@property({ reflect: true, toValue: Boolean })
	accessor autoSize = false;
	/** 只读 */
	abstract readOnly: boolean;
	focus(options?: FocusOptions): void {
		this.#input.focus(options);
	}
	get navChildren() {
		const left: Element[] = [];
		const right: Element[] = [];
		for (const element of this.children) {
			if (element.slot === 'left') left.push(element);
			else if (element.slot === 'right') right.push(element);
		}
		return [
			this.#input,
			...left,
			this.#left,
			...right,
			this.#right,
		] as Navigable[];
	}
	protected clone(from: this): void {
		this.autofill = from.autofill;
		this.autoSize = from.autoSize;
		this.readOnly = from.readOnly;
		super.clone(from);
	}
}

//#region Text
export interface TextBoxProp extends ElementProps<TextBox> {}

/**
 * 文本输入框
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form/input#textbox)
 */
@register('text-box')
@defineElement('abm-text-box')
export class TextBox extends InputBox<string> {
	#input: HTMLInputElement & Navigable;
	constructor(_props?: TextBoxProp) {
		const input = $new('input');
		super(input);
		this.#input = input;
	}
	/** 禁用 */
	@property({ reflect: true, toValue: Boolean })
	get disabled() {
		return this.#input.disabled;
	}
	set disabled(value) {
		this.#input.disabled = value;
	}
	/** 只读 */
	@property({ reflect: true, toValue: Boolean })
	get readOnly() {
		return this.#input.readOnly;
	}
	set readOnly(value) {
		this.#input.readOnly = value;
	}
	@property()
	@toType(String)
	accessor default = '';
	@property()
	@toType(String)
	get value() {
		return this.#input.value;
	}
	set value(value) {
		this.#input.value = value;
		this.handleValue();
	}
}

//#region Number
export interface NumberBoxProp extends ElementProps<NumberBox> {}

/**
 * 数字输入框
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form/input#numberbox)
 */
@register('number-box')
@defineElement('abm-number-box')
export class NumberBox extends InputBox<number> {
	#input: HTMLInputElement & Navigable;
	#addBtn: Button;
	#subBtn: Button;
	constructor(_props?: NumberBoxProp) {
		const input = $new('input', { type: 'number' });
		const addBtn = $new(Button, { flat: true, repeat: true }, ico('ui.increase'));
		const subBtn = $new(Button, { flat: true, repeat: true }, ico('ui.decrease'));
		super(input, { right: [addBtn, subBtn] });
		this.#input = input;
		$on(input, 'blur', () => this.#handleBlur());
		$on(input, 'keydown', (event) => this.#handleKeyDown(event));
		this.#addBtn = addBtn;
		this.#subBtn = subBtn;
		addBtn.on('active', () => this.#stepValue(true));
		subBtn.on('active', () => this.#stepValue(false));
	}
	#clamp(value: number): number {
		return steppedClamp(this.min, this.max, value, this.step);
	}
	#handleBlur() {
		const value = this.#input.value ? this.#input.valueAsNumber : this.default;
		if (Number.isFinite(value)) {
			this.#input.valueAsNumber = this.#clamp(value);
		} else {
			this.#input.value = '';
		}
		this.handleValue();
	}
	#handleKeyDown(event: KeyboardEvent) {
		let add = false;
		if (event.key === 'ArrowUp') add = true;
		else if (event.key !== 'ArrowDown') return;
		event.preventDefault();
		this.#stepValue(add);
	}
	#stepValue(add: boolean) {
		if (this.disabled) return;
		let value = this.value;
		if (!Number.isFinite(value)) value = this.default;
		if (!Number.isFinite(value)) {
			if (this.min <= 0 && this.max >= 0) value = 0;
			else value = this.min;
		}

		const step = resolveStep(this.max, this.min, this.step);

		if (add) value += step;
		else value -= step;
		this.value = this.#clamp(value);

		this.emitUpdate(true);
	}
	/** 禁用 */
	@property({ reflect: true, toValue: Boolean })
	get disabled() {
		return this.#input.disabled;
	}
	set disabled(value) {
		this.#input.disabled = value;
		this.#addBtn.disabled = value;
		this.#subBtn.disabled = value;
	}
	/** 只读 */
	@property({ reflect: true, toValue: Boolean })
	get readOnly() {
		return this.#input.readOnly;
	}
	set readOnly(value) {
		this.#input.readOnly = value;
	}
	@property()
	@toType(Number)
	accessor default = NaN;
	@property()
	@toType(Number)
	get value() {
		if (this.#input.value === '') return this.default;
		return this.#clamp(this.#input.valueAsNumber);
	}
	set value(value) {
		try {
			this.#input.valueAsNumber = value;
		} catch {}
		this.handleValue();
	}
	/** 最小值 */
	@property({ toValue: Number })
	get min() {
		return this.#input.min ? Number(this.#input.min) : Number.NEGATIVE_INFINITY;
	}
	set min(value) {
		this.#input.min = String(value);
	}
	/** 最大值 */
	@property({ toValue: Number })
	get max() {
		return this.#input.max ? Number(this.#input.max) : Number.POSITIVE_INFINITY;
	}
	set max(value) {
		this.#input.max = String(value);
	}
	/** 步长 */
	@property({ toValue: Number })
	get step() {
		return this.#input.step ? Number(this.#input.step) : 0;
	}
	set step(value) {
		this.#input.step = String(value);
	}
	protected clone(from: this): void {
		this.min = from.min;
		this.max = from.max;
		this.step = from.step;
		super.clone(from);
	}
	// TODO: expression
}

//#region Password
export interface PasswordBoxProp extends ElementProps<TextBox> {}

/**
 * 密码输入框
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form/input#passwordbox)
 */
@register('password-box')
@defineElement('abm-password-box')
export class PasswordBox extends InputBox<string> {
	#input: HTMLInputElement & Navigable;
	constructor(_props?: PasswordBoxProp) {
		const input = $new('input', { type: 'password' });
		super(input);
		this.#input = input;
	}
	/** 禁用 */
	@property({ reflect: true, toValue: Boolean })
	get disabled() {
		return this.#input.disabled;
	}
	set disabled(value) {
		this.#input.disabled = value;
	}
	/** 只读 */
	@property({ reflect: true, toValue: Boolean })
	get readOnly() {
		return this.#input.readOnly;
	}
	set readOnly(value) {
		this.#input.readOnly = value;
	}
	@property()
	@toType(String)
	accessor default = '';
	@property()
	@toType(String)
	get value() {
		return this.#input.value;
	}
	set value(value) {
		this.#input.value = value;
		this.handleValue();
	}
	@property({ toValue: Boolean })
	get passwordVisible() {
		return this.#input.type !== 'password';
	}
	set passwordVisible(value) {
		this.#input.type = value ? 'text' : 'password';
	}
	protected clone(from: this): void {
		this.passwordVisible = from.passwordVisible;
		super.clone(from);
	}
}

//#region TextArea
export interface TextAreaProp extends ElementProps<TextArea> {}

/**
 * 文本区域
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form/textarea)
 */
@register('textarea')
@defineElement('abm-textarea')
export class TextArea
	extends FormControl<string, TextAreaProp, InputBoxEventMap<string>>
	implements Navigable
{
	protected static hoverable = true;
	protected static style = css`
		:host {
			display: block;
			position: relative;
			width: 256px;
			height: calc(32px + var(--s-h));
			background: var(--ui-bg);
			border: 1px solid var(--ui-border);
			border-radius: var(--border-radius);
			transition: .1s background, .1s border-color;
			overflow: clip;
		}
		:host([hover]:not([disabled])) {
			background: var(--ui-bg-hover);
			border-color: var(--ui-border-hover);
		}
		:host(:focus-within:not([disabled])) {
			background: var(--ui-bg-focus);
			border-color: var(--ui-border-focus);
		}
		:host([invalid]) {
			border-color: var(--danger-border);
			background: var(--danger-bg);
		}
		:host([invalid][hover]:not([disabled])) {
			border-color: var(--danger-border-hover);
			background: var(--danger-bg-hover);
		}
		:host([invalid]:focus-within:not([disabled])) {
			border-color: var(--danger-border-focus);
			background: var(--danger-bg-focus);
		}
		:host([disabled]) { opacity: .75 }
		:host([disabled])>* { pointer-events: none }
		:host([autosize]) {
			width: auto;
			height: auto;
		}
		.input { all: unset }
		.edit {
			height: calc(100% - var(--s-h));
			border-radius: inherit;
		}
		.edit>* {
			color: var(--fg);
			font-size: 14px;
			padding: 4px 8px;
			height: calc(100% - var(--s-h));
			white-space: break-spaces;
			tab-size: 1ex;
			overflow: auto;
		}
		.input {
			box-sizing: border-box;
			position: absolute;
			inset: 0;
			display: block;
			border-radius: inherit;
			cursor: text;
		}
		.placeholder, .size { pointer-events: none }
		.placeholder {
			overflow: clip visible;
			text-overflow: ellipsis;
			opacity: .8;
			transition: .1s opacity;
		}
		.size { visibility: hidden }
		.slot {
			display: none;
			padding: 4px;
		}
		.slot:not(:has(:hover:not(.flex))) { cursor: text }
		.show { display: flex }
		.flex { flex: 1 }
		.input:focus~.placeholder { opacity: .5 }
		.size:not(:empty)~.placeholder, .size:empty { display: none }
	`;
	protected static aria: AriaConfig = { role: 'group' };
	#size = $div({ className: 'size', part: 'edit' });
	#placeholder = $div(
		{ className: 'placeholder', part: 'edit placeholder' },
		$slot(),
	);
	#input: HTMLTextAreaElement & Navigable = $new('textarea', {
		className: 'input',
		part: 'edit',
		nav: true,
		props: { navParent: this },
	});
	#edit = $div(
		{ className: 'edit' },
		this.#size,
		this.#input,
		this.#placeholder,
	);
	#slot = $div(
		{ className: 'slot', part: 'slot' },
		$slot('left'),
		$div({ className: 'flex' }),
		$slot('right'),
	);
	#resizeObserver = new ResizeObserver((entries) => {
		const slotSize = entries[0].borderBoxSize[0].blockSize;
		this.style.setProperty('--s-h', `${slotSize}px`);
		this.style.setProperty('--s-g', `${slotSize ? 8 : 0}px`);
	});
	#mutationObserver = new MutationObserver(() => {
		let hasItem = false;
		for (const element of this.children) {
			if (!['left', 'right'].includes(element.slot)) continue;
			if (getComputedStyle(element).display === 'none') continue;
			hasItem = true;
		}
		this.#slot.classList.toggle('show', hasItem);
	});
	#focusing = false;
	#changed = false;
	constructor(_props?: TextAreaProp) {
		super();
		this.attachShadow({}, this.#edit, this.#slot);
		this.#input.navCallback = (state) => handleNav(state, this.#input);
		$on(this.#input, 'input', this.#handleInput);
		$on(this.#input, 'focus', this.#handleFocus);
		$on(this.#input, 'blur', this.#handleBlur);
		$on(this.#input, 'keydown', this.#handleKey);
		this.#resizeObserver.observe(this.#slot);
		this.#mutationObserver.observe(this, { childList: true });
		this.addEventListener('pointerdown', () => {
			if (!this.#focusing) return;
			setTimeout(() => this.focus());
		});
		this.#slot.addEventListener('pointerdown', (event) => {
			if (!event.target) return;
			if (!this.#slot.contains(event.target as any)) return;
			event.preventDefault();
			this.focus();
		});
	}
	#handleValue() {
		if (this.#focusing) this.#changed = true;
		let value = this.value;
		if (value.at(-1) === '\n') value += '\n';
		this.#size.textContent = value;
	}
	#handleInput = () => {
		this.#handleValue();
		this.emit('input', this.value);
	};
	#handleFocus = () => {
		this.#focusing = true;
		this.#changed = false;
		keyboard.setInputMode(true);
		navigate.lock(this.#input);
	};
	#handleBlur = () => {
		this.#focusing = false;
		keyboard.setInputMode(false);
		navigate.unlock();
		if (!this.#changed) return;
		this.#changed = false;
		this.emit('change', this.value);
	};
	#handleKey = (event: KeyboardEvent) => {
		if (event.key !== 'Enter') return;
		const ctrl = event.ctrlKey;
		const shift = event.shiftKey;
		const alt = event.altKey;
		switch (this.enterMode) {
			case 'direct':
				if (ctrl || shift || alt) return;
				break;
			case 'ctrl':
				if (!ctrl || shift || alt) return;
				break;
			case 'shift':
				if (ctrl || !shift || alt) return;
				break;
			case 'alt':
				if (ctrl || shift || !alt) return;
				break;
			case 'never':
				return;
		}
		event.preventDefault();
		this.emit('submit');
	};
	/** 自动大小 */
	@property({ reflect: true, toValue: Boolean })
	accessor autoSize = false;
	/** 禁用 */
	@property({ reflect: true, toValue: Boolean })
	get disabled() {
		return this.#input.disabled;
	}
	set disabled(value) {
		this.#input.disabled = value;
	}
	/** 只读 */
	@property({ reflect: true, toValue: Boolean })
	get readOnly() {
		return this.#input.readOnly;
	}
	set readOnly(value) {
		this.#input.readOnly = value;
	}
	@property()
	@toType(String)
	accessor default = '';
	@property()
	@toType(String)
	get value() {
		return this.#input.value;
	}
	set value(value) {
		this.#input.value = value;
		this.#handleValue();
	}
	/** 回车键模式 */
	@property()
	@typeCheck('direct', 'ctrl', 'shift', 'alt', 'never')
	accessor enterMode: 'direct' | 'ctrl' | 'shift' | 'alt' | 'never' = 'never';
	focus(options?: FocusOptions): void {
		this.#input.focus(options);
	}
	get navChildren() {
		return [this.#input, ...this.children] as Navigable[];
	}
	protected clone(from: this): void {
		this.autoSize = from.autoSize;
		this.readOnly = from.readOnly;
		super.clone(from);
	}
}
