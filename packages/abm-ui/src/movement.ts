import {
	AnimationFrameController,
	type ArrayOr,
	asArray,
	clamp,
	notNil,
	resolveStep,
	runSync,
	steppedClamp,
	Timeout,
	type Vec2,
	Vector2,
} from 'abm-utils';
import { $rect } from './infra/dom';
import { $off, $on } from './infra/event';
import {
	type InteractionSource,
	toInteractionSource,
} from './infra/interaction';
import { GameController } from './input/game-controller';
import { type NavState, navigate } from './navigate/index';

//#region Type

/**
 * 移动值
 * @description
 * - `number`：一维值
 * - `Vec2`：二维值
 */
export type MovementValue = Vec2 | number;

/**
 * 移动值来源
 * @description
 * - `T`：固定值
 * - `() => T`：动态值
 */
export type MovementValueSource<T extends MovementValue> = T | (() => T);

/** 移动目标 */
export interface MovementTarget<T extends MovementValue> {
	/** 当前逻辑值 */
	value: MovementValueSource<T>;
	/**
	 * 起始逻辑值
	 * @default Number.NEGATIVE_INFINITY
	 */
	start?: MovementValueSource<T>;
	/**
	 * 结束逻辑值
	 * @default Number.POSITIVE_INFINITY
	 */
	end?: MovementValueSource<T>;
	/**
	 * 逻辑值步长
	 * @default 0
	 */
	step?: MovementValueSource<T>;
	/**
	 * 离散控制系数
	 * @description
	 * 离散输入对逻辑值的影响，默认根据步长计算。
	 *
	 * 离散输入包括：
	 * - 键盘按键
	 * - 游戏手柄按键
	 */
	discrete?: MovementValueSource<T>;
	/**
	 * 连续控制系数
	 * @description
	 * 连续输入对逻辑值的影响，默认根据步长计算。
	 *
	 * 连续输入包括：
	 * - 摇杆
	 */
	continuous?: MovementValueSource<T>;
	/**
	 * 鼠标拖动开始延迟
	 * @description
	 * 单位：毫秒
	 * @default 0
	 */
	mouseStartDelay?: MovementValueSource<number>;
	/**
	 * 笔拖动开始延迟
	 * @description
	 * 单位：毫秒
	 * @default 500
	 */
	penStartDelay?: MovementValueSource<number>;
	/**
	 * 触摸拖动开始延迟
	 * @description
	 * 单位：毫秒
	 * @default 500
	 */
	touchStartDelay?: MovementValueSource<number>;
	/**
	 * 鼠标拖动检查时长
	 * @description
	 * 单位：毫秒
	 * @default 0
	 */
	mouseCheckDelay?: MovementValueSource<number>;
	/**
	 * 笔拖动检查时长
	 * @description
	 * 单位：毫秒
	 * @default 100
	 */
	penCheckDelay?: MovementValueSource<number>;
	/**
	 * 触摸拖动检查时长
	 * @description
	 * 单位：毫秒
	 * @default 100
	 */
	touchCheckDelay?: MovementValueSource<number>;
}

/**
 * 移动状态
 * @description
 * - `start`：首次移动
 * - `moving`：移动中
 * - `end`：移动结束
 * - `cancel`：移动取消
 */
export type MovementState = 'start' | 'moving' | 'end' | 'cancel';

/** 移动事件 */
export interface MovementEvent<
	T extends MovementValue,
	E extends HTMLElement = HTMLElement,
> {
	/**
	 * 移动状态
	 * @see {@link MovementState}
	 */
	state: MovementState;
	/** 初始逻辑值 */
	initial: T;
	/** 当前逻辑值 */
	value: T;
	/**
	 * 逻辑值变化量
	 * @description
	 * 从初始逻辑值到当前
	 */
	offset: T;
	/** 本次移动的逻辑值变化量 */
	delta: T;
	/** 触发移动元素 */
	trigger?: E;
	/** 指针坐标 */
	pointer?: {
		/** 初始坐标 */
		initial: Vec2;
		/** 当前坐标 */
		current: Vec2;
		/**
		 * 坐标变化量
		 * @description
		 * 从初始坐标到现在
		 */
		offset: Vec2;
		/** 本次移动的坐标变化量 */
		delta: Vec2;
	};
	/**
	 * 本次移动结束
	 * @description
	 * 若要判断移动是正常结束还是需要，请检查 `state`
	 */
	end: boolean;
}

