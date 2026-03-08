import {
	AnimationFrameController,
	clamp,
	type Direction8,
	EventEmitter,
	RepeatingTriggerController,
	type Vec2,
} from 'abm-utils';
import { $on } from '../infra/event';

//#region Define

/**
 * 游戏控制器按钮类型定义
 * @description
 * - `LB`：左肩键
 * - `RB`：右肩键
 * - `LT`：左扳机
 * - `RT`：右扳机
 * - `LSB`：左摇杆按下
 * - `RSB`：右摇杆按下
 * - `UP`：方向键上
 * - `DOWN`：方向键下
 * - `LEFT`：方向键左
 * - `RIGHT`：方向键右
 */
export type GameControllerButton = (typeof BUTTONS)[number];

export interface GameControllerEventMap {
	/** 按钮按下 */
	down: [button: GameControllerButton];
	/** 按钮释放 */
	up: [button: GameControllerButton];
	/** 按钮按下并释放 */
	press: [button: GameControllerButton];
	/** 按钮触发 */
	trigger: [button: GameControllerButton];
	/** 左摇杆变化 */
	ls: [direction: Direction8, x: number, y: number];
	/** 右摇杆变化 */
	rs: [direction: Direction8, x: number, y: number];
	/** 左摇杆触发 */
	lsTrigger: [direction: Direction8, x: number, y: number];
	/** 右摇杆触发 */
	rsTrigger: [direction: Direction8, x: number, y: number];
	/** 连接性 */
	connectivity: [connected: boolean];
}

//#region Var

/** 按钮定义映射索引 */
const BUTTONS = [
	'A',
	'B',
	'X',
	'Y',
	'LB',
	'RB',
	'LT',
	'RT',
	'BACK',
	'START',
	'LSB',
	'RSB',
	'UP',
	'DOWN',
	'LEFT',
	'RIGHT',
	'HOME',
] as const;

const LT_INDEX = BUTTONS.indexOf('LT');
const RT_INDEX = BUTTONS.indexOf('RT');

const DIRECTION_SECTOR: Direction8[] = [
	'right',
	'right-up',
	'up',
	'left-up',
	'left',
	'left-down',
	'down',
	'right-down',
	'right',
];

const instances: [
	GameController | null,
	GameController | null,
	GameController | null,
	GameController | null,
] = [null, null, null, null];

//#region Helper

/** 检查索引是否为扳机 */
function isTrigger(index: number): boolean {
	if (LT_INDEX === index) return true;
	if (RT_INDEX === index) return true;
	return false;
}

/** 计算坐标对应八方向 */
function direction(x: number, y: number): Direction8 {
	const angle = Math.atan2(-y, x);
	let degrees = angle * (180 / Math.PI);
	if (degrees < 0) degrees += 360;
	const sector = Math.floor((degrees + 22.5) / 45) % 8;
	return DIRECTION_SECTOR[sector];
}

export function getGamepadButtons() {
	return [...BUTTONS];
}

function map(v: number, min: number, max: number): number {
	const sign = Math.sign(v);
	if (!sign) return 0;
	v = Math.abs(v);
	return (Math.max(v - min, 0) / (max - min)) * sign;
}

//#region Main

