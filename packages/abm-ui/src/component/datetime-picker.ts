import {
	clamp,
	createArray,
	lazy,
	locale,
	toType,
	typeCheck,
	wrapInRange,
} from 'abm-utils';
import type { Temporal as TemporalNS } from 'temporal-polyfill';
import { defineElement, property } from '../infra/decorator';
import { $$, $new } from '../infra/dom';
import { register } from '../infra/registry';
import { css } from '../infra/style';
import type { Navigable } from '../navigate/index';
import { FormControl, type FormControlProps } from './form';
import { SegmentInput } from './segment-input';

declare const Temporal: typeof TemporalNS;

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-datetime-picker': DatetimePicker;
	}
}

declare module '../infra/registry' {
	interface Registry {
		'datetime-picker': DatetimePicker;
	}
}

type FormatOptionValue<T extends keyof Intl.DateTimeFormatOptions> = Exclude<
	Intl.DateTimeFormatOptions[T],
	undefined
>;
type ToPart<T extends Intl.DateTimeFormatPartTypes> =
	T extends keyof Intl.DateTimeFormatOptions
		? {
				type: T;
				fmt?: Intl.DateTimeFormatOptions[T];
			}
		: never;
type FractionalSecondOption = FormatOptionValue<'fractionalSecondDigits'>;
type SpecialPartName = 'hour' | 'era' | 'timeZoneName' | 'dayPeriod' | 'year';
type HourFmt = `${Intl.LocaleHourCycleKey}_${FormatOptionValue<'hour'>}`;
export type DatetimePickerPart =
	| ToPart<Exclude<Intl.DateTimeFormatPartTypes, SpecialPartName>>
	| { type: 'literal'; fmt: string }
	| string
	| { type: 'fractionalSecond'; fmt?: FractionalSecondOption }
	| { type: 'hour'; fmt?: HourFmt }
	| { type: 'dayPeriod' | 'year'; fmt?: undefined };

type RenderedOption =
	| ToPart<Exclude<Intl.DateTimeFormatPartTypes, SpecialPartName>>
	| { type: 'fractionalSecond'; fmt?: FractionalSecondOption }
	| { type: 'hour'; fmt?: HourFmt }
	| { type: 'dayPeriod' | 'year'; fmt?: undefined };

interface Input extends HTMLInputElement {
	host: DatetimePicker;
	opt: RenderedOption;
	maxVal: number;
	val: number;
	get: Getter;
	set: Setter;
	handleStep: StepHandler;
	handleInput: InputHandler;
	get locale(): string;
}

// biome-ignore lint/correctness/noUnusedVariables: Already used
const Input = HTMLInputElement;

//#region #Part

function intlPart(
	locale: string,
	options?: Intl.DateTimeFormatOptions,
): DatetimePickerPart[] {
	const formatter = new Intl.DateTimeFormat(locale, options);
	const opt = formatter.resolvedOptions() as Intl.DateTimeFormatOptions;
	const parts = formatter.formatToParts();
	return parts.map<DatetimePickerPart>(({ type, value }) => {
		switch (type) {
			case 'weekday':
			case 'month':
			case 'day':
			case 'minute':
			case 'second':
				return { type, fmt: opt[type] } as DatetimePickerPart;
			case 'hour':
				return { type, fmt: `${opt.hourCycle ?? 'h23'}_${opt.hour ?? '2-digit'}` };
			case 'fractionalSecond':
				return { type, fmt: opt.fractionalSecondDigits };
			case 'year':
			case 'dayPeriod':
				return { type };
			default:
				return { type: 'literal', fmt: value };
		}
	});
}