/** 移动事件处理器 */
export type MovementEventHandler<
	T extends MovementValue,
	E extends HTMLElement = HTMLElement,
> = (event: MovementEvent<T, E>) => any;

/**
 * 首次移动检查器
 * @param offset 位移
 * @param trigger 触发移动元素
 * @returns
 * - `true`：检查通过
 * - `false`：检查不通过
 * - `Vec2`：期望移动方向向量（双向，由移动控制器进一步检查）
 */
export type MovementChecker<E extends HTMLElement = HTMLElement> = (
	offset: Vec2,
	trigger?: E,
) => boolean | Vec2;

/** 轴线获取器 */
export type MovementAxisGetter<T extends MovementValue> = () => T extends Vec2
	? {
			/** 原点坐标 */
			o: Vec2 | DOMRect | Element;
			/** X 轴正半轴任意点坐标 */
			x: Vec2 | DOMRect | Element;
			/**
			 * Y 轴正半轴任意点坐标
			 * @description
			 * 一维移动无需该坐标
			 */
			y: Vec2 | DOMRect | Element;
		}
	: {
			/** 原点坐标 */
			o: Vec2 | DOMRect | Element;
			/** X 轴正半轴任意点坐标 */
			x: Vec2 | DOMRect | Element;
			/**
			 * Y 轴正半轴任意点坐标
			 * @description
			 * 一维移动无需该坐标
			 */
			y?: Vec2 | DOMRect | Element;
		};

/** 移动控制器初始化参数 */
export interface MovementControllerInit<
	T extends MovementValue,
	E extends HTMLElement = HTMLElement,
> {
	/** 事件处理 */
	handler?: MovementEventHandler<T, E>;
	/** 首次移动检查 */
	check?: MovementChecker<E>;
	/** 轴线获取器 */
	axis?: MovementAxisGetter<T>;
	/** 触发器 */
	triggers?: ArrayOr<E>;
}

/** 开始移动参数 */
export interface MovementStartOptions<
	T extends MovementValue,
	E extends HTMLElement = HTMLElement,
> {
	/**
	 * 交互源
	 * @default 'nav'
	 */
	source?:
		| InteractionSource
		| PointerEvent
		| PointerEvent['pointerType']
		| Touch;
	/**
	 * 当前值
	 * @default target.value
	 */
	value?: T;
	/**
	 * 指针位置
	 */
	position?: Vec2 | PointerEvent | Touch;
	/** 触发器 */
	trigger?: E;
	/** 禁用拖动开始延迟 */
	disableDelay?: boolean;
	/** 禁用首次移动检查 */
	disableCheck?: boolean;
}

interface ParsedStartOptions<
	T extends MovementValue,
	E extends HTMLElement = HTMLElement,
> {
	source: InteractionSource;
	value: T;
	position?: Vec2;
	trigger?: E;
	disableDelay?: boolean;
	disableCheck?: boolean;
}

interface EmitExtraOptions<E extends HTMLElement> {
	initialPosition?: Vec2;
	positionDelta?: Vec2;
	trigger?: E;
	end?: boolean;
}

//#region Helper
function isMovementTarget<T extends MovementValue>(
	input: unknown,
): input is MovementTarget<T> {
	if (!input) return false;
	if (typeof input !== 'object') return false;
	if (!('value' in input)) return false;
	const { value } = input;
	if (typeof value === 'function') return true;
	if (typeof value === 'number') return true;
	if (Array.isArray(value)) return true;
	return false;
}

function checkMovementTarget(input: unknown): void {
	if (isMovementTarget(input)) return;
	throw new TypeError('Illegal MovementTarget', { cause: input });
}

function getValue<T extends MovementValue>(source: MovementValueSource<T>): T;
function getValue<T extends MovementValue>(
	source?: MovementValueSource<T>,
): T | undefined;
function getValue<T extends MovementValue>(
	source?: MovementValueSource<T>,
): T | undefined {
	if (typeof source !== 'function') return source;
	return source();
}

