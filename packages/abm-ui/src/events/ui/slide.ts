import {
	Direction4,
	RepeatingTriggerController,
	Vec2,
	Vector2,
	callTask,
	clamp,
} from 'abm-utils';
import { GameController } from '../../game-controller';
import { KeyboardEvents, keyboard } from '../../keyboard';
import { EventBase } from '../api/base';
import { IUIEventBase, IUIEventBaseManage, IUIEventHandler } from './base';

export type SlideBorder = [
	left: number,
	right: number,
	top: number,
	bottom: number,
];

export interface Slidable extends HTMLElement {
	/** 使用按钮触发滑动时，X 方向的步长 */
	digitalXStep?: number;
	/** 使用按钮触发滑动时，Y 方向的步长 */
	digitalYStep?: number;
	/** 摇杆 X 方向速度因数 */
	joystickXSpeedFactor?: number;
	/** 摇杆 X 方向速度因数 */
	joystickYSpeedFactor?: number;
	/** 滑动边界，仅限键盘、游戏控制器等无指针滑动 */
	slideBorder?: SlideBorder;
}

export type UIEventSlideState = 'start' | 'move' | 'end';

export type UIEventSlideHandler = IUIEventHandler<
	'slide',
	Slidable,
	UIEventSlide
>;

type SubscriptionMap = WeakMap<Slidable, Set<UIEventSlideHandler>>;
type SlideInfo = {
	identifier: number;
	/** 起始 X */
	x: number;
	/** 起始 Y */
	y: number;
	dx: number;
	dy: number;
};
type ActivatedMap = Map<Slidable, SlideInfo>;

interface UIEventSlideInit {
	info: SlideInfo;
	digital?: boolean;
	direction?: Direction4;
	vector?: Vector2;
	power?: number;
	powerX?: number;
	powerY?: number;
}

interface EmitOptions {
	digital?: boolean;
	/** 起始 X */
	x?: number;
	/** 起始 Y */
	y?: number;
	dx?: number;
	dy?: number;
	direction?: Direction4;
	vector?: Vector2;
	power?: number;
	powerX?: number;
	powerY?: number;
}

function aliasToDirection(alias: string): Direction4 | null {
	switch (alias) {
		case 'ui.up':
			return 'up';
		case 'ui.down':
			return 'down';
		case 'ui.left':
			return 'left';
		case 'ui.right':
			return 'right';
		default:
			return null;
	}
}

function digitalMove(
	target: Slidable,
	direction: Direction4,
	dx: number,
	dy: number,
): Vec2 {
	const { digitalXStep = 1, digitalYStep = 1 } = target;
	switch (direction) {
		case 'up':
			return [dx, dy - digitalYStep];
		case 'right':
			return [dx + digitalXStep, dy];
		case 'down':
			return [dx, dy + digitalYStep];
		case 'left':
			return [dx - digitalXStep, dy];
	}
}

function joystickMove(
	target: Slidable | Object,
	vec: Vec2,
	dx: number,
	dy: number,
): Vec2 {
	const { joystickXSpeedFactor = 1, joystickYSpeedFactor = 1 } =
		target as Slidable;
	return [
		dx + vec[0] * joystickXSpeedFactor,
		dy + vec[1] * joystickYSpeedFactor,
	];
}

//#region #Event
export class UIEventSlide
	extends EventBase<'slide', Slidable>
	implements IUIEventBase<'slide'>
{
	#state: UIEventSlideState;
	#identifier: number;
	#digital: boolean;
	#startX: number;
	#startY: number;
	/** 当前 X */
	#x: number;
	/** 当前 Y */
	#y: number;
	#dx: number;
	#dy: number;
	#direction?: Direction4;
	#vector?: Vector2;
	#power?: number;
	#powerX?: number;
	#powerY?: number;
	constructor(
		target: Slidable,
		state: UIEventSlideState,
		{ info, digital, direction, vector, power, powerX, powerY }: UIEventSlideInit,
	) {
		super('slide', { target });
		this.#state = state;
		this.#identifier = info.identifier;
		this.#digital = !!digital;
		this.#startX = info.x;
		this.#startY = info.y;
		this.#x = info.x + info.dx;
		this.#y = info.y + info.dy;
		this.#dx = info.dx;
		this.#dy = info.dy;
		this.#direction = direction;
		this.#vector = vector;
		this.#power = power;
		this.#powerX = powerX;
		this.#powerY = powerY;
	}
	get state() {
		return this.#state;
	}
	get identifier() {
		return this.#identifier;
	}
	/** 指针或触摸型滑动事件 */
	get pointer() {
		return this.#identifier > -2;
	}
	/**
	 * 用户使用按钮触发滑动事件
	 * @description
	 * 按钮包括：键盘方向键、游戏控制器 D-pad
	 */
	get digital() {
		return this.#digital;
	}
	get startX() {
		return this.#startX;
	}
	get startY() {
		return this.#startY;
	}
	get x() {
		return this.#x;
	}
	get y() {
		return this.#y;
	}
	get dx() {
		return this.#dx;
	}
	get dy() {
		return this.#dy;
	}
	get direction() {
		return this.#direction;
	}
	get vector() {
		return this.#vector?.clone();
	}
	get power() {
		return this.#power;
	}
	get powerX() {
		return this.#powerX;
	}
	get powerY() {
		return this.#powerY;
	}
}

