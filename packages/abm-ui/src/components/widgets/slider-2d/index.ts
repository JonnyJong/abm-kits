import {
	$div,
	EventValue,
	EventValueInit,
	EventsList,
	Throttle,
	Vec2,
	clamp,
	createClampedStepper,
	css,
	formatWithStep,
} from 'abm-utils';
import { customElement, property } from 'lit/decorators.js';
import { events, UIEventSlide } from '../../../events';
import { Slidable, SlideBorder } from '../../../events/slide';
import { KeyboardEvents, keyboard } from '../../../keyboard';
import {
	Navigable,
	NavigateCallbackOptions,
	navigate,
} from '../../../navigate';
import { tooltips } from '../../tooltips';
import { Widget } from '../base';
import CSS from './index.styl';

interface WidgetSlider2DEventsInit {
	/** 输入事件 */
	input: EventValueInit<WidgetSlider2D, Vec2>;
	/** 更改事件 */
	change: EventValueInit<WidgetSlider2D, Vec2>;
}

export interface WidgetSlider2DEvents
	extends EventsList<WidgetSlider2DEventsInit> {}

export interface WidgetSlider2DProp {
	x?: number;
	y?: number;
	minX?: number;
	maxX?: number;
	minY?: number;
	maxY?: number;
	stepX?: number;
	stepY?: number;
	/** 禁用 */
	disabled?: boolean;
}

