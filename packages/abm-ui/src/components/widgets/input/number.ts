import { $new, IExpressionEvaluator, createClampedStepper } from 'abm-utils';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Navigable } from '../../../navigate';
import { WidgetIcon } from '../icon';
import { InputActions } from './actions';
import { IWidgetInputAutoFillItem, InputAutoFill } from './autofill';
import { WidgetInput, WidgetInputProp } from './base';
import { initInputNavigate } from './nav';

export interface WidgetNumberProp extends WidgetInputProp<number> {
	/** 默认值，默认为 0 */
	default?: number;
	/** 最小值，默认为 Number.NEGATIVE_INFINITY */
	min?: number;
	/** 最大值，默认为 Number.POSITIVE_INFINITY */
	max?: number;
	/**
	 * 步长，默认为 0
	 * @description
	 * 步长为 0 时，输入值将不按照步长调整；
	 * 步长为 0 时，按下“增加”、“减少”按钮将增加、减少 1；
	 */
	step?: number;
	/** 按钮增量 */
	incrementStep?: number;
	/** 自动填充 */
	autoFill?: IWidgetInputAutoFillItem<number>[];
	/**
	 * 表达式求值器
	 * @description
	 * 当表达式求值器可用时，用户可输入文本表达式，并自动求值；
	 * 若表达式求值器不可用，则用户只允许输入数值；
	 */
	expressionEvaluator?: IExpressionEvaluator;
}