function newValue<T extends MovementValue>(value: T): T {
	if (Vector2.isVec2(value)) return [...value] as T;
	return value;
}

function add<T extends MovementValue>(
	a: T,
	b: T,
	start?: MovementValueSource<T>,
	end?: MovementValueSource<T>,
): T {
	const min = getValue(start ?? Number.POSITIVE_INFINITY);
	const max = getValue(end ?? Number.NEGATIVE_INFINITY);
	if (Vector2.isVec2(a)) {
		const value = Vector2.add(a, b as Vec2);
		return Vector2.clamp(Vector2.toVec2(min), value, Vector2.toVec2(max)) as T;
	}
	const value = (a as number) + (b as number);
	return clamp(min as number, value, max as number) as T;
}

function sub<T extends MovementValue>(a: T, b: T): T {
	if (Vector2.isVec2(a)) return Vector2.sub(a, b as Vec2) as T;
	return ((a as number) - (b as number)) as T;
}

function zero<T extends MovementValue>(value: T): T {
	if (Vector2.isVec2(value)) return Vector2.zero() as T;
	return 0 as T;
}

function isZero<T extends MovementValue>(value: T): boolean {
	if (Vector2.isVec2(value)) return Vector2.isZero(value);
	return Math.abs(value as number) < Number.EPSILON;
}

function pos(input: Vec2 | DOMRect | Element): Vec2 {
	if (Vector2.isVec2(input)) return input;
	if (input instanceof DOMRect) return [input.x, input.y];
	const { x, y } = $rect(input);
	return [x, y];
}

function steppedClampMovementValue<T extends MovementValue>(
	target: MovementTarget<T>,
	value: T,
	isUV?: boolean,
): T {
	const start = getValue(target.start);
	const end = getValue(target.end);
	const step = getValue(target.step);

	if (typeof value === 'number') {
		if (isUV && start !== undefined && end !== undefined) {
			// @ts-expect-error
			value = start + value * (end - start);
		}
		return steppedClamp(
			(start ?? Number.NEGATIVE_INFINITY) as number,
			(end ?? Number.POSITIVE_INFINITY) as number,
			value as number,
			step as number,
		) as T;
	}

	if (isUV && start !== undefined && end !== undefined) {
		// @ts-expect-error
		value = [
			// @ts-expect-error
			start[0] + value[0] * (end[0] - start[0]),
			// @ts-expect-error
			start[1] + value[1] * (end[1] - start[1]),
		];
	}
	return [
		steppedClamp(
			(start as Vec2 | undefined)?.[0] ?? Number.NEGATIVE_INFINITY,
			(end as Vec2 | undefined)?.[0] ?? Number.POSITIVE_INFINITY,
			value[0],
			(step as Vec2 | undefined)?.[0],
		),
		steppedClamp(
			(start as Vec2 | undefined)?.[1] ?? Number.NEGATIVE_INFINITY,
			(end as Vec2 | undefined)?.[1] ?? Number.POSITIVE_INFINITY,
			value[1],
			(step as Vec2 | undefined)?.[1],
		),
	] as T;
}

/** 根据 Axis 信息转换逻辑增量 */
function transformLogicDelta<T extends MovementValue>(
	delta: Vec2,
	axis?: MovementAxisGetter<T>,
): Vec2 {
	if (!axis) return delta;
	let { o, x, y } = axis();
	o = pos(o);
	x = pos(x);

	const ux = Vector2.normalize(Vector2.sub(x, o));
	let uy: Vec2;
	if (y) uy = Vector2.normalize(Vector2.sub(pos(y), o));
	else uy = [ux[1], -ux[0]];
	const det = ux[0] * uy[1] - ux[1] * uy[0];

	if (Math.abs(det) < Number.EPSILON) return [delta[0], delta[1]];
	return [
		(delta[0] * uy[1] - delta[1] * uy[0]) / det,
		(ux[0] * delta[1] - ux[1] * delta[0]) / det,
	];
}