//#region #Enum
const enums = {
	weekday: lazy(
		(locale: string, fmt: FormatOptionValue<'weekday'>): string[] => {
			const formatter = new Intl.DateTimeFormat(locale, { weekday: fmt });
			return createArray(7, (d) => formatter.format(new Date(2026, 3, d - 1)));
		},
	),
	month: lazy((locale: string, fmt: FormatOptionValue<'month'>): string[] => {
		const formatter = new Intl.DateTimeFormat(locale, { month: fmt });
		return createArray(12, (d) => formatter.format(new Date(2026, d)));
	}),
	period: lazy((locale: string): string[] => {
		const formatter = new Intl.DateTimeFormat(locale, {
			timeStyle: 'short',
			hour12: true,
		});
		const getPeriod = (d: number) =>
			formatter
				.formatToParts(new Date(2026, 0, 1, d))
				.find(({ type }) => type === 'dayPeriod')?.value;
		return [getPeriod(8) ?? 'AM', getPeriod(18) ?? 'PM'];
	}),
} as const;

//#region #Helper

function getLocale(): string {
	return locale.locales[0] ?? navigator.language;
}

function toDatetime(
	input: string | null,
	current: TemporalNS.ZonedDateTime,
): TemporalNS.ZonedDateTime {
	if (!input) return current;
	try {
		return Temporal.ZonedDateTime.from(input);
	} catch (error) {
		console.error(error);
		return current;
	}
}

function pad(num: number, length = 1): string {
	return num.toString().padStart(length, '0');
}

function toNum(input: Input, fallback: number): number {
	const value = parseInt(input.value);
	return Number.isFinite(value) ? value : fallback;
}

const PATTERN_NON_NUM = /\D/g;
function clear(input: Input) {
	if (!PATTERN_NON_NUM.test(input.value)) return;
	input.value = input.value.replace(PATTERN_NON_NUM, '');
}

const PATTERN_CJK =
	/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu;
function baseSize(words: string[]): number {
	const sizes = words.map((word) => {
		const cjk = word.match(PATTERN_CJK);
		// CJK Char need calc twice
		return word.length + (cjk?.length ?? 0);
	});
	return Math.max(...sizes);
}

function setBaseSize(input: Input, words: string[]): void {
	input.style.setProperty('--s', `${baseSize(words)}`);
}

//#region #Handle

type FmtMap<T, F> = T extends { fmt?: undefined }
	? F
	: {
			[K in T extends { fmt?: infer I extends string | number } ? I : never]: F;
		};

type TypeMap<F> = {
	[K in RenderedOption extends { type: infer I } ? I : never]: FmtMap<
		RenderedOption & { type: K },
		F
	>;
};

//#region Fallback

type FallbackType<T> = T extends { fmt?: infer K extends string | number }
	? K
	: undefined;

type FallbackMap = {
	[K in RenderedOption extends { type: infer I } ? I : never]: FallbackType<
		RenderedOption & { type: K }
	>;
};

const FALLBACK_MAP: FallbackMap = {
	weekday: 'short',
	month: 'short',
	day: '2-digit',
	dayPeriod: '',
	hour: 'h23_2-digit',
	minute: '2-digit',
	second: '2-digit',
	year: 'numeric',
	fractionalSecond: 3,
};

//#region Set

type Setter = (this: Input, date: TemporalNS.ZonedDateTime) => void;