/** 游戏控制器 */
export class GameController extends EventEmitter<GameControllerEventMap> {
	/**
	 * 获取指定索引的游戏控制器实例
	 * @param index 控制器索引（0~3）
	 * @returns 游戏控制器实例
	 * @throws {RangeError} 索引超出范围时抛出
	 */
	static get(index: number) {
		if (index < 0 || index > 3) {
			throw new RangeError('Index must be between 0 and 3');
		}
		const controller = instances[index];
		if (controller) return controller;
		return new GameController(index);
	}
	#index: number;
	#connected = false;
	#controller = new AnimationFrameController(this.#cycle.bind(this));
	#triggerController = new RepeatingTriggerController(
		this.#triggerHandler.bind(this),
	);
	#buttons: (boolean | number)[] = [
		false,
		false,
		false,
		false,
		false,
		false,
		0,
		0,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
	];
	#ls?: [direction: Direction8, x: number, y: number];
	#rs?: [direction: Direction8, x: number, y: number];
	#activated = new Set<GameControllerButton>();
	private constructor(index: number) {
		super();
		if (instances[index]) {
			throw new Error('Use GameController.get() instead');
		}
		this.#index = index;
		instances[index] = this;
		this.#updateConnectivity();
		$on(window, 'gamepadconnected', this.#connectivityHandler.bind(this));
	}
	/** 控制器连接状态 */
	get connected() {
		return this.#connected;
	}
	/** 游戏控制器索引 */
	get index() {
		return this.#index;
	}
	/**
	 * 游戏控制器 ID
	 * @see {@link Gamepad.id}
	 */
	get id(): string | null {
		return this.#gamepad()?.id ?? null;
	}
	#gamepad(): Gamepad | null {
		return navigator.getGamepads()[this.#index];
	}
	/** 获取指定按钮的当前状态 */
	button<
		T extends K extends 'LT' | 'RT' ? number : boolean,
		K extends GameControllerButton,
	>(btn: K): T {
		const index = BUTTONS.indexOf(btn);
		return (this.#buttons[index] ?? false) as T;
	}
	/** 获取左摇杆的当前坐标 */
	get ls(): Vec2 | null {
		const axes = this.#gamepad()?.axes;
		if (!axes) return null;
		const [x, y] = axes;
		return [this.#mapLS(x), this.#mapLS(y)];
	}
	/** 获取右摇杆的当前坐标 */
	get rs(): Vec2 | null {
		const axes = this.#gamepad()?.axes;
		if (!axes) return null;
		const [_, __, x, y] = axes;
		return [this.#mapRS(x), this.#mapRS(y)];
	}
	/**
	 * 触发控制器震动效果
	 * @see {@link GamepadHapticActuator.playEffect}
	 */
	async vibrate(
		type: GamepadHapticEffectType,
		params?: GamepadEffectParameters,
	): Promise<GamepadHapticsResult | undefined> {
		return await this.#gamepad()?.vibrationActuator.playEffect(type, params);
	}
	/**
	 * 重置控制器震动
	 * @see {@link GamepadHapticActuator.reset}
	 */
	async resetVibrate(): Promise<GamepadHapticsResult | undefined> {
		return await this.#gamepad()?.vibrationActuator.reset();
	}
	#updateConnectivity() {
		const connected = !!this.#gamepad();
		if (this.#connected === connected) return;
		this.#connected = connected;
		this.emit('connectivity', connected);
		if (connected) {
			this.#controller.start();
		} else {
			this.#controller.stop();
			this.#triggerController.stop();
		}
	}
	#connectivityHandler({ gamepad }: GamepadEvent) {
		if (gamepad.index !== this.#index) return;
		this.#updateConnectivity();
	}
	//#region DeadZone
	#lsMin = 0.05;
	#lsMax = 1;
	#rsMin = this.#lsMin;
	#rsMax = this.#lsMax;
	#ltMin = this.#lsMin;
	#ltMax = this.#lsMax;
	#rtMin = this.#lsMin;
	#rtMax = this.#lsMax;
	#mapLS(value: number): number {
		return map(value, this.#lsMin, this.#lsMax);
	}
	#mapRS(value: number): number {
		return map(value, this.#rsMin, this.#rsMax);
	}
	#mapLT(value: number): number {
		return map(value, this.#ltMin, this.#ltMax);
	}
	#mapRT(value: number): number {
		return map(value, this.#rtMin, this.#rtMax);
	}
	/** 左摇杆死区最小值 */
	get lsMin() {
		return this.#lsMin;
	}
	set lsMin(value) {
		if (!Number.isFinite(value)) return;
		value = clamp(0, value, 1);
		this.#lsMin = value;
	}
	/** 左摇杆死区最大值 */
	get lsMax() {
		return this.#lsMax;
	}
	set lsMax(value) {
		if (!Number.isFinite(value)) return;
		value = clamp(0, value, 1);
		this.#lsMax = value;
	}
	/** 右摇杆死区最小值 */
	get rsMin() {
		return this.#rsMin;
	}
	set rsMin(value) {
		if (!Number.isFinite(value)) return;
		value = clamp(0, value, 1);
		this.#rsMin = value;
	}
	/** 右摇杆死区最大值 */
	get rsMax() {
		return this.#rsMax;
	}
	set rsMax(value) {
		if (!Number.isFinite(value)) return;
		value = clamp(0, value, 1);
		this.#rsMax = value;
	}
	/** 左扳机死区最小值 */
	get ltMin() {
		return this.#ltMin;
	}
	set ltMin(value) {
		if (!Number.isFinite(value)) return;
		value = clamp(0, value, 1);
		this.#ltMin = value;
	}
	/** 左扳机死区最大值 */
	get ltMax() {
		return this.#ltMax;
	}
	set ltMax(value) {
		if (!Number.isFinite(value)) return;
		value = clamp(0, value, 1);
		this.#ltMax = value;
	}
	/** 右扳机死区最小值 */
	get rtMin() {
		return this.#rtMin;
	}
	set rtMin(value) {
		if (!Number.isFinite(value)) return;
		value = clamp(0, value, 1);
		this.#rtMin = value;
	}
	/** 右扳机键死区最大值 */
	get rtMax() {
		return this.#rtMax;
	}
	set rtMax(value) {
		if (!Number.isFinite(value)) return;
		value = clamp(0, value, 1);
		this.#rtMax = value;
	}
	//#region Cycle
	#restartTrigger = false;
	#triggerHandler() {
		if (this.#ls) this.emit('lsTrigger', ...this.#ls);
		if (this.#rs) this.emit('rsTrigger', ...this.#rs);
		for (const btn of this.#activated) {
			this.emit('trigger', btn);
		}
	}
	#emitTrigger(type: 'LT' | 'RT', value: number) {
		const active = this.#activated.has(type);

		if (value > 0 && !active) {
			this.#restartTrigger = true;
			this.#activated.add(type);
			this.emit('down', type);
		} else if (value < 0 && active) {
			this.#restartTrigger = true;
			this.#activated.delete(type);
			this.emit('up', type);
		}
	}
	#updateButton(gamepad: Gamepad) {
		gamepad.buttons
			.map((button, i) => {
				if (isTrigger(i)) return button.value;
				return button.pressed;
			})
			.forEach((value, i) => {
				if (this.#buttons[i] === value) return;
				this.#buttons[i] = value;
				if (isTrigger(i)) return;
				this.#restartTrigger = true;
				const button = BUTTONS[i];
				if (value) {
					this.#activated.add(button);
					this.emit('down', button);
				} else {
					this.#activated.delete(button);
					this.emit('up', button);
					this.emit('press', button);
				}
			});
	}
	#updateTrigger() {
		let lt = this.#buttons[LT_INDEX] as number;
		let rt = this.#buttons[RT_INDEX] as number;
		lt = this.#mapLT(lt);
		rt = this.#mapRT(rt);
		this.#buttons[LT_INDEX] = lt;
		this.#buttons[RT_INDEX] = rt;
		this.#emitTrigger('LT', lt);
		this.#emitTrigger('RT', rt);
	}
	#updateStick(axes: Gamepad['axes']) {
		const [lx, ly, rx, ry] = axes;
		const ld = Math.sqrt(lx ** 2 + ly ** 2);
		const rd = Math.sqrt(rx ** 2 + ry ** 2);
		if (ld >= this.#lsMin) {
			const dire = direction(lx, ly);
			if (!this.#ls) this.#restartTrigger = true;
			if (this.#ls?.[0] !== dire) this.emit('ls', dire, lx, ly);
			this.#ls = [dire, lx, ly];
		} else if (this.#ls) {
			this.#restartTrigger = true;
			this.#ls = undefined;
		}
		if (rd >= this.#rsMin) {
			const dire = direction(rx, ry);
			if (!this.#rs) this.#restartTrigger = true;
			if (this.#rs?.[0] !== dire) this.emit('rs', dire, rx, ry);
			this.#rs = [dire, rx, ry];
		} else if (this.#rs) {
			this.#restartTrigger = true;
			this.#rs = undefined;
		}
	}
	#cycle() {
		this.#restartTrigger = false;
		const gamepad = this.#gamepad();
		if (!gamepad) return;

		this.#updateButton(gamepad);
		this.#updateTrigger();
		this.#updateStick(gamepad.axes);
		if (this.#activated.size === 0 && !this.#ls && !this.#rs) {
			this.#triggerController.stop();
		} else if (this.#restartTrigger) {
			this.#triggerController.restart();
		}
	}
}