//#region #Manager
export class UIEventSlideManager implements IUIEventBaseManage<'slide'> {
	#subscriptions: SubscriptionMap = new WeakMap();
	#activated: ActivatedMap = new Map();
	#emit(
		target: Slidable,
		state: UIEventSlideState,
		{
			digital,
			x,
			y,
			dx,
			dy,
			direction,
			vector,
			power,
			powerX,
			powerY,
		}: EmitOptions = {},
	) {
		const handlers = this.#subscriptions.get(target);
		if (!handlers) return;

		const info = this.#activated.get(target);
		if (!info) return;

		if (!(Number.isFinite(info.x) && Number.isFinite(info.y))) {
			info.x = x!;
			info.y = y!;
		}

		if (typeof dx === 'number') info.dx = dx;
		else if (typeof x === 'number') info.dx = x - info.x;
		if (typeof dy === 'number') info.dy = dy;
		else if (typeof y === 'number') info.dy = y - info.y;

		if (info.identifier === -2 && target.slideBorder) {
			const [left, right, top, bottom] = target.slideBorder;
			info.dx = clamp(left - info.x, info.dx, right - info.x);
			info.dy = clamp(top - info.y, info.dy, bottom - info.y);
		}

		const event = new UIEventSlide(target, state, {
			info,
			digital,
			direction,
			vector,
			power,
			powerX,
			powerY,
		});

		for (const handler of handlers) {
			callTask(handler, target, event);
		}
	}
	on<Target extends Slidable>(
		target: Target,
		handler: UIEventSlideHandler,
	): void {
		let handlers = this.#subscriptions.get(target);
		if (!handlers) {
			handlers = new Set();
			this.#subscriptions.set(target, handlers);
			this.#bind(target);
		}
		handlers.add(handler);
	}
	off<Target extends Slidable>(
		target: Target,
		handler: UIEventSlideHandler,
	): void {
		this.#subscriptions.get(target)?.delete(handler);
	}
	add<Target extends Slidable>(target: Target): void {
		if (this.#subscriptions.has(target)) return;
		this.#subscriptions.set(target, new Set());
		this.#bind(target);
	}
	rm<Target extends Slidable>(target: Target): void {
		this.#subscriptions.delete(target);
		this.#deactivate(target);
		this.#unbind(target);
	}
	/**
	 * @param identifier
	 * * `-2`: Nav (Keyboard & Game Controller)
	 * * `-1`: Mouse
	 * * `>= 0`: Touch & Pen
	 * @param x - 起始点 x 坐标
	 * @param y - 起始点 y 坐标
	 *
	 * @description
	 * 若未提供起始坐标，且控制器类型不为键盘或游戏手柄，
	 * 则首次首次 `move` 事件将作为 `start` 事件触发。
	 */
	start<Target extends Slidable>(
		target: Target,
		identifier: number,
		x?: number,
		y?: number,
	): boolean {
		if (!Number.isFinite(identifier)) return false;
		identifier = Math.floor(identifier);
		if (identifier < -2) return false;
		if (!this.#subscriptions.has(target)) return false;
		if (this.#activated.has(target)) return false;

		if (identifier !== -2) {
			if (typeof x !== 'number') x = NaN;
			if (typeof y !== 'number') y = NaN;
		} else {
			if (typeof x !== 'number') x = 0;
			if (typeof y !== 'number') y = 0;
		}
		this.#activate(target, identifier, x, y);
		return true;
	}
	cancel<Target extends Slidable>(target: Target): boolean {
		if (!this.#activated.has(target)) return false;
		this.#deactivate(target);
		return true;
	}
	#bind<Target extends Slidable>(target: Target): void {
		target.addEventListener('mousedown', this.#mouseDownHandler);
		target.addEventListener('touchstart', this.#touchStartHandler);
	}
	#unbind<Target extends Slidable>(target: Target): void {
		target.removeEventListener('mousedown', this.#mouseDownHandler);
		target.removeEventListener('touchstart', this.#touchStartHandler);
	}
	#activate(target: Slidable, identifier: number, x: number, y: number) {
		this.#activated.set(target, { identifier, x, y, dx: 0, dy: 0 });
		target.toggleAttribute('ui-slide', true);

		if (this.#activated.size === 1) this.#start();
	}
	#deactivate(target: Slidable) {
		this.#activated.delete(target);
		target.toggleAttribute('ui-slide', false);

		if (this.#activated.size === 0) this.#stop();
	}
	#start() {
		window.addEventListener('mousemove', this.#mouseMoveHandler);
		window.addEventListener('mouseup', this.#mouseUpHandler);
		window.addEventListener('touchmove', this.#touchMoveHandler);
		window.addEventListener('touchend', this.#touchEndHandler);
		keyboard.on('aliasTrigger', this.#keyboardHandler);
		this.#gamepad.on('arrow', this.#gamepadArrowHandler);
		this.#gamepad.on('ls', this.#gamepadLSHandler);
		this.#prevTime = Date.now();
	}
	#stop() {
		window.removeEventListener('mousemove', this.#mouseMoveHandler);
		window.removeEventListener('mouseup', this.#mouseUpHandler);
		window.removeEventListener('touchmove', this.#touchMoveHandler);
		window.removeEventListener('touchend', this.#touchEndHandler);
		keyboard.off('aliasTrigger', this.#keyboardHandler);
		this.#gamepad.off('arrow', this.#gamepadArrowHandler);
		this.#gamepad.off('ls', this.#gamepadLSHandler);
	}
	//#region Mouse
	#mouseDownHandler = (event: MouseEvent) => {
		const target = event.currentTarget as Slidable;
		if (!target || this.#activated.has(target)) return;
		this.#activate(target, -1, event.x, event.y);
		this.#emit(target, 'start');
	};
	#mouseMoveHandler = (event: MouseEvent) => {
		for (const [target, { identifier }] of this.#activated) {
			if (identifier !== -1) continue;

			this.#emit(target, 'move', { x: event.x, y: event.y });
		}
	};
	#mouseUpHandler = (event: MouseEvent) => {
		for (const [target, { identifier }] of this.#activated) {
			if (identifier !== -1) continue;
			this.#emit(target, 'end', { x: event.x, y: event.y });
			// Optimization: Do not use `this.#deactivate(target);`
			// to reduce the number of conditional judgments
			target.toggleAttribute('ui-slide', false);
			this.#activated.delete(target);
		}
		if (this.#activated.size !== 0) return;
		this.#stop();
	};
	//#region Touch
	#touchStartHandler = (event: TouchEvent) => {
		// 若页面正在滚动，则不处理
		if (!event.cancelable) return;

		const target = event.currentTarget as Slidable;
		if (target.hasAttribute('disabled')) return;
		if (!target || this.#activated.has(target)) return;

		// 避免页面滚动
		event.preventDefault();

		const { identifier, clientX, clientY } = event.changedTouches[0];
		this.#activate(target, identifier, clientX, clientY);

		this.#emit(target, 'start');
	};
	#touchMoveHandler = (event: TouchEvent) => {
		for (const [target, { identifier }] of this.#activated) {
			if (identifier < 0) continue;

			const touch = [...event.changedTouches].find(
				(touch) => touch.identifier === identifier,
			);
			if (!touch) continue;

			this.#emit(target, 'move', { x: touch.clientX, y: touch.clientY });
		}
	};
	#touchEndHandler = (event: TouchEvent) => {
		for (const [target, { identifier }] of this.#activated) {
			if (identifier < 0) continue;

			const touch = [...event.changedTouches].find(
				(touch) => touch.identifier === identifier,
			);
			if (!touch) continue;

			this.#emit(target, 'end', { x: touch.clientX, y: touch.clientY });

			// Optimization: Do not use `this.#deactivate(target);`
			// to reduce the number of conditional judgments
			target.toggleAttribute('ui-slide', false);
			this.#activated.delete(target);
		}
		if (this.#activated.size !== 0) return;
		this.#stop();
	};
	//#region Keyboard
	#digitalHandler(direction: Direction4) {
		for (const [target, { identifier, dx, dy }] of this.#activated) {
			if (identifier !== -2) continue;

			const [x, y] = digitalMove(target, direction, dx, dy);
			this.#emit(target, 'move', { digital: true, dx: x, dy: y, direction });
		}
	}
	#keyboardHandler = (event: KeyboardEvents['aliasTrigger']) => {
		const direction = aliasToDirection(event.key);
		if (!direction) return;
		this.#digitalHandler(direction);
	};
	//#region Game controller
	#gamepad = GameController.getInstance(0);
	#up = new RepeatingTriggerController(() => this.#digitalHandler('up'));
	#right = new RepeatingTriggerController(() => this.#digitalHandler('right'));
	#down = new RepeatingTriggerController(() => this.#digitalHandler('down'));
	#left = new RepeatingTriggerController(() => this.#digitalHandler('left'));
	#gamepadArrowHandler = () => {
		this.#up[this.#gamepad.up ? 'start' : 'stop']();
		this.#right[this.#gamepad.right ? 'start' : 'stop']();
		this.#down[this.#gamepad.down ? 'start' : 'stop']();
		this.#left[this.#gamepad.left ? 'start' : 'stop']();
	};
	#prevTime = 0;
	#gamepadLSHandler = ({ timestamp }: { timestamp: number }) => {
		const delta = (timestamp - this.#prevTime) / 1000;

		this.#prevTime = timestamp;

		const vector = this.#gamepad.ls;

		const power = vector.length * delta;
		const powerX = vector.x * delta;
		const powerY = vector.y * delta;
		const direction = vector.direction;

		for (const [target, { identifier, dx, dy }] of this.#activated) {
			if (identifier !== -2) continue;

			const [x, y] = joystickMove(target, [powerX, powerY], dx, dy);
			this.#emit(target, 'move', {
				dx: x,
				dy: y,
				direction,
				vector,
				power,
				powerX,
				powerY,
			});
		}
	};
}