const SET_MAP: TypeMap<Setter> = {
	day: {
		'2-digit'({ day, daysInMonth }) {
			this.maxVal = daysInMonth;
			this.value = pad(day, 2);
		},
		numeric({ day, daysInMonth }) {
			this.maxVal = daysInMonth;
			this.value = pad(day);
		},
	},
	dayPeriod({ hour }) {
		const period = hour >= 12 ? 1 : 0;
		this.val = period;
		const words = enums.period(this.locale);
		this.value = words[period];
		setBaseSize(this, words);
	},
	fractionalSecond: {
		1(date) {
			this.value = pad(date.millisecond % 100);
		},
		2(date) {
			this.value = pad(date.millisecond % 10, 2);
		},
		3(date) {
			this.value = pad(date.millisecond, 3);
		},
	},
	hour: {
		h11_numeric({ hour }) {
			this.value = pad(hour % 12);
		},
		'h11_2-digit'({ hour }) {
			this.value = pad(hour % 12, 2);
		},
		h12_numeric({ hour }) {
			if (hour === 0) hour = 12;
			else if (hour > 12) hour -= 12;
			this.value = pad(hour);
		},
		'h12_2-digit'({ hour }) {
			if (hour === 0) hour = 12;
			else if (hour > 12) hour -= 12;
			this.value = pad(hour, 2);
		},
		h23_numeric({ hour }) {
			this.value = pad(hour);
		},
		'h23_2-digit'({ hour }) {
			this.value = pad(hour, 2);
		},
		h24_numeric({ hour }) {
			if (hour === 0) hour = 24;
			this.value = pad(hour);
		},
		'h24_2-digit'({ hour }) {
			if (hour === 0) hour = 24;
			this.value = pad(hour, 2);
		},
	},
	month: {
		'2-digit'({ month }) {
			this.value = pad(month, 2);
		},
		numeric({ month }) {
			this.value = pad(month);
		},
		long({ month }) {
			this.val = month;
			const words = enums.month(this.locale, 'long');
			this.value = words[month - 1];
			setBaseSize(this, words);
		},
		narrow({ month }) {
			this.val = month;
			const words = enums.month(this.locale, 'narrow');
			this.value = words[month - 1];
			setBaseSize(this, words);
		},
		short({ month }) {
			this.val = month;
			const words = enums.month(this.locale, 'short');
			this.value = words[month - 1];
			setBaseSize(this, words);
		},
	},
	minute: {
		'2-digit'({ minute }) {
			this.value = pad(minute, 2);
		},
		numeric({ minute }) {
			this.value = pad(minute);
		},
	},
	second: {
		'2-digit'({ second }) {
			this.value = pad(second, 2);
		},
		numeric({ second }) {
			this.value = pad(second);
		},
	},
	weekday: {
		long({ dayOfWeek }) {
			this.val = dayOfWeek;
			const words = enums.weekday(this.locale, 'long');
			this.value = words[this.val - 1];
			setBaseSize(this, words);
		},
		short({ dayOfWeek }) {
			this.val = dayOfWeek;
			const words = enums.weekday(this.locale, 'short');
			this.value = words[this.val - 1];
			setBaseSize(this, words);
		},
		narrow({ dayOfWeek }) {
			this.val = dayOfWeek;
			const words = enums.weekday(this.locale, 'narrow');
			this.value = words[this.val - 1];
			setBaseSize(this, words);
		},
	},
	year({ year }) {
		this.value = pad(year);
	},
};

//#region Get

interface RawDatetime {
	day?: number;
	pm?: boolean;
	ms?: number;
	hour?: number;
	month?: number;
	minute?: number;
	second?: number;
	year?: number;
}

type Getter = (this: Input) => RawDatetime;

type NumGetterInitKey = Exclude<
	{
		[K in keyof RawDatetime]: RawDatetime[K] extends number | undefined
			? K
			: never;
	}[keyof RawDatetime],
	undefined
>;

interface NumGetterInit {
	/**
	 * 最小值
	 * @default 1
	 */
	min?: number;
	/**
	 * 最大值
	 * @default this.maxVal
	 */
	max?: number;
}

function createNumGetter(
	key: NumGetterInitKey,
	{ min, max }: NumGetterInit = {},
): Getter {
	min ??= 1;
	return function (this) {
		return { [key]: clamp(min, toNum(this, min), max ?? this.maxVal) };
	};
}

function createValGetter(key: NumGetterInitKey): Getter {
	return function (this) {
		return { [key]: this.val };
	};
}

const GETTER = {
	DAY: createNumGetter('day'),
	MONTH: createNumGetter('month', { max: 12 }),
	MONTH_VAL: createValGetter('month'),
	MINUTE: createNumGetter('minute', { min: 0, max: 59 }),
	SECOND: createNumGetter('second', { min: 0, max: 59 }),
	WEEKDAY: () => {},
} as const;

