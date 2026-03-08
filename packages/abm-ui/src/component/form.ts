import {
	asArray,
	IDGenerator,
	IterableWeakSet,
	Queue,
	toType,
	typeCheck,
} from 'abm-utils';
import { defineElement, property } from '../infra/decorator';
import type { ElementProps } from '../infra/dom';
import type { Navigable } from '../navigate';
import { state } from '../state';
import { type AriaConfig, Component, getNavigableComponents } from './base';

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-label': Label;
		'abm-form-field': FormField;
		'abm-form': Form;
	}
}

//#region Helper

const PATTERN_NUM = /^\d+$/;

function traverser(
	root: HTMLElement,
	handler: (current: HTMLElement, enter: () => void) => void,
): void {
	const queue = new Queue<HTMLElement>(...(root.children as any));
	for (const current of queue) {
		handler(current, () => {
			queue.enqueue(...(current.children as any));
		});
	}
}

function getValue(obj: object, keys: string): any {
	const key = keys.split('.', 1)[0];
	if (!(key in obj)) return;
	if (key === keys) return (obj as any)[key];
	return getValue((obj as any)[key], keys.slice(key.length + 1));
}

function setValue(obj: object, keys: string, value: any): any {
	const key = keys.split('.', 1)[0];
	if (key === keys) {
		(obj as any)[key] = value;
		return;
	}
	if (!(key in obj)) (obj as any)[key] = {};
	return setValue((obj as any)[key], keys.slice(key.length + 1), value);
}

/** 子代表单事件代理参数 */
export interface ChildFormEventsProxyOptions {
	/** 只代理直接子元素 */
	onlyChild?: boolean;
	/** 自定义检查 */
	check?: (control: FormControl<unknown>) => boolean;
}

/**
 * 代理子代表单事件
 * @param control 创建代理的根元素
 * @param options 子代表单事件代理参数；`true` 为 `{ onlyChild: true }` 简写
 */
export function proxyChildFormEvents(
	control: FormControl<any, any, any>,
	options?: ChildFormEventsProxyOptions | boolean,
): void {
	const onlyChild =
		typeof options === 'boolean' ? options : (options?.onlyChild ?? false);
	const customCheck = typeof options === 'object' ? options.check : undefined;
	const check = (event: Event): boolean => {
		const target = event.target;
		if (!target || target === control) return false;
		if (!(target instanceof FormControl)) return false;
		if (onlyChild && ![...control.children].includes(target)) return false;
		if (customCheck && !customCheck(target)) return false;
		return true;
	};
	control.addEventListener('__ABM_EVENT:input', (event: Event) => {
		if (!check(event)) return;
		event.stopPropagation();
		control.emit('input', control.value);
	});
	control.addEventListener('__ABM_EVENT:change', (event: Event) => {
		if (!check(event)) return;
		event.stopPropagation();
		control.emit('change', control.value);
	});
	control.addEventListener('__ABM_EVENT:submit', (event: Event) => {
		if (!check(event)) return;
		event.stopPropagation();
		control.emit('submit');
	});
}

//#region Label

export interface LabelProp extends ElementProps<Label> {}

/**
 * 标签
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form#label)
 */
@defineElement('abm-label')
export class Label extends Component<LabelProp> {
	protected static aria: AriaConfig = { role: 'label' };
	#targets = new IterableWeakSet<Component>();
	#hovering = false;
	#activating = false;
	constructor(_props?: LabelProp) {
		super();
		state.hover.on(this, (hover) => {
			this.#hovering = hover;
			if (hover) this.#startHover();
			else this.#endHover();
		});
		state.active.on(this, (active, cancel) => {
			this.#activating = active;
			if (cancel) this.#cancelActive();
			else if (active) this.#startActive();
			else this.#endActive();
		});
	}
	#for = '';
	@property({ reflect: true })
	get for() {
		return this.#for;
	}
	set for(value) {
		value = String(value);
		if (this.#for === value) return;
		this.#for = String(value);
		if (this.#activating) this.#cancelActive();
		if (!this.#hovering) return;
		this.#endHover();
		this.#startHover();
	}
	#startHover() {
		for (const target of getNavigableComponents(this.for)) {
			this.#targets.add(target);
			state.hover.set(target, true);
		}
	}
	#endHover() {
		for (const target of this.#targets) {
			state.hover.set(target, false);
		}
		if (!this.#activating) this.#targets.clear();
	}
	#startActive() {
		for (const target of this.#targets) {
			state.active.set(target, true);
			target.handleLabelActive?.(true, false);
		}
	}
	#endActive() {
		for (const target of this.#targets) {
			state.active.set(target, false);
			target.handleLabelActive?.(false, false);
		}
	}
	#cancelActive() {
		for (const target of this.#targets) {
			state.active.set(target, false, true);
			target.handleLabelActive?.(false, true);
		}
		if (!this.#hovering) this.#targets.clear();
	}
	protected clone(from: this): void {
		this.for = from.for;
	}
}