function flipLogicDelta<T extends MovementValue>(
	target: MovementTarget<T>,
	delta: Vec2,
): Vec2 {
	const start = getValue(target.start);
	const end = getValue(target.end);
	if (start === undefined || end === undefined) return delta;
	const diff = sub(end, start);
	if (typeof diff === 'number') return Vector2.mul(delta, Math.sign(diff));
	return Vector2.scale(delta, [Math.sign(diff[0]), Math.sign(diff[1])]);
}

function computeUV<T extends MovementValue>(
	axis: MovementAxisGetter<T>,
	p: Vec2,
): Vec2 {
	let { o, x, y } = axis();
	o = pos(o);
	x = pos(x);

	/** 基向量 X */
	const vx = Vector2.sub(x, o);
	/** 基向量 Y */
	let vy: Vec2;
	if (y) vy = Vector2.sub(pos(y), o);
	else vy = [vx[1], -vx[0]];
	/** 行列式 */
	const det = vx[0] * vy[1] - vx[1] * vy[0];
	/** P 相对于原点的向量 */
	const dp = Vector2.sub(p, o);

	// 解线性方程组：dp = u * vx + v * vy
	// 使用克莱姆法则求解
	const u = (dp[0] * vy[1] - dp[1] * vy[0]) / det;
	const v = (vx[0] * dp[1] - vx[1] * dp[0]) / det;

	return [clamp(0, u, 1), clamp(0, v, 1)];
}

const SCREEN_AXIS: MovementAxisGetter<number | Vec2> = () => ({
	o: [0, 0],
	x: [innerWidth, 0],
	y: [0, innerHeight],
});

//#region Main
/**
 * 移动控制器
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/other/movement)
 */
export class MovementController<
	T extends MovementValue,
	E extends HTMLElement = HTMLElement,