const GET_MAP: TypeMap<Getter> = {
	day: {
		'2-digit': GETTER.DAY,
		numeric: GETTER.DAY,
	},
	dayPeriod() {
		return { pm: this.val === 1 };
	},
	fractionalSecond: {
		1() {
			return { ms: clamp(0, toNum(this, 0), 1) * 100 };
		},
		2() {
			return { ms: clamp(0, toNum(this, 0), 10) * 10 };
		},
		3() {
			return { ms: clamp(0, toNum(this, 0), 1000) };
		},
	},
	hour: {
		h11_numeric() {
			return { hour: clamp(0, toNum(this, 0), 11) };
		},
		'h11_2-digit'() {
			return { hour: clamp(0, toNum(this, 0), 11) };
		},
		h12_numeric() {
			let hour = clamp(1, toNum(this, 12), 12);
			if (hour === 12) hour = 0;
			return { hour };
		},
		'h12_2-digit'() {
			let hour = clamp(1, toNum(this, 12), 12);
			if (hour === 12) hour = 0;
			return { hour };
		},
		h23_numeric() {
			return { hour: clamp(0, toNum(this, 0), 23) };
		},
		'h23_2-digit'() {
			return { hour: clamp(0, toNum(this, 0), 23) };
		},
		h24_numeric() {
			let hour = clamp(1, toNum(this, 24), 24);
			if (hour === 24) hour = 0;
			return { hour };
		},
		'h24_2-digit'() {
			let hour = clamp(1, toNum(this, 24), 24);
			if (hour === 24) hour = 0;
			return { hour };
		},
	},
	month: {
		'2-digit': GETTER.MONTH,
		numeric: GETTER.MONTH,
		long: GETTER.MONTH_VAL,
		narrow: GETTER.MONTH_VAL,
		short: GETTER.MONTH_VAL,
	},
	minute: {
		'2-digit': GETTER.MINUTE,
		numeric: GETTER.MINUTE,
	},
	second: {
		'2-digit': GETTER.SECOND,
		numeric: GETTER.SECOND,
	},
	weekday: {
		long: GETTER.WEEKDAY,
		short: GETTER.WEEKDAY,
		narrow: GETTER.WEEKDAY,
	},
	year() {
		return { year: Math.max(0, toNum(this, 0)) };
	},
};

//#region Step

type StepHandler = (this: Input, delta: number) => void;

interface NumStepperInit {
	/**
	 * 最小值
	 * @default 1
	 */
	min?: number;
	/**
	 * 最大值
	 * @default this.maxVal
	 */
	max?: number;
	/**
	 * 补齐长度
	 * @default 1
	 */
	length?: number;
	/** 后续操作 */
	after?: (self: Input) => any;
}

function createNumStepper({
	min,
	max,
	length,
	after,
}: NumStepperInit): StepHandler {
	min ??= 1;
	return function (this, delta) {
		this.value = pad(
			wrapInRange(toNum(this, 0) + delta, (max ?? this.maxVal) + 1, min),
			length,
		);
		after?.(this);
	};
}

