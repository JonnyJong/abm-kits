import {
	type ArrayOr,
	clamp,
	formatWithStep,
	range,
	steppedClamp,
	type Vec2,
	Vector2,
} from 'abm-utils';
import { defineElement, property } from '../infra/decorator';
import type { ElementProps } from '../infra/dom';
import { $div } from '../infra/dom';
import { $on } from '../infra/event';
import { type InteractionSource } from '../infra/interaction';
import { css } from '../infra/style';
import { MovementController, type MovementEvent } from '../movement';
import { type Navigable, type NavState, navigate } from '../navigate/index';
import { state } from '../state';
import { tooltip } from '../widget/tooltip';
import type { AriaConfig } from './base';
import { FormControl } from './form';

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-slider': Slider<ArrayOr<number>>;
	}
}

export interface SliderProp<T extends ArrayOr<number>>
	extends ElementProps<Slider<T>> {}

type Thumb = HTMLDivElement & Navigable;
type ThumbIndex = number;
type Tick = HTMLDivElement;

const PART = {
	HOVER: 'hover',
	ACTIVE: 'active',
	LOGIC: 'logic',
	TICK: 'tick',
} as const;

function ratio(value: number, start: number, end: number): number {
	return (value - start) / (end - start);
}

function computeTicks(
	tick: ArrayOr<number>,
	start: number,
	end: number,
): number[] {
	if (Number.isFinite(tick)) {
		let step = Math.abs(tick as number);
		if (!step) return [];
		if (end < start) step *= -1;
		return range(start + step, end, step).map((v) => ratio(v, start, end));
	}
	if (!Array.isArray(tick)) return [];
	tick = tick.filter((v) => Number.isFinite(v) && v === clamp(start, v, end));
	return tick.map((v) => ratio(v, start, end));
}

//#region Main
/**
 * 滑动选择器
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form/slider)
 */