@customElement('w-slider-2d')
export class WidgetSlider2D
	extends Widget<WidgetSlider2DEventsInit>
	implements Navigable, Slidable
{
	static styles = css(CSS);
	#pointer = $div({ class: 'pointer' });
	#xClampedStepper = createClampedStepper(0, 100);
	#yClampedStepper = this.#xClampedStepper;
	constructor() {
		super(['input', 'change'], true);

		tooltips.set(this, '0, 0');

		events.hover.add(this);
		events.slide.on(this, this.#slideHandler);
	}
	#updateMinMaxStepX() {
		const stroke = this.#maxX - this.#minX;
		this.#digitalStepX = this.#stepX;
		if (!this.#digitalStepX) this.#digitalStepX = stroke <= 1 ? stroke / 100 : 1;

		this.#xClampedStepper = createClampedStepper(
			this.#minX,
			this.#maxX,
			this.#digitalStepX,
		);
		this.#x = this.#xClampedStepper(this.#x);
		this.#updateView();
	}
	#updateMinMaxStepY() {
		const stroke = this.#maxY - this.#minY;
		this.#digitalStepY = this.#stepY;
		if (!this.#digitalStepY) this.#digitalStepY = stroke <= 1 ? stroke / 100 : 1;

		this.#yClampedStepper = createClampedStepper(
			this.#minY,
			this.#maxY,
			this.#digitalStepY,
		);
		this.#y = this.#yClampedStepper(this.#y);
		this.#updateView();
	}
	//#region View
	protected render() {
		return this.#pointer;
	}
	#updateView = Throttle.new(() => {
		const strokeX = this.#maxX - this.#minX;
		const offsetX = this.#x - this.#minX;
		const percentX = (offsetX / strokeX) * 100;
		const strokeY = this.#maxY - this.#minY;
		const offsetY = this.#y - this.#minY;
		const percentY = (offsetY / strokeY) * 100;
		this.#pointer.style.left = `${percentX}%`;
		this.#pointer.style.top = `${percentY}%`;
		this.#updateTooltips();
	});
	#updateTooltips(x = this.#x, y = this.#y) {
		tooltips.set(
			this,
			`${formatWithStep(x, this.#stepX)}, ${formatWithStep(y, this.#stepY)}`,
		);
	}
	//#region Properties
	@property({ type: Boolean, reflect: true }) accessor disabled = false;
	#x = 0;
	#y = 0;
	#minX = 0;
	#maxX = 100;
	#minY = 0;
	#maxY = 100;
	#stepX = 0;
	#stepY = 0;
	#digitalStepX = 1;
	#digitalStepY = 1;
	@property({ type: Number })
	get x() {
		return this.#x;
	}
	set x(value) {
		if (this.#x === value) return;
		this.#x = this.#xClampedStepper(value);
		this.#updateView();
	}
	@property({ type: Number })
	get y() {
		return this.#y;
	}
	set y(value) {
		if (this.#y === value) return;
		this.#y = this.#yClampedStepper(value);
		this.#updateView();
	}
	@property({ type: Number })
	get minX() {
		return this.#minX;
	}
	set minX(value) {
		if (this.#minX === value) return;
		this.#minX = value;
		this.#updateMinMaxStepX();
	}
	@property({ type: Number })
	get maxX() {
		return this.#maxX;
	}
	set maxX(value) {
		if (this.#maxX === value) return;
		this.#maxX = value;
		this.#updateMinMaxStepX();
	}
	@property({ type: Number })
	get minY() {
		return this.#minY;
	}
	set minY(value) {
		if (this.#minY === value) return;
		this.#minY = value;
		this.#updateMinMaxStepY();
	}
	@property({ type: Number })
	get maxY() {
		return this.#maxY;
	}
	set maxY(value) {
		if (this.#maxY === value) return;
		this.#maxY = value;
		this.#updateMinMaxStepY();
	}
	@property({ type: Number })
	get stepX() {
		return this.#stepX;
	}
	set stepX(value) {
		if (this.#stepX === value) return;
		this.#stepX = value;
		this.#updateMinMaxStepX();
	}
	@property({ type: Number })
	get stepY() {
		return this.#stepY;
	}
	set stepY(value) {
		if (this.#stepY === value) return;
		this.#stepY = value;
		this.#updateMinMaxStepY();
	}
	//#region Events
	#tempX = 0;
	#tempY = 0;
	#emit(change: boolean) {
		this.events.emit(
			new EventValue(change ? 'change' : 'input', {
				target: this,
				value: change ? [this.#x, this.#y] : [this.#tempX, this.#tempY],
			}),
		);
	}
	#applySlide(x: number, y: number): Vec2 {
		const { left, width, top, height } = this.getBoundingClientRect();
		const percentX = clamp(0, (x - left) / width, 1);
		const percentY = clamp(0, (y - top) / height, 1);
		this.#tempX = this.#xClampedStepper(
			percentX * (this.#maxX - this.#minX) + this.#minX,
		);
		this.#tempY = this.#yClampedStepper(
			percentY * (this.#maxY - this.#minY) + this.#minY,
		);
		return [percentX, percentY];
	}
	#applyDigitalSlide(x: number, y: number): Vec2 {
		this.#tempX = this.#xClampedStepper(x);
		this.#tempY = this.#yClampedStepper(y);
		const strokeX = this.#maxX - this.#minX;
		const strokeY = this.#maxY - this.#minY;
		const offsetX = this.#tempX - this.#minX;
		const offsetY = this.#tempY - this.#minY;
		return [offsetX / strokeX, offsetY / strokeY];
	}
	#slideHandler(event: UIEventSlide) {
		if (this.disabled) return;

		// Start
		if (event.state === 'start') {
			keyboard.on('aliasPress', this.#aliasPressHandler);
			tooltips.lock(this);
		}

		// Slide
		let x: number;
		let y: number;
		if (event.pointer) {
			this.#pointer.classList.toggle('sliding', event.state === 'move');
			[x, y] = this.#applySlide(event.x, event.y);
		} else {
			[x, y] = this.#applyDigitalSlide(event.x, event.y);
		}

		this.#pointer.style.left = `${x * 100}%`;
		this.#pointer.style.top = `${y * 100}%`;
		this.#updateTooltips(this.#tempX, this.#tempY);

		// Moving
		if (event.state !== 'end') {
			this.#emit(false);
			return;
		}

		// End
		keyboard.off('aliasPress', this.#aliasPressHandler);
		this.#x = this.#tempX;
		this.#y = this.#tempY;
		this.#updateView();
		tooltips.unlock();
		this.#emit(true);
	}
	#aliasPressHandler = (event: KeyboardEvents['aliasPress']) => {
		if (event.key !== 'ui.cancel') return;
		keyboard.off('aliasPress', this.#aliasPressHandler);
		events.slide.cancel(this);
		this.#pointer.classList.remove('sliding');
		this.#updateView();
		tooltips.unlock();
		this.#tempX = this.#x;
		this.#tempY = this.#y;
		this.#emit(false);
	};
	navCallback({ active, cancel }: NavigateCallbackOptions) {
		if (this.disabled) return;
		// Active
		if (active === false) {
			const locking = navigate.locking;
			navigate.lock(locking ? null : this.#pointer);
			// Start
			if (!(locking || cancel)) {
				tooltips.lock(this);
				events.slide.start(this, -2, this.#x, this.#y);
				return;
			}
			// Confirm
			tooltips.unlock();
			events.slide.cancel(this);
			this.#x = this.#tempX;
			this.#y = this.#tempY;
			this.#emit(true);
			return;
		}
		// Cancel
		if (cancel) {
			navigate.lock(null);
			this.#updateView();
			tooltips.unlock();
			events.slide.cancel(this);
			this.#emit(false);
		}
	}
	get nonNavigable() {
		return this.disabled;
	}
	get slideBorder(): SlideBorder {
		return [this.#minX, this.#maxX, this.#minY, this.#maxY];
	}
	get digitalXStep() {
		return this.#digitalStepX;
	}
	get digitalYStep() {
		return this.#digitalStepY;
	}
	get joystickXSpeedFactor() {
		return this.#digitalStepX * 50;
	}
	get joystickYSpeedFactor() {
		return this.#digitalStepY * 50;
	}
	cloneNode(deep?: boolean): WidgetSlider2D {
		const node = super.cloneNode(deep) as WidgetSlider2D;

		node.minX = this.#minX;
		node.maxX = this.#maxX;
		node.stepX = this.#stepX;
		node.x = this.#x;
		node.minY = this.#minY;
		node.maxY = this.#maxY;
		node.stepY = this.#stepY;
		node.y = this.#y;
		node.disabled = this.disabled;

		return node;
	}
}