const STEP_MAP: TypeMap<StepHandler> = {
	day: {
		'2-digit': createNumStepper({
			length: 2,
			after: (self) => self.host[kUpdateWeekday](),
		}),
		numeric: createNumStepper({ after: (self) => self.host[kUpdateWeekday]() }),
	},
	dayPeriod(delta) {
		if (delta % 2 === 0) return;
		this.val = this.val ? 0 : 1;
		this.value = enums.period(this.locale)[this.val];
	},
	fractionalSecond: {
		1: createNumStepper({ min: 0, max: 9 }),
		2: createNumStepper({ min: 0, max: 99, length: 2 }),
		3: createNumStepper({ min: 0, max: 999, length: 3 }),
	},
	hour: {
		h11_numeric: createNumStepper({ min: 0, max: 11 }),
		'h11_2-digit': createNumStepper({ min: 0, max: 11, length: 2 }),
		h12_numeric: createNumStepper({ max: 12 }),
		'h12_2-digit': createNumStepper({ max: 12, length: 2 }),
		h23_numeric: createNumStepper({ min: 0, max: 23 }),
		'h23_2-digit': createNumStepper({ min: 0, max: 23, length: 2 }),
		h24_numeric: createNumStepper({ max: 24 }),
		'h24_2-digit': createNumStepper({ max: 24, length: 2 }),
	},
	month: {
		'2-digit': createNumStepper({
			max: 12,
			length: 2,
			after: (self) => self.host[kUpdateDay](),
		}),
		numeric: createNumStepper({
			max: 12,
			after: (self) => self.host[kUpdateDay](),
		}),
		long(delta) {
			this.val = wrapInRange(this.val + delta, 13, 1);
			this.value = enums.month(this.locale, 'long')[this.val - 1];
			this.host[kUpdateDay]();
		},
		narrow(delta) {
			this.val = wrapInRange(this.val + delta, 13, 1);
			this.value = enums.month(this.locale, 'narrow')[this.val - 1];
			this.host[kUpdateDay]();
		},
		short(delta) {
			this.val = wrapInRange(this.val + delta, 13, 1);
			this.value = enums.month(this.locale, 'short')[this.val - 1];
			this.host[kUpdateDay]();
		},
	},
	minute: {
		'2-digit': createNumStepper({ min: 0, max: 59, length: 2 }),
		numeric: createNumStepper({ min: 0, max: 59 }),
	},
	second: {
		'2-digit': createNumStepper({ min: 0, max: 59, length: 2 }),
		numeric: createNumStepper({ min: 0, max: 59 }),
	},
	weekday: {
		long(delta) {
			this.val = wrapInRange(this.val + delta, 8, 1);
			this.value = enums.weekday(this.locale, 'long')[this.val - 1];
			this.host[kUpdateByWeekday](this.val);
		},
		short(delta) {
			this.val = wrapInRange(this.val + delta, 8, 1);
			this.value = enums.weekday(this.locale, 'short')[this.val - 1];
			this.host[kUpdateByWeekday](this.val);
		},
		narrow(delta) {
			this.val = wrapInRange(this.val + delta, 8, 1);
			this.value = enums.weekday(this.locale, 'narrow')[this.val - 1];
			this.host[kUpdateByWeekday](this.val);
		},
	},
	year(delta) {
		this.value = pad(Math.max(0, toNum(this, 0) + delta));
		this.host[kUpdateDay]();
	},
};

//#region Input

type InputHandler = (this: Input, next?: () => void) => void;

interface NumInputHandlerInit {
	min?: number;
	max?: number;
	padLength?: number;
	maxLength?: number;
	after?: (self: Input) => any;
}

function handleNumInput(
	self: Input,
	{ min, max, padLength, maxLength }: NumInputHandlerInit,
	next: () => void,
): any {
	if (self.value.length === 0) return;
	const minVal = min ?? 1;
	const maxVal = max ?? self.maxVal;
	if (self.value.length >= (maxLength ?? padLength ?? 1)) {
		self.value = pad(clamp(minVal, toNum(self, minVal), maxVal), padLength);
		return next();
	}
	const value = toNum(self, minVal);
	if (value < maxVal) return;
	self.value = pad(maxVal, padLength);
	return next();
}

function handleNumBlur(
	self: Input,
	{ min, max, padLength }: NumInputHandlerInit,
) {
	const minVal = min ?? 1;
	self.value = pad(
		clamp(minVal, toNum(self, minVal), max ?? self.maxVal),
		padLength,
	);
}

function createNumInputHandler(init: NumInputHandlerInit): InputHandler {
	return function (this, next) {
		clear(this);
		if (next) handleNumInput(this, init, next);
		else handleNumBlur(this, init);
		init.after?.(this);
	};
}