> {
	/** 移动目标 */
	#target!: MovementTarget<T>;
	/** 移动事件处理器 */
	handler?: MovementEventHandler<T, E>;
	/** 首次移动检查器 */
	check?: MovementChecker<E>;
	/** 轴线获取器 */
	axis?: MovementAxisGetter<T>;
	/** 触发器 */
	#triggers = new WeakSet<E>();
	/** 交互源 */
	#source: InteractionSource | null = null;
	constructor(target: MovementTarget<T>, init?: MovementControllerInit<T, E>) {
		this.target = target;
		this.handler = init?.handler;
		this.check = init?.check;
		this.axis = init?.axis;
		if (!init?.triggers) return;
		this.addTriggers(...asArray(init.triggers));
	}
	/** 移动目标 */
	get target() {
		return this.#target;
	}
	set target(value) {
		if (value === this.#target) return;
		checkMovementTarget(value);
		this.#target = value;
	}
	/** 交互源 */
	get source() {
		return this.#source;
	}
	/** 正在移动 */
	get moving() {
		return this.#source !== null;
	}
	//#region Input
	/**
	 * 开始移动
	 * @description
	 * 若当前正在移动或准备移动，则不会开始移动
	 */
	start(options?: MovementStartOptions<T, E>): void {
		if (this.moving) return;
		const { source, value, position, trigger, disableCheck, disableDelay } =
			this.#parseStartOptions(options);

		// Setup
		this.#source = source;
		this.#initial = value;
		this.#value = value;
		this.#initialPosition = position;
		if (source !== 'nav' && position) {
			this.#currentPosition = position;
			this.#value = this.#computeValueFromPosition(position);
		}
		this.#trigger = trigger;

		// Start Gamepad Handler
		if (source === 'nav') {
			this.#delaying = false;
			this.#checking = false;
			this.#gamepad.start();
			this.#emit('start', zero(value));
			return;
		}

		let delay: number | undefined;
		let check: number | undefined;

		// Bind
		if (typeof source === 'number') {
			delay = getValue(this.#target.touchStartDelay ?? 500);
			check = getValue(this.#target.touchCheckDelay ?? 100);
			$on(window, 'touchmove', this.#touchHandler, { passive: false });
			$on(window, 'touchend', this.#touchHandler);
		} else {
			$on(window, 'pointermove', this.#pointerHandler);
			$on(window, 'pointerup', this.#pointerHandler);
			if (source === 'pen') {
				delay = getValue(this.#target.penStartDelay ?? 500);
				check = getValue(this.#target.penCheckDelay ?? 100);
			} else {
				delay = getValue(this.#target.mouseStartDelay ?? 0);
				check = getValue(this.#target.mouseCheckDelay ?? 0);
			}
		}

		// Delay
		if (disableDelay) delay = 0;
		if (Number.isFinite(delay) && delay > 0) {
			this.#delaying = true;
			this.#delayTimeout.start(delay);
		} else {
			this.#delaying = false;
			if (this.#initialPosition) {
				this.#emit('start', zero(value), { positionDelta: Vector2.zero() });
			}
		}

		// Check
		if (disableCheck) check = 0;
		if (check > 0) {
			this.#checking = true;
			if (Number.isFinite(check)) this.#checkTimeout.start(check);
		} else {
			this.#checking = false;
		}
	}
	/**
	 * 停止移动
	 * @description
	 * 若当前不存在正在移动或准备移动，则不会停止移动；
	 * @param cancel 是否为取消移动
	 */
	stop(cancel = false): void {
		if (this.#source === null) return;
		const trigger = this.#trigger;
		const initialPosition = this.#initialPosition;
		const skipEmit =
			this.#delaying || (this.#source !== 'nav' && !this.#initialPosition);
		if (cancel) {
			if (this.#initialPosition) this.#currentPosition = this.#initialPosition;
			this.#value = this.#initial;
		}
		// Clean
		this.#clean();
		// Emit
		if (skipEmit) return;
		this.#emit(cancel ? 'cancel' : 'end', zero(this.#value), {
			initialPosition,
			positionDelta: Vector2.zero(),
			trigger,
			end: true,
		});
	}
	/** 处理导航 */
	handleNav(state: NavState): void {
		if (this.#source !== 'nav') return;
		if (state.type !== 'direction') return;
		let step = getValue(this.#target.step);
		if (
			(!step || isZero(step)) &&
			notNil(this.#target.start) &&
			notNil(this.#target.end)
		) {
			step = resolveStep<T>(
				getValue(this.#target.start),
				getValue(this.#target.end),
				step,
			);
		}
		const delta = Vector2.scale(state.direction, Vector2.toVec2(step ?? 0));
		this.#handleLogic(delta);
	}
	//#region Internal
	#parseStartOptions(
		options?: MovementStartOptions<T, E>,
	): ParsedStartOptions<T, E> {
		if (!options) return { source: 'nav', value: getValue(this.#target.value) };

		let source: InteractionSource | undefined;
		let value = options.value;
		let position: Vec2 | undefined;
		let trigger = options.trigger;

		if (options.source instanceof PointerEvent) {
			source = toInteractionSource(options.source);
			const { x, y } = options.source;
			position = [x, y];
			trigger ??= options.source.target as E;
		} else if (options.source instanceof Touch) {
			const { identifier, clientX, clientY } = options.source;
			source = identifier;
			position = [clientX, clientY];
		} else if (options.source !== undefined) {
			source = toInteractionSource(options.source);
		}

		if (options.position instanceof PointerEvent) {
			source ??= toInteractionSource(options.position);
			const { x, y } = options.position;
			position = [x, y];
			trigger ??= options.position.target as E;
		} else if (options.position instanceof Touch) {
			const { identifier, clientX, clientY } = options.position;
			source ??= identifier;
			position = [clientX, clientY];
		} else if (Vector2.isVec2(options.position)) {
			position = Vector2.toVec2(options.position);
		}

		source ??= 'nav';
		value ??= getValue(this.#target.value);

		return { ...options, source, value, position, trigger };
	}
	#emit(state: MovementState, delta: T, extra?: EmitExtraOptions<E>): void {
		const event: MovementEvent<T, E> = {
			state,
			initial: newValue(this.#initial),
			value: newValue(this.#value),
			offset: sub(this.#value, this.#initial),
			delta,
			trigger: this.#trigger ?? extra?.trigger,
			end: extra?.end ?? false,
		};
		const initialPosition = this.#initialPosition ?? extra?.initialPosition;
		if (initialPosition && extra?.positionDelta) {
			event.pointer = {
				initial: Vector2.toVec2(initialPosition),
				current: Vector2.toVec2(this.#currentPosition),
				offset: Vector2.sub(this.#currentPosition, initialPosition),
				delta: extra.positionDelta,
			};
		}
		runSync(this.handler, event);
	}
	#clean() {
		this.#gamepad.stop();
		$off(window, 'pointermove', this.#pointerHandler);
		$off(window, 'pointerup', this.#pointerHandler);
		$off(window, 'touchmove', this.#touchHandler);
		$off(window, 'touchend', this.#touchHandler);
		this.#source = null;
		this.#trigger = undefined;
		this.#initialPosition = undefined;
		this.#delayTimeout.stop();
		this.#checkTimeout.stop();
	}
	#computeValueFromPosition(position: Vec2): T {
		const uv = computeUV(this.axis ?? SCREEN_AXIS, position);
		return steppedClampMovementValue(
			this.#target,
			typeof this.#value === 'number' ? uv[0] : uv,
			true,
		) as T;
	}
	#computeStickStep(): Vec2 {
		const literal = getValue(this.#target.continuous ?? this.#target.step);
		if (literal && !isZero(literal)) return Vector2.toVec2(literal);
		const start = Vector2.toVec2(getValue(this.#target.start ?? 0));
		const end = Vector2.toVec2(getValue(this.#target.end ?? 1));
		return Vector2.sub(start, end).map(Math.abs) as Vec2;
	}
	/** 初始值 */
	#initial!: T;
	/** 当前值 */
	#value!: T;
	/** 触发器 */
	#trigger?: E;
	/** 初始位置 */
	#initialPosition?: Vec2;
	/** 当前位置 */
	#currentPosition!: Vec2;
	/** 正在等待开始延迟 */
	#delaying = true;
	/** 正在等待检查 */
	#checking = true;
	#gamepad = new AnimationFrameController((_, timeDiff) => {
		if (navigate.gameController.disabled) return;
		const gamepad = GameController.get(navigate.gameController.index);
		if (navigate.gameController.ls) this.#stickHandler(gamepad.ls, timeDiff);
		if (navigate.gameController.rs) this.#stickHandler(gamepad.rs, timeDiff);
	});
	/** 延迟开始计时器 */
	#delayTimeout = new Timeout(() => {
		if (!this.#delaying) return;
		this.#delaying = false;
		this.#emit('start', zero(this.#value), { positionDelta: Vector2.zero() });
	});
	/** 检查超时计时器 */
	#checkTimeout = new Timeout(() => {
		this.#checking = false;
	});
	//#region Handle
	/** 处理逻辑值 */
	#handleLogic(rawDelta: Vec2) {
		rawDelta = transformLogicDelta(rawDelta, this.axis);
		rawDelta = flipLogicDelta(this.#target, rawDelta);
		let delta = (typeof this.#value === 'number' ? rawDelta[0] : rawDelta) as T;
		if (isZero(delta)) return;
		const value = add(this.#value, delta, this.#target.start, this.#target.end);
		delta = sub(value, this.#value);
		if (isZero(delta)) return;
		this.#value = value;
		this.#emit('moving', delta);
	}
	/** 处理像素值 */
	#handlePixel(position: Vec2, end: boolean) {
		// Initial
		if (!this.#initialPosition) {
			if (end) return this.#clean();
			this.#initialPosition = position;
			this.#currentPosition = position;
			return;
		}
		this.#delayTimeout.stop();
		const offset = Vector2.sub(position, this.#initialPosition);
		// Check
		if (this.#checking) {
			this.#checkTimeout.stop();
			this.#checking = false;
			let result = this.check?.(offset, this.#trigger);
			if (Vector2.isVec2(result))
				result = MovementController.isPrefer(result, offset);
			if (result === false) return this.stop(true);
			if (result) this.#delaying = false;
		}
		// Delay
		if (this.#delaying) return this.stop(true);
		// Transform
		const value = this.#computeValueFromPosition(position);
		const delta = sub(value, this.#initial);
		const positionDelta = Vector2.sub(position, this.#currentPosition);
		this.#value = value;
		this.#currentPosition = position;
		// Emit
		if (end) return this.stop();
		this.#emit('moving', delta, { positionDelta });
	}
	//#region RawInput
	/** 游戏控制器摇杆处理器 */
	#stickHandler(rawDelta: Vec2 | null, timeDiff: number) {
		if (!rawDelta) return;
		if (Vector2.isZero(rawDelta)) return;
		const delta = Vector2.scale(
			Vector2.mul(rawDelta, timeDiff / 1000),
			this.#computeStickStep(),
		);
		if (Vector2.isZero(delta)) return;
		this.#handleLogic(delta);
	}
	/**
	 * 指针按下处理器
	 * @description
	 * 若当前正在移动则不处理；
	 * 若指针类型为触摸则不处理；
	 * 若按钮不为主键则不处理
	 */
	#pointerDownHandler = (event: PointerEvent) => {
		if (this.moving) return;
		const { pointerType, button } = event;
		if (pointerType !== 'mouse') return;
		if (button !== 0) return;
		this.start({ source: event });
		if (this.#source === pointerType) event.preventDefault();
	};
	/**
	 * 指针移动/松开处理器
	 * @description
	 * 若指针类型为触摸则不处理
	 */
	#pointerHandler = (event: PointerEvent) => {
		if (event.pointerType !== this.#source) return;
		event.preventDefault();
		const end = event.type === 'pointerup';
		const { x, y } = event;
		this.#handlePixel([x, y], end);
	};
	/**
	 * 触摸开始处理器
	 * @description
	 * 若当前正在移动则不处理；
	 * 若正在滚动则不处理
	 */
	#touchStartHandler = (event: TouchEvent) => {
		if (this.moving) return;
		if (!event.cancelable) return;
		this.start({ source: event.changedTouches[0], trigger: event.target as E });
	};
	/**
	 * 触摸移动/结束处理器
	 * @description
	 * 若未找到绑定的触摸则不处理；
	 * 取消页面滚动行为
	 */
	#touchHandler = (event: TouchEvent) => {
		if (typeof this.#source !== 'number') return;
		for (const touch of event.changedTouches) {
			if (touch.identifier !== this.#source) continue;
			if (event.cancelable) event.preventDefault();
			const end = event.type === 'touchend';
			const { clientX, clientY } = touch;
			this.#handlePixel([clientX, clientY], end);
		}
	};
	//#region Trigger
	/** 添加触发移动元素 */
	addTriggers(...triggers: E[]): void {
		for (const trigger of triggers) {
			if (this.#triggers.has(trigger)) continue;
			$on(trigger, 'pointerdown', this.#pointerDownHandler);
			$on(trigger, 'touchstart', this.#touchStartHandler);
			this.#triggers.add(trigger);
		}
	}
	hasTrigger(trigger: E): boolean {
		return this.#triggers.has(trigger);
	}
	rmTriggers(...triggers: E[]): void {
		for (const trigger of triggers) {
			if (!this.#triggers.has(trigger)) continue;
			$off(trigger, 'pointerdown', this.#pointerDownHandler);
			$off(trigger, 'touchstart', this.#touchStartHandler);
			this.#triggers.delete(trigger);
		}
	}
	//#region Other
	static isPrefer(prefer: Vec2, offset: Vec2): boolean {
		const squareMagnitudeA = Vector2.dot(prefer, prefer);
		if (!squareMagnitudeA) return true;
		const squareMagnitudeB = Vector2.dot(offset, offset);
		if (!squareMagnitudeB) return true;
		const dotProduct = Vector2.dot(prefer, offset);
		return 2 * dotProduct * dotProduct > squareMagnitudeA * squareMagnitudeB;
	}
	static value2uv<T extends MovementValue>(value: T, start: T, end: T): T {
		if (typeof value === 'number') {
			// @ts-expect-error
			return (value - start) / (end - start);
		}
		// @ts-expect-error
		return [
			// @ts-expect-error
			(value[0] - start[0]) / (end[0] - start[0]),
			// @ts-expect-error
			(value[1] - start[1]) / (end[1] - start[1]),
		];
	}
}