//#region Message

export interface FormMessageProps extends ElementProps<FormMessage> {}

/**
 * 表单消息
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form#formmessage)
 */
@defineElement('abm-form-message')
export class FormMessage extends Component<FormMessageProps> {
	/** 键名 */
	@property()
	@typeCheck(String)
	accessor name = '';
	/** 设置无效信息 */
	setMessage(message: any) {
		if (message) this.replaceChildren(...asArray(message));
		else this.replaceChildren();
	}
	protected clone(from: this): void {
		this.name = from.name;
	}
}

//#region Control

/**
 * 表单控件事件
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form#类-formcontrol)
 */
export interface FormControlEventMap<T> {
	/** 输入事件 */
	input: [value: T];
	/** 修改事件 */
	change: [value: T];
	/** 提交事件 */
	submit: [];
}

/** 表单控件 */
export abstract class FormControl<
		T,
		P extends {} = {},
		E extends FormControlEventMap<T> = FormControlEventMap<T>,
	>
	extends Component<P, E>
	implements Navigable
{
	/** 触发更新事件 */
	protected emitUpdate(end?: boolean): void {
		this.emit(end ? 'change' : 'input', this.value as any);
	}
	#invalid = false;
	/** 无效 */
	@property({ reflect: true, toValue: Boolean })
	@toType(Boolean)
	get invalid() {
		return this.#invalid;
	}
	set invalid(value) {
		this.#invalid = value;
		this.updateAria({ invalid: value });
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
	/** 键名 */
	@property()
	@typeCheck(String)
	accessor name = '';
	/** 默认值 */
	abstract default: T;
	/** 值 */
	abstract value: T;
	/** 重置为默认值 */
	reset(): void {
		this.value = this.default;
	}
	protected clone(from: this): void {
		this.invalid = from.invalid;
		this.disabled = from.disabled;
		this.name = from.name;
		this.default = from.default;
		this.value = from.value;
	}
}

//#region Field

export interface FormFieldProp extends ElementProps<FormField> {}

const idGenerator = new IDGenerator();

function getId(name: string): string {
	return `field-${idGenerator.next()}-${name}`;
}

/**
 * 表单域
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form#formfield)
 */
@defineElement('abm-form-field')
export class FormField<
	T = any,
	P extends FormFieldProp = FormFieldProp,
	E extends FormControlEventMap<T> = FormControlEventMap<T>,
> extends FormControl<T, P, E> {
	#mutationObserver = new MutationObserver((entries) => {
		for (const child of entries[0].removedNodes) {
			if (!(child instanceof FormControl)) continue;
			this.#invalid = child.invalid;
			this.#disabled = child.disabled;
			this.#defaultInitialized = true;
			this.#default = child.default;
			this.#valueInitialized = true;
			this.#value = child.value;
			break;
		}
		// Set: Name
		for (const child of entries[0].addedNodes) {
			if (child instanceof FormMessage) child.name = this.#name;
			else if (child instanceof Label) child.for = this.#id;
			else if (child instanceof FormControl) {
				child.name = this.#name;
				child.id = this.#id;
				child.invalid = this.#invalid;
				child.disabled = this.#disabled;
				if (this.#defaultInitialized) child.default = this.#default;
				if (this.#valueInitialized) child.value = this.#value;
			}
		}
	});
	constructor(_props?: FormFieldProp) {
		super();
		this.#mutationObserver.observe(this, { childList: true, attributes: false });
		proxyChildFormEvents(this, true);
	}
	#invalid = false;
	/** 无效 */
	@property({ reflect: true, toValue: Boolean })
	get invalid() {
		for (const child of this.children) {
			if (!(child instanceof FormControl)) continue;
			this.#invalid = child.invalid;
			return this.#invalid;
		}
		return this.#invalid;
	}
	set invalid(value) {
		this.#invalid = value;
		for (const child of this.children) {
			if (!(child instanceof FormControl)) continue;
			child.invalid = value;
		}
	}
	#disabled = false;
	/** 禁用 */
	@property({ reflect: true, toValue: Boolean })
	get disabled() {
		for (const child of this.children) {
			if (!(child instanceof FormControl)) continue;
			this.#disabled = child.disabled;
			return this.#disabled;
		}
		return this.#disabled;
	}
	set disabled(value) {
		this.#disabled = value;
		for (const child of this.children) {
			if (!(child instanceof FormControl)) continue;
			child.disabled = value;
		}
	}
	/** 键名 */
	#name = '';
	#id = getId('');
	@property()
	@typeCheck(String)
	get name() {
		return this.#name;
	}
	set name(value) {
		this.#name = value;
		this.#id = getId(value);
		for (const child of this.children) {
			if (child instanceof FormMessage) child.name = value;
			else if (child instanceof Label) child.for = this.#id;
			else if (child instanceof FormControl) {
				child.name = value;
				child.id = this.#id;
			}
		}
	}
	#defaultInitialized = false;
	#default: T = undefined as T;
	/** 默认值 */
	get default() {
		for (const child of this.children) {
			if (!(child instanceof FormControl)) continue;
			this.#defaultInitialized = true;
			this.#default = child.default;
			return this.#default;
		}
		return this.#default;
	}
	set default(value) {
		this.#defaultInitialized = true;
		this.#default = value;
		for (const child of this.children) {
			if (!(child instanceof FormControl)) continue;
			child.default = value;
		}
	}
	#valueInitialized = false;
	#value: T = undefined as T;
	/** 值 */
	get value() {
		for (const child of this.children) {
			if (!(child instanceof FormControl)) continue;
			this.#valueInitialized = true;
			this.#value = child.value;
			return this.#value;
		}
		return this.#value;
	}
	set value(value) {
		this.#valueInitialized = true;
		this.#value = value;
		for (const child of this.children) {
			if (!(child instanceof FormControl)) continue;
			child.value = value;
		}
	}
	reset(): void {
		for (const child of this.children) {
			if (child instanceof FormControl) child.reset();
			else if (child instanceof FormMessage) child.setMessage(undefined);
		}
	}
	/** 设置无效提出信息 */
	setMessage(message: any): void {
		for (const child of this.children) {
			if (child instanceof FormControl) child.invalid = !!message;
			else if (child instanceof FormMessage) child.setMessage(message);
		}
	}
	get nonNavigable() {
		return this.disabled;
	}
}

//#region Form

export interface FormProp extends ElementProps<Form> {}

/**
 * 表单
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form#form)
 */
@defineElement('abm-form')
export class Form<
	T extends any[] | Record<string, any> = Record<string, any>,
	P extends FormProp = FormProp,
	E extends FormControlEventMap<T> = FormControlEventMap<T>,
> extends FormControl<T, P, E> {
	protected static aria: AriaConfig = { role: 'form' };
	constructor(_props?: P) {
		super();
		proxyChildFormEvents(this);
	}
	#as?: T extends any[] ? 'array' : 'object';
	/**
	 * 表单内值始终作为数组/对象处理
	 * @default undefined
	 * @description
	 * - undefined：若全部键名都为数字，则作为数组，反之作为对象
	 * - `array`：始终作为数组处理
	 * - `object`：始终作为对象处理
	 */
	@property()
	@typeCheck(undefined, 'array', 'object')
	get as() {
		return this.#as;
	}
	set as(value) {
		this.#as = value;
	}
	#asValue(value: Record<string, any>): T {
		if (this.as === 'object') return value as T;
		if (
			this.as !== 'array' &&
			Object.keys(value).some((k) => !PATTERN_NUM.test(k))
		) {
			return value as T;
		}
		const result: any[] = [];
		for (const [k, v] of Object.entries(value)) {
			if (!PATTERN_NUM.test(k)) continue;
			result[k as any] = v;
		}
		return result as T;
	}
	get default(): T {
		const value: Record<string, any> = {};
		traverser(this, (current, enter) => {
			if (!(current instanceof FormControl)) return enter();
			setValue(value, current.name, current.default);
		});
		return this.#asValue(value);
	}
	set default(value: T) {
		traverser(this, (current, enter) => {
			if (!(current instanceof FormControl)) return enter();
			current.default = getValue(value, current.name);
		});
	}
	get value(): T {
		const value: Record<string, any> = {};
		traverser(this, (current, enter) => {
			if (!(current instanceof FormControl)) return enter();
			setValue(value, current.name, current.value);
		});
		return this.#asValue(value);
	}
	set value(value: T) {
		traverser(this, (current, enter) => {
			if (!(current instanceof FormControl)) return enter();
			current.value = getValue(value, current.name);
		});
	}
	reset(): void {
		traverser(this, (current, enter) => {
			if (!(current instanceof FormControl)) return enter();
			current.reset();
		});
	}
	/** 设置无效提出信息 */
	setMessage(messages: any[] | Record<string, any>) {
		traverser(this, (current, enter) => {
			// Sub Form
			if (current instanceof Form) {
				const message = getValue(messages, current.name);
				current.setMessage(message);
				return;
			}
			// Field
			if (current instanceof FormField) {
				const message = getValue(messages, current.name);
				current.setMessage(message);
				return;
			}
			// Control
			if (current instanceof FormControl) {
				const message = getValue(messages, current.name);
				current.invalid = message !== undefined;
				return;
			}
			// Message
			if (!(current instanceof FormMessage)) return enter();
			const message = getValue(messages, current.name);
			current.setMessage(message);
		});
	}
	protected clone(from: this): void {
		this.as = from.as;
		this.invalid = from.invalid;
		this.disabled = from.disabled;
		this.name = from.name;
		this.default = from.default;
		// Should not copy value
		// this.value = from.value;
	}
}