@defineElement('abm-slider')
export class Slider<T extends ArrayOr<number>>
	extends FormControl<T, SliderProp<T>>
	implements Navigable
{
	protected static style = css`
		:host {
			display: block;
			position: relative;
			width: 100%;
			height: 32px;
			padding: 12px 0;
		}
		.track {
			position: relative;
			width: 100%;
			height: 100%;
			background: var(--ui-bg);
			border-radius: var(--border-radius);
			overflow: clip;
		}
		.anchor { position: absolute }
		.start { inset-inline-start: 4px }
		.end { inset-inline-end: 4px }
		.fill {
			position: absolute;
			inset-inline-start: var(--offset, 0%);
			width: var(--size, 0%);
			height: 100%;
			background: var(--primary);
			transition: .1s width, .1s inset;
		}
		.tick {
			position: absolute;
			inset-inline-start: calc((100% - 8px) * var(--tick, 0));
			bottom: 0;
			height: 100%;
			width: 1px;
			background: var(--fg);
			opacity: .5;
		}
		.thumb {
			--size: 8px;
			--offset: calc((100% - var(--size)) * var(--ratio, 0));
			position: absolute;
			top: 50%;
			inset-inline-start: var(--offset);
			width: var(--size);
			height: var(--size);
			background: var(--primary);
			border-radius: var(--border-radius-max);
			outline: 2px solid var(--fg);
			translate: 0 -50%;
			transition: .1s inset, .1s scale;
			z-index: 1;
		}
		:host([vertical]) {
			width: 32px;
			height: 100%;
			padding: 0 12px;
		}
		:host([vertical]) .fill {
			inset-inline-start: unset;
			bottom: var(--offset, 0%);
			height: var(--size, 0%);
			width: 100%;
			transition: .1s height, .1s bottom;
		}
		:host([vertical]) .start {
			bottom: 4px
		}
		:host([vertical]) .end {
			inset-inline-start: unset;
			top: 4px;
			left: 4px;
			right: unset;
		}
		:host([vertical]) .tick {
			inset-inline-start: unset;
			left: 0;
			bottom: calc((100% - 8px) * var(--tick, 0));
			width: 100%;
			height: 1px;
		}
		:where(:host([vertical])) .thumb {
			inset-inline-start: unset;
			top: unset;
			left: 50%;
			bottom: var(--offset);
			translate: -50% 0;
			transition: .1s bottom, .1s scale;
		}
		[hover], [part*="hover"] { scale: 1.3 }
		:host([disabled]) [hover], [part*="active"] { scale: 1 }
		[part*="active"]:not([part*="logic"]) { transition: .1s scale }
		[part*="active"]:not([part*="logic"])~.track .fill { transition: none }
	`;
	protected static aria: AriaConfig = { role: 'group' };
	#fill = $div({ className: 'fill', part: 'fill' });
	#startAnchor = $div({ className: 'anchor start' });
	#endAnchor = $div({ className: 'anchor end' });
	#track = $div(
		{ className: 'track', part: 'track' },
		this.#fill,
		this.#startAnchor,
		this.#endAnchor,
	);
	#ticks: Tick[] = [];
	#thumbs: Thumb[] = [];
	#moves: MovementController<number, Thumb>[] = [];
	#value: number[] = [0];
	#default: number[] = [];
	#hovering = new Map<InteractionSource, ThumbIndex>();
	#start = 0;
	#end = 1;
	#step = 0;
	#preferNumber = true;
	constructor(_props?: SliderProp<T>) {
		super();
		$on(this, 'pointermove', this.#handlePointerMove);
		$on(this, 'pointerleave', this.#handlePointerLeave);
		$on(this, 'pointerdown', this.#handlePointerDown);
		$on(this, 'touchstart', this.#handleTouchStart);
		this.attachShadow({}, this.#track);
		this.#createThumb(0);
	}
	#clamp = (value: number) =>
		steppedClamp(this.start, this.end, value, this.step);
	#ratio(value: number): number {
		return ratio(value, this.#start, this.#end);
	}
	#createThumb(value: number) {
		const thumb: Thumb = $div({
			className: 'thumb',
			part: 'thumb',
			tabIndex: -1,
			role: 'slider',
			ariaValueMin: String(this.#start),
			ariaValueMax: String(this.#end),
			ariaValueNow: String(value),
		});
		this.#updateTooltip(thumb, value);

		const move = new MovementController<number, Thumb>(
			{
				value: () => this.#value[this.#thumbs.indexOf(thumb)],
				start: () => this.#start,
				end: () => this.#end,
				step: () => this.#step,
				penStartDelay: 0,
				touchStartDelay: 0,
			},
			{
				handler: (event) => this.#handleMoveEvent(event, thumb),
				check: () =>
					Vector2.sub(
						this.#position(this.#endAnchor),
						this.#position(this.#startAnchor),
					),
				axis: () => ({ o: this.#startAnchor, x: this.#endAnchor }),
			},
		);
		thumb.setAttribute('nav', '');
		thumb.navParent = this;
		thumb.navCallback = (state) => this.#handleNav(thumb, state);
		state.hover.add(thumb);
		state.active.add(thumb);
		this.#thumbs.push(thumb);
		this.#track.before(thumb);
		this.#moves.push(move);
		this.#default.push(value);
	}
	//#region View
	#updateTooltip(thumb: Thumb, value: number) {
		const text = this.tooltipFormatter
			? this.tooltipFormatter(value)
			: formatWithStep(value, this.#step);
		tooltip.set(thumb, String(text));
	}
	#updateValue(value: number[]) {
		const count = value.length;
		while (this.#thumbs.length < count) {
			this.#createThumb(value[this.#thumbs.length]);
		}
		if (this.#thumbs.length === count) {
			this.#updateThumbs();
			this.#updateFill();
			return;
		}
		for (const thumb of this.#thumbs.slice(count)) thumb.remove();
		for (const move of this.#moves.slice(count)) move.stop();
		this.#thumbs = this.#thumbs.slice(0, count);
		this.#moves = this.#moves.slice(0, count);
		this.#default = this.#default.slice(0, count);
		this.#updateThumbs();
		this.#updateFill();
	}
	#updateHover() {
		const indexes = new Set<ThumbIndex>();
		for (const index of this.#hovering.values()) {
			indexes.add(index);
		}
		for (const [index, thumb] of this.#thumbs.entries()) {
			thumb.part.toggle(PART.HOVER, indexes.has(index));
		}
	}
	#updateFill() {
		let min = this.#ratio(Math.min(...this.#value)) * 100;
		let max = this.#ratio(Math.max(...this.#value)) * 100;
		if (min > max) [min, max] = [max, min];
		if (this.#value.length === 1) min = 0;
		this.#fill.style.setProperty('--offset', `${min}%`);
		this.#fill.style.setProperty('--size', `${max - min}%`);
	}
	#updateThumbs(index?: number) {
		const thumbs = this.#thumbs
			.map<[Thumb, ThumbIndex]>((thumb, index) => [thumb, index])
			.filter(([_, i]) => index === undefined || index === i);
		for (const [thumb, index] of thumbs) {
			const value = this.#value[index];
			const ratio = this.#ratio(value);
			thumb.style.setProperty('--ratio', String(ratio));
			this.#updateTooltip(thumb, value);
			thumb.ariaValueNow = String(value);
		}
	}
	#updateTick() {
		const ticks = computeTicks(this.#tick, this.#start, this.#end);
		for (const tick of this.#ticks.slice(ticks.length)) tick.remove();
		this.#ticks = this.#ticks.slice(0, ticks.length);
		for (const [index, value] of ticks.entries()) {
			let tick = this.#ticks[index];
			if (!tick) {
				tick = $div({ className: PART.TICK, part: PART.TICK });
				this.#track.append(tick);
			}
			tick.style.setProperty('--tick', String(value));
		}
	}
	#updateView() {
		this.#updateThumbs();
		this.#updateFill();
		this.#updateTick();
	}
	//#region Handle
	#position(thumb: HTMLElement): Vec2 {
		const { left, right, top, bottom } = thumb.getBoundingClientRect();
		return [(left + right) / 2, (top + bottom) / 2];
	}
	#handleLeave(source: InteractionSource) {
		if (!this.#hovering.delete(source)) return;
		this.#updateHover();
	}
	#handleMove(source: InteractionSource, position: Vec2) {
		if (this.#moves.find((move) => move.source === source)) return;
		let i = -1;
		let distance = Number.POSITIVE_INFINITY;
		for (const [index, thumb] of this.#thumbs.entries()) {
			if (this.#moves[index].moving) continue;
			const vec = this.#position(thumb);
			const length = Vector2.length(vec, position);
			if (length >= distance) continue;
			i = index;
			distance = length;
		}
		this.#hovering.set(source, i);
		this.#updateHover();
	}
	#handleDown(source: InteractionSource, position: Vec2): boolean {
		this.#handleMove(source, position);
		const index = this.#hovering.get(source);
		if (index === undefined || index === -1) return false;
		const move = this.#moves[index];
		if (move.moving) return false;
		move.start({ source, position });
		return move.source === source;
	}
	#handlePointerLeave = (event: PointerEvent) => {
		if (event.pointerType !== 'mouse') return;
		this.#handleLeave('mouse');
	};
	#handlePointerMove = (event: PointerEvent) => {
		if (this.disabled) return;
		if (event.pointerType !== 'mouse') return;
		this.#handleMove('mouse', [event.x, event.y]);
	};
	#handlePointerDown = (event: PointerEvent) => {
		if (this.disabled) return;
		if (event.pointerType !== 'mouse') return;
		const started = this.#handleDown('mouse', [event.x, event.y]);
		if (started) event.preventDefault();
	};
	#handleTouchStart = (event: TouchEvent) => {
		if (this.disabled) return;
		const { identifier, clientX, clientY } = event.changedTouches[0];
		this.#handleDown(identifier, [clientX, clientY]);
	};
	#handleNav(thumb: Thumb, state: NavState) {
		if (this.disabled) return;
		const index = this.#thumbs.indexOf(thumb);
		const move = this.#moves[index];
		if (state.type === 'active') {
			if (state.down) return;
			if (move.moving) return move.stop();
			const start = this.#position(this.#startAnchor);
			const end = this.#position(this.#endAnchor);
			const [x, y] = Vector2.sub(end, start);
			let value = this.#value[index];
			if (Math.abs(x) > Math.abs(y) ? x < 0 : y < 0) {
				value = this.#start + this.#end - value;
			}
			move.start();
			thumb.part.add(PART.ACTIVE, PART.LOGIC);
			navigate.lock(thumb);
			return;
		}
		if (state.type === 'cancel') return move.stop(true);
		if (state.type === 'blur') return move.stop();
		if (state.type === 'nav') {
			move.stop();
			navigate.nav(state.direction);
			return;
		}
		move.handleNav(state);
	}
	#handleMoveEvent(event: MovementEvent<number, Thumb>, thumb: Thumb) {
		if (event.state === 'start') {
			tooltip.lock(thumb);
		} else if (event.state === 'moving') {
			thumb.part.add(PART.ACTIVE);
		}
		const index = this.#thumbs.indexOf(thumb);
		this.#value[index] = event.value;
		this.#updateThumbs(index);
		this.#updateFill();
		this.emitUpdate();
		if (!event.end) return;
		tooltip.unlock(thumb);
		thumb.part.remove(PART.ACTIVE, PART.LOGIC);
		navigate.unlock();
		if (event.state === 'end') this.emitUpdate(true);
	}
	//#region Prop
	#updateRange() {
		this.#value = this.#value.map(this.#clamp);
		this.#updateView();
		const min = String(this.#start);
		const max = String(this.#end);
		for (const thumb of this.#thumbs) {
			thumb.ariaValueMin = min;
			thumb.ariaValueMax = max;
		}
	}
	get disabled() {
		return super.disabled;
	}
	set disabled(value: boolean) {
		super.disabled = value;
		if (!super.disabled) return;
		this.#hovering.clear();
		for (const thumb of this.#thumbs) {
			thumb.part.remove(PART.HOVER);
		}
		for (const move of this.#moves) {
			move.stop();
		}
	}
	@property({ reflect: true, toValue: Boolean })
	accessor vertical = false;
	#tick: ArrayOr<number> = 0;
	get tick() {
		if (Array.isArray(this.#tick)) return [...this.#tick];
		return this.#tick;
	}
	set tick(value) {
		this.#tick = Array.isArray(value) ? [...value] : value;
		this.#updateTick();
	}
	get default() {
		const sign = this.#start < this.#end ? 1 : -1;
		return this.#default.length === 1 && this.#preferNumber
			? (this.#default[0] as T)
			: ([...this.#default].sort((a, b) => (a - b) * sign) as T);
	}
	set default(value) {
		if (Number.isFinite(value)) {
			this.#default.fill(value as number);
			return;
		}
		if (!Array.isArray(value)) return;
		if (value.some((v) => !Number.isFinite(v))) return;
		for (const [i, v] of value.entries()) {
			if (i >= this.#default.length) return;
			this.#default[i] = v;
		}
	}
	get value() {
		const sign = this.#start < this.#end ? 1 : -1;
		return this.#value.length === 1 && this.#preferNumber
			? (this.#value[0] as T)
			: ([...this.#value].sort((a, b) => (a - b) * sign) as T);
	}
	set value(value) {
		if (typeof value === 'number') {
			this.#value = [this.#clamp(value)];
			this.#preferNumber = true;
			this.#updateValue([value]);
			return;
		}
		if (!Array.isArray(value)) return;
		const values = value.map(Number);
		if (values.some((v) => !Number.isFinite(v))) return;
		this.#value = values.map(this.#clamp);
		this.#preferNumber = false;
		this.#updateValue(values);
	}
	/** 起始值 */
	@property({ toValue: Number })
	get start() {
		return this.#start;
	}
	set start(value) {
		if (value === this.#start) return;
		if (!Number.isFinite(value)) return;
		this.#start = value;
		this.#updateRange();
	}
	/** 结束值 */
	@property({ toValue: Number })
	get end() {
		return this.#end;
	}
	set end(value) {
		if (value === this.#end) return;
		if (!Number.isFinite(value)) return;
		this.#end = value;
		this.#updateRange();
	}
	/** 步长 */
	@property({ toValue: Number })
	get step() {
		return this.#step;
	}
	set step(value) {
		if (value === this.#step) return;
		if (!Number.isFinite(value)) return;
		this.#step = value;
		this.#updateRange();
	}
	/** 工具提示格式化 */
	accessor tooltipFormatter: ((value: number) => string) | undefined;
	get navChildren() {
		const sign = this.#start < this.#end ? 1 : -1;
		return [...this.#thumbs.entries()]
			.sort(([a], [b]) => this.#value[a] - this.#value[b] * sign)
			.map(([, t]) => t);
	}
	protected clone(from: this): void {
		this.start = from.start;
		this.end = from.end;
		this.step = from.step;
		this.tick = from.tick;
		super.clone(from);
	}
}