const INPUT_MAP: TypeMap<InputHandler> = {
	day: {
		'2-digit': createNumInputHandler({
			padLength: 2,
			after: (self) => self.host[kUpdateWeekday](),
		}),
		numeric: createNumInputHandler({
			maxLength: 1,
			after: (self) => self.host[kUpdateWeekday](),
		}),
	},
	dayPeriod() {
		this.value = enums.period(this.locale)[this.val];
	},
	fractionalSecond: {
		1: createNumInputHandler({ min: 0, max: 9 }),
		2: createNumInputHandler({ min: 0, max: 99, padLength: 2 }),
		3: createNumInputHandler({ min: 0, max: 999, padLength: 3 }),
	},
	hour: {
		h11_numeric: createNumInputHandler({ min: 0, max: 11, maxLength: 2 }),
		'h11_2-digit': createNumInputHandler({ min: 0, max: 11, padLength: 2 }),
		h12_numeric: createNumInputHandler({ max: 12, maxLength: 2 }),
		'h12_2-digit': createNumInputHandler({ max: 12, padLength: 2 }),
		h23_numeric: createNumInputHandler({ min: 0, max: 23, maxLength: 2 }),
		'h23_2-digit': createNumInputHandler({ min: 0, max: 23, padLength: 2 }),
		h24_numeric: createNumInputHandler({ max: 24, maxLength: 2 }),
		'h24_2-digit': createNumInputHandler({ max: 24, padLength: 2 }),
	},
	month: {
		'2-digit': createNumInputHandler({
			max: 12,
			padLength: 2,
			after: (self) => self.host[kUpdateDay](),
		}),
		numeric: createNumInputHandler({
			max: 12,
			maxLength: 2,
			after: (self) => self.host[kUpdateDay](),
		}),
		long() {
			this.value = enums.month(this.locale, 'long')[this.val - 1];
		},
		narrow() {
			this.value = enums.month(this.locale, 'narrow')[this.val - 1];
		},
		short() {
			this.value = enums.month(this.locale, 'short')[this.val - 1];
		},
	},
	minute: {
		'2-digit': createNumInputHandler({ min: 0, max: 59, padLength: 2 }),
		numeric: createNumInputHandler({ min: 0, max: 59, maxLength: 2 }),
	},
	second: {
		'2-digit': createNumInputHandler({ min: 0, max: 59, padLength: 2 }),
		numeric: createNumInputHandler({ min: 0, max: 59, maxLength: 2 }),
	},
	weekday: {
		long() {
			this.value = enums.weekday(this.locale, 'long')[this.val - 1];
		},
		short() {
			this.value = enums.weekday(this.locale, 'short')[this.val - 1];
		},
		narrow() {
			this.value = enums.weekday(this.locale, 'narrow')[this.val - 1];
		},
	},
	year: createNumInputHandler({
		min: 0,
		max: Number.POSITIVE_INFINITY,
		maxLength: 4,
		after: (self) => self.host[kUpdateDay](),
	}),
};

//#region #Render

const READONLY_KEYS = new Set<string | number>(['long', 'short', 'narrow']);

const hostLocale: PropertyDescriptor & ThisType<Input> = {
	get() {
		return this.host.currentLocale;
	},
};

function $input(host: DatetimePicker, opt: RenderedOption): Input {
	const key = opt.fmt ?? FALLBACK_MAP[opt.type];
	let get = GET_MAP[opt.type] as Getter;
	let set = SET_MAP[opt.type] as Setter;
	let handleStep = STEP_MAP[opt.type] as StepHandler;
	let handleInput = INPUT_MAP[opt.type] as InputHandler;
	if (typeof get !== 'function') {
		get = (get as any)[key];
		set = (set as any)[key];
		handleStep = (handleStep as any)[key];
		handleInput = (handleInput as any)[key];
	}
	const input = $new<Input, 'input'>('input', {
		class: typeof key === 'number' ? `${opt.type}-${key}` : [opt.type, key],
		attr: { nav: true },
		props: {
			opt,
			val: 0,
			navParent: host,
			host,
			get,
			set,
			handleStep,
			handleInput,
		},
		readOnly: opt.type === 'dayPeriod' || READONLY_KEYS.has(key),
	});
	Object.defineProperty(input, 'locale', hostLocale);
	return input;
}

function renderPart(
	host: DatetimePicker,
	part: DatetimePickerPart,
): Node | string {
	if (typeof part === 'string') return part;
	// if (part.type === 'literal') return part.fmt ?? '';
	if (!(part.type in GET_MAP)) return String(part.fmt ?? '');
	return $input(host, { type: part.type, fmt: part.fmt } as RenderedOption);
}