/** 数字输入框 */
@customElement('w-number')
export class WidgetNumber
	extends WidgetInput<number, HTMLInputElement>
	implements Navigable
{
	static properties = { value: { type: Number } };
	#actionsLeft: InputActions<number> = new InputActions(
		this,
		this.events,
		'left',
	);
	#actionsRight: InputActions<number> = new InputActions(
		this,
		this.events,
		'right',
	);
	constructor() {
		super($new('input'));

		this.input.type = 'number';

		this.#actionsLeft.items = [
			{
				id: 'calc',
				content: $new<WidgetIcon, {}>('w-icon', { prop: { keyUI: 'calculate' } }),
				hidden: true,
				disabled: true,
			},
		];
		this.#actionsRight.items = [
			{
				id: 'increase',
				content: $new<WidgetIcon, {}>('w-icon', { prop: { keyUI: 'increase' } }),
			},
			{
				id: 'decrease',
				content: $new<WidgetIcon, {}>('w-icon', { prop: { keyUI: 'decrease' } }),
			},
		];

		this.input.addEventListener('input', this.#inputHandler);
		this.input.addEventListener('blur', this.#blurHandler);

		this.on('action', ({ value }) => {
			if (value === 'increase') this.#updateValue(true);
			else if (value === 'decrease') this.#updateValue(false);
			else if (value !== 'calc') return;

			if (this.#value() === undefined) return;
			this.input.value = this.#textCache;
		});

		initInputNavigate.call(this, this.input, this.events, this.#autofill);
	}
	//#region Calc
	#clampedStep = createClampedStepper(
		Number.NEGATIVE_INFINITY,
		Number.POSITIVE_INFINITY,
	);
	#reClampedStep() {
		this.#clampedStep = createClampedStepper(this.#min, this.#max, this.#step);
		this.value = this.#valueCache;
		this.#updateActions(this.value);
	}
	#clampIncrementStep() {
		if (this.#step === 0) return;
		this.#incrementStep =
			Math.round(this.#incrementStep / this.#step) * this.#step;
	}
	#inputCache: unknown = null;
	#valueCache = 0;
	#textCache = '';
	#value(input?: string) {
		if (this.#inputCache === input) return this.#valueCache;
		if (input === undefined) input = this.input.value;

		if (input === '') {
			this.#valueCache = this.#default;
			this.#textCache = '';
			return this.#default;
		}

		if (!this.#expressionEvaluator) {
			this.#valueCache = this.#clampedStep(this.input.valueAsNumber);
			this.#textCache = this.#valueCache.toString();
			return this.#valueCache;
		}

		const { value, text, error } = this.#expressionEvaluator.evaluate(input);
		if (error) return undefined;
		this.#valueCache = this.#clampedStep(value);
		this.#textCache = text;
		return this.#valueCache;
	}
	#updateValue(increase: boolean) {
		const defaultValue = increase ? this.#min : this.#max;
		let value = this.value;
		let step = this.#incrementStep;
		if (!increase) step *= -1;

		if (!Number.isFinite(value)) value = defaultValue;
		if (!Number.isFinite(value)) value = 0;

		value += step;
		value = this.#clampedStep(value);

		this.#valueCache = value;
		this.#textCache = value.toString();
		this.input.value = this.#textCache;

		this.#updateActions(this.value);

		this.emit('input', this.value);
		if (this.focusing) return;
		this.emit('confirm', this.value);
	}
	//#region Properties
	@property({ type: Number })
	get value() {
		return this.#valueCache;
	}
	set value(value: number) {
		this.#valueCache = this.#clampedStep(value);
		this.#textCache = this.#valueCache.toString();

		this.#updateActions(this.value);

		if (this.#expressionEvaluator || Number.isFinite(this.#valueCache)) {
			this.input.value = this.#textCache;
			return;
		}

		this.input.value = '';
	}
	#default = 0;
	/** 默认值，默认为 0 */
	@property({ type: Number })
	get default() {
		return this.#default;
	}
	set default(value: number) {
		if (value === this.#default) return;
		this.#default = value;
	}
	#min = Number.NEGATIVE_INFINITY;
	/** 最小值，默认为 Number.NEGATIVE_INFINITY */
	@property({ type: Number })
	get min() {
		return this.#min;
	}
	set min(value: number) {
		if (isNaN(value)) value = Number.NEGATIVE_INFINITY;
		if (value === this.#min) return;
		this.#min = value;
		this.input.min = value.toString();
		this.#reClampedStep();
	}
	#max = Number.POSITIVE_INFINITY;
	/** 最大值，默认为 Number.POSITIVE_INFINITY */
	@property({ type: Number })
	get max() {
		return this.#max;
	}
	set max(value: number) {
		if (isNaN(value)) value = Number.POSITIVE_INFINITY;
		if (value === this.#max) return;
		this.#max = value;
		this.input.max = value.toString();
		this.#reClampedStep();
	}
	#step = 0;
	/**
	 * 步长，默认为 0
	 * @description
	 * 步长为 0 时，输入值将不按照步长调整；
	 * 步长为 0 时，按下“增加”、“减少”按钮将增加、减少 1；
	 */
	@property({ type: Number })
	get step() {
		return this.#step;
	}
	set step(value: number) {
		if (isNaN(value)) value = 0;
		value = Math.abs(value);
		if (value === this.#step) return;
		this.#step = value;
		this.#reClampedStep();
		this.#clampIncrementStep();
	}
	#incrementStep = 1;
	/**
	 * 按钮增量
	 * @description
	 * 点击输入框上的按钮时的增量
	 */
	@property({ type: Number, attribute: 'increment-step' })
	get incrementStep() {
		return this.#incrementStep;
	}
	set incrementStep(value) {
		if (!Number.isFinite(value)) return;
		if (value <= 0) return;
		this.#incrementStep = value;
		this.#clampIncrementStep();
	}
	#autofill = new InputAutoFill(this, this.input, this.events);
	/** 自动填充 */
	get autoFill() {
		return this.#autofill.items;
	}
	set autoFill(value: IWidgetInputAutoFillItem<number>[]) {
		this.#autofill.items = value;
	}
	#expressionEvaluator?: IExpressionEvaluator;
	/**
	 * 表达式求值器
	 * @description
	 * 当表达式求值器可用时，用户可输入文本表达式，并自动求值；
	 * 若表达式求值器不可用，则用户只允许输入数值；
	 */
	get expressionEvaluator() {
		return this.#expressionEvaluator;
	}
	set expressionEvaluator(value: IExpressionEvaluator | undefined) {
		this.#expressionEvaluator = value;

		const useEvaluator = !!this.#expressionEvaluator;
		this.input.type = useEvaluator ? 'text' : 'number';
		this.#actionsLeft.items[0].hidden = !useEvaluator;

		this.#inputCache = null;
		this.#value();
	}
	//#region View
	protected render() {
		return html`
			${this.input}
			${this._placeholder}
			${this.#actionsLeft.element}
			${this.#actionsRight.element}
		`;
	}
	#updateActions(value: number) {
		const step = this.#step ? this.#step : 1;
		this.#actionsRight.items[0].disabled = value >= this.#max;
		this.#actionsRight.items[1].disabled = value - step < this.#min;
	}
	//#region Events
	#inputHandler = () => {
		this.#actionsLeft.items[0].disabled = this.input.value.length === 0;
		const value = this.#value();
		if (value === undefined) return;
		this.#updateActions(value);
		this.emit('input', value);
	};
	#blurHandler = () => {
		this.#value();
		this.input.value = this.#textCache;
		this.#updateActions(this.value);
		this.emit('confirm', this.value);
	};
	//#region Nav
	get navChildren() {
		return [
			this.#actionsLeft.element,
			this.#actionsRight.element,
			this.#autofill.element,
		];
	}
	cloneNode(deep?: boolean): WidgetNumber {
		const node = super.cloneNode(deep) as WidgetNumber;

		node.value = this.value;
		node.default = this.default;
		node.min = this.min;
		node.max = this.max;
		node.step = this.step;
		node.autoFill = this.autoFill;
		node.expressionEvaluator = this.expressionEvaluator;

		return node;
	}
}