//#region #Main
export interface DatetimePickerProps extends FormControlProps<DatetimePicker> {}

const DATE_TYPE = new Set(['year', 'month', 'day']);
const DAY_TYPE = new Set(['day', 'weekday']);

/** 从星期更新年月日 */
const kUpdateByWeekday = Symbol();
/** 更新星期 */
const kUpdateWeekday = Symbol();
/** 更新星期和日期 */
const kUpdateDay = Symbol();
/** 当前值（缓存） */
const kValue = Symbol();

/**
 * 时间日期选择器
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form/datetime)
 */
@register('datetime-picker')
@defineElement('abm-datetime-picker')
export class DatetimePicker
	extends FormControl<TemporalNS.ZonedDateTime, DatetimePickerProps>
	implements Navigable
{
	protected static style = css`
		abm-segment-input {
			display: flex;
			align-items: center;
			gap: .5ex;
		}
		input { --s: 2; width: calc(var(--s) * 1ex + 1.5ex) }
		.fractionalSecond-3 { --s: 3 }
		.year { --s: 4 }
		:host([invalid])>* {
			color: var(--danger-fg);
			--ui-bg: var(--danger-bg);
			--ui-bg-hover: var(--danger-bg-hover);
			--ui-bg-active: var(--danger-bg-active);
		}
	`;
	#input = $new(SegmentInput, {
		slidable: true,
		scrollable: true,
		handleStep: (input, delta) => (input as Input).handleStep(delta),
		handleInput: (input, next) => (input as Input).handleInput(next),
		handleBlur: (input) => (input as Input).handleInput(),
		$input: () => this.emitUpdate(),
		$change: () => this.emitUpdate(true),
		$submit: () => this.emit('submit'),
	});
	constructor(_props?: DatetimePickerProps) {
		super();
		this.attachShadow({}, this.#input);
		this.#setParts(...intlPart(this.currentLocale, this.intlOptions));
		this.value = this.default;
	}
	protected connectedCallback(): void {
		super.connectedCallback();
		locale.on('update', this.#handleLocaleUpdate);
		this.#handleLocaleUpdate();
	}
	protected disconnectedCallback(): void {
		super.disconnectedCallback();
		locale.off('update', this.#handleLocaleUpdate);
	}
	#handleLocaleUpdate = () => {
		if (this.#locale !== undefined) return;
		if (this.intlOptions) this.#setPartsByIntlOptions();
		else this.value = this.value;
	};
	/** 获取所有输入框 */
	#$$() {
		return $$<Input>('input', this.#input);
	}
	/** 获取当前日期 */
	#getDate() {
		let raw: RawDatetime = {};
		for (const input of this.#$$()) {
			if (DATE_TYPE.has(input.opt.type)) raw = Object.assign(raw, input.get());
		}
		const current = this[kValue];
		return Temporal.ZonedDateTime.from({
			timeZone: current.timeZoneId,
			year: raw.year ?? current.year,
			month: raw.month ?? current.month,
			day: raw.day ?? current.day,
		});
	}
	/** 从星期更新年月日 */
	[kUpdateByWeekday](weekday: number): void {
		const prev = this.#getDate();
		const now = prev.add(
			Temporal.Duration.from({ days: weekday - prev.dayOfWeek }),
		);
		for (const input of this.#$$()) {
			if (DATE_TYPE.has(input.opt.type)) input.set(now);
		}
	}
	/** 更新星期 */
	[kUpdateWeekday]() {
		const date = this.#getDate();
		for (const input of this.#$$()) {
			if (input.opt.type === 'weekday') input.set(date);
		}
	}
	/** 更新星期和日期 */
	[kUpdateDay]() {
		const date = this.#getDate();
		for (const input of this.#$$()) {
			if (DAY_TYPE.has(input.opt.type)) input.set(date);
		}
	}
	#setParts(...parts: DatetimePickerPart[]): void {
		this.#input.replaceChildren(...parts.map((part) => renderPart(this, part)));
	}
	/** 设置部分 */
	setParts(...parts: DatetimePickerPart[]): void {
		const { value } = this;
		this.#setParts(...parts);
		this.value = value;
	}
	/** 根据国际化格式化参数设置部分 */
	#setPartsByIntlOptions() {
		this.setParts(...intlPart(this.currentLocale, this.intlOptions));
	}
	@toType(Boolean)
	get disabled() {
		return super.disabled;
	}
	set disabled(value) {
		if (super.disabled === value) return;
		super.disabled = value;
		this.#input.disabled = value;
	}
	@property({ toValue: toDatetime })
	@typeCheck(Temporal.ZonedDateTime)
	accessor default = Temporal.Now.zonedDateTimeISO();
	/** 当前值（缓存） */
	[kValue]!: TemporalNS.ZonedDateTime;
	@property({ toValue: toDatetime })
	@typeCheck(Temporal.ZonedDateTime)
	get value() {
		let raw: RawDatetime = {};
		for (const input of this.#$$()) {
			raw = Object.assign(raw, input.get());
		}
		const current = this[kValue];
		this[kValue] = Temporal.ZonedDateTime.from({
			timeZone: current.timeZoneId,
			year: raw.year ?? current.year,
			month: raw.month ?? current.month,
			day: raw.day ?? current.day,
			hour: raw.hour ? raw.hour + (raw.pm ? 12 : 0) : undefined,
			minute: raw.minute,
			second: raw.second,
			millisecond: raw.ms,
		});
		return this[kValue];
	}
	set value(value) {
		this[kValue] = value;
		for (const input of this.#$$()) input.set(value);
	}
	#locale?: string;
	/**
	 * 地区
	 * @description
	 * 当地区设置为 `undefined` 时根据 {@link locale} 自动调整；
	 * 若有设置 {@link intlOptions}，则当切换地区时自动更新
	 */
	@property()
	@typeCheck(String, undefined)
	get locale() {
		return this.#locale;
	}
	set locale(value) {
		this.#locale = value;
		if (this.intlOptions) this.#setPartsByIntlOptions();
		else this.value = this.value;
	}
	/** 当前的地区设置 */
	get currentLocale() {
		return this.#locale ?? getLocale();
	}
	/**
	 * 国际化格式化选项
	 * @description
	 * 修改该项不会更新，仅用于根据地区设置自动切换
	 * @default {dateStyle:'short',timeStyle:'short'}
	 */
	intlOptions?: Intl.DateTimeFormatOptions = {
		dateStyle: 'short',
		timeStyle: 'short',
	};
	get navChildren() {
		return $$('input', this.#input);
	}
	/** 日期选择器 */
	static Date(options?: DatetimePickerProps): DatetimePicker {
		if (!options) options = {};
		options.intlOptions ??= { dateStyle: 'short' };
		return $new(DatetimePicker, options);
	}
	/** 时间选择器 */
	static Time(options?: DatetimePickerProps): DatetimePicker {
		if (!options) options = {};
		options.intlOptions ??= { timeStyle: 'short' };
		return $new(DatetimePicker, options);
	}
	/** 从国际化格式化选项生成部分 */
	static toParts(
		intlOptions: Intl.DateTimeFormatOptions,
		locale?: string,
	): DatetimePickerPart[] {
		return intlPart(locale ?? getLocale(), intlOptions);
	}
	/** 从国际化格式化选项创建时间日期选择器 */
	static fromIntl(
		intlOptions: Intl.DateTimeFormatOptions,
		locale?: string,
		options?: DatetimePickerProps,
	): DatetimePicker {
		if (!options) options = {};
		options.intlOptions ??= intlOptions;
		if (locale) options.locale ??= locale;
		return $new(DatetimePicker, options);
	}
	static fromParts(
		parts: DatetimePickerPart[],
		options?: DatetimePickerProps,
	): DatetimePicker {
		const picker = $new(DatetimePicker, options);
		picker.intlOptions = undefined;
		picker.setParts(...parts);
		return picker;
	}
}
