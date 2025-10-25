import {
	AnimationFrameController,
	clamp,
	createLinearMapper,
	EventBase,
	type EventBaseInit,
	type EventHandler,
	Events,
	type EventsList,
	EventValue,
	type EventValueInit,
	EventVector,
	type EventVectorInit,
	type IEventSource,
	Vector2,
} from 'abm-utils';

export interface GameControllerRumbleOptions {
	type: GamepadHapticEffectType;
	leftTrigger?: number;
	rightTrigger?: number;
	strongMagnitude?: number;
	weakMagnitude?: number;
}

type GamepadButtons = [
	A: boolean,
	B: boolean,
	X: boolean,
	Y: boolean,
	LB: boolean,
	RB: boolean,
	LT: number,
	RT: number,
	Back: boolean,
	Start: boolean,
	LSB: boolean,
	RSB: boolean,
	Up: boolean,
	Down: boolean,
	Left: boolean,
	Right: boolean,
	Home: boolean,
];

interface GameControllerEventsInit {
	a: EventValueInit<GameController, boolean>;
	b: EventValueInit<GameController, boolean>;
	x: EventValueInit<GameController, boolean>;
	y: EventValueInit<GameController, boolean>;
	lb: EventValueInit<GameController, boolean>;
	rb: EventValueInit<GameController, boolean>;
	lt: EventValueInit<GameController, number>;
	rt: EventValueInit<GameController, number>;
	back: EventValueInit<GameController, boolean>;
	start: EventValueInit<GameController, boolean>;
	lsb: EventValueInit<GameController, boolean>;
	rsb: EventValueInit<GameController, boolean>;
	up: EventValueInit<GameController, boolean>;
	down: EventValueInit<GameController, boolean>;
	left: EventValueInit<GameController, boolean>;
	right: EventValueInit<GameController, boolean>;
	home: EventValueInit<GameController, boolean>;
	ls: EventVectorInit<GameController>;
	rs: EventVectorInit<GameController>;
	arrow: EventBaseInit<GameController>;
	connectivity: EventValueInit<GameController, boolean>;
}

export type GameControllerEvents = EventsList<GameControllerEventsInit>;

const BUTTONS = [
	'a',
	'b',
	'x',
	'y',
	'lb',
	'rb',
	'lt',
	'rt',
	'back',
	'start',
	'lsb',
	'rsb',
	'up',
	'down',
	'left',
	'right',
	'home',
];
const EVENTS_TYPES = [
	...BUTTONS,
	'ls',
	'rs',
	'arrow',
	'connectivity',
] as (keyof GameControllerEventsInit)[];

const insideValidate = Symbol();
const gameControllerInstances: GameController[] = [];

//#region #Controller
export class GameController implements IEventSource<GameControllerEventsInit> {
	static getInstance(index: number) {
		if (index < 0 || index > 3)
			throw new RangeError('Index must be between 0 and 3');
		if (gameControllerInstances[index]) return gameControllerInstances[index];
		const controller = new GameController(index, insideValidate);
		gameControllerInstances[index] = controller;
		return controller;
	}
	#events = new Events<GameControllerEventsInit>(EVENTS_TYPES);
	#index: number;
	#timer = new AnimationFrameController(this.#gamepadCycle.bind(this));
	#buttons: GamepadButtons = [
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
	#ls = new Vector2();
	#rs = new Vector2();
	#vibrationType: GamepadHapticEffectType = 'dual-rumble';
	#leftTrigger?: number;
	#rightTrigger?: number;
	#strongMagnitude?: number;
	#weakMagnitude?: number;
	#vibrating = false;
	#connecting = false;
	private constructor(index: number, validate?: symbol) {
		if (validate !== insideValidate)
			throw new Error('Cannot instantiate GameController');
		this.#index = index;
		if (navigator.getGamepads()[this.#index]) {
			this.#timer.start();
			this.#updateConnectivity(true);
		}
		addEventListener('gamepadconnected', this.#gamepadConnectedHandler);
		addEventListener('gamepaddisconnected', this.#gamepadDisconnectedHandler);
	}
	#updateConnectivity(connecting: boolean) {
		this.#connecting = connecting;
		this.#events.emit(
			new EventValue('connectivity', {
				target: this,
				value: connecting,
			}),
		);
	}
	get connecting() {
		return this.#connecting;
	}
	#gamepadConnectedHandler = ({ gamepad }: GamepadEvent) => {
		if (gamepad.index !== this.#index) return;
		this.#timer.start();
		this.#updateConnectivity(true);
	};
	#gamepadDisconnectedHandler = ({ gamepad }: GamepadEvent) => {
		if (gamepad.index !== this.#index) return;
		this.#timer.stop();
		this.#vibrating = false;
		this.#updateConnectivity(false);
	};
	on<Type extends keyof GameControllerEventsInit>(
		type: Type,
		handler: EventHandler<Type, GameControllerEventsInit[Type], GameController>,
	): void {
		this.#events.on(type, handler);
	}
	once<Type extends keyof GameControllerEventsInit>(
		type: Type,
		handler: EventHandler<Type, GameControllerEventsInit[Type], GameController>,
	): void {
		this.#events.once(type, handler);
	}
	off<Type extends keyof GameControllerEventsInit>(
		type: Type,
		handler: EventHandler<Type, GameControllerEventsInit[Type], GameController>,
	): void {
		this.#events.off(type, handler);
	}
	//#region Properties
	get a() {
		return this.#buttons[0];
	}
	get b() {
		return this.#buttons[1];
	}
	get x() {
		return this.#buttons[2];
	}
	get y() {
		return this.#buttons[3];
	}
	get lb() {
		return this.#buttons[4];
	}
	get rb() {
		return this.#buttons[5];
	}
	get lt() {
		return this.#buttons[6];
	}
	get rt() {
		return this.#buttons[7];
	}
	get back() {
		return this.#buttons[8];
	}
	get start() {
		return this.#buttons[9];
	}
	get lsb() {
		return this.#buttons[10];
	}
	get rsb() {
		return this.#buttons[11];
	}
	get up() {
		return this.#buttons[12];
	}
	get down() {
		return this.#buttons[13];
	}
	get left() {
		return this.#buttons[14];
	}
	get right() {
		return this.#buttons[15];
	}
	get home() {
		return this.#buttons[16];
	}
	get ls(): Vector2 {
		return this.#ls.clone();
	}
	get rs(): Vector2 {
		return this.#rs.clone();
	}
	get vibrating() {
		return this.#vibrating;
	}
	//#region DeadZone
	#lsDeadZoneMin = 0.01;
	#lsDeadZoneMax = 1;
	#lsLinearMapper = createLinearMapper(0.05, 1);
	#rsDeadZoneMin = 0.01;
	#rsDeadZoneMax = 1;
	#rsLinearMapper = this.#lsLinearMapper;
	#ltDeadZoneMin = 0.01;
	#ltDeadZoneMax = 1;
	#ltLinearMapper = this.#lsLinearMapper;
	#rtDeadZoneMin = 0.01;
	#rtDeadZoneMax = 1;
	#rtLinearMapper = this.#lsLinearMapper;
	get lsDeadZoneMin() {
		return this.#lsDeadZoneMin;
	}
	set lsDeadZoneMin(value: number) {
		if (!Number.isFinite(value)) return;
		value = clamp(0, value, 1);
		if (this.#lsDeadZoneMin === value) return;
		this.#lsLinearMapper = createLinearMapper(
			this.#lsDeadZoneMin,
			this.#lsDeadZoneMax,
		);
	}
	get lsDeadZoneMax() {
		return this.#lsDeadZoneMax;
	}
	set lsDeadZoneMax(value: number) {
		if (!Number.isFinite(value)) return;
		value = clamp(0, value, 1);
		if (this.#lsDeadZoneMax === value) return;
		this.#lsLinearMapper = createLinearMapper(
			this.#lsDeadZoneMin,
			this.#lsDeadZoneMax,
		);
	}
	get rsDeadZoneMin() {
		return this.#rsDeadZoneMin;
	}
	set rsDeadZoneMin(value: number) {
		if (!Number.isFinite(value)) return;
		value = clamp(0, value, 1);
		if (this.#rsDeadZoneMin === value) return;
		this.#rsLinearMapper = createLinearMapper(
			this.#rsDeadZoneMin,
			this.#rsDeadZoneMax,
		);
	}
	get rsDeadZoneMax() {
		return this.#rsDeadZoneMax;
	}
	set rsDeadZoneMax(value: number) {
		if (!Number.isFinite(value)) return;
		value = clamp(0, value, 1);
		if (this.#rsDeadZoneMax === value) return;
		this.#rsLinearMapper = createLinearMapper(
			this.#rsDeadZoneMin,
			this.#rsDeadZoneMax,
		);
	}
	get ltDeadZoneMin() {
		return this.#ltDeadZoneMin;
	}
	set ltDeadZoneMin(value: number) {
		if (!Number.isFinite(value)) return;
		value = clamp(0, value, 1);
		if (this.#ltDeadZoneMin === value) return;
		this.#ltLinearMapper = createLinearMapper(
			this.#ltDeadZoneMin,
			this.#ltDeadZoneMax,
		);
	}
	get ltDeadZoneMax() {
		return this.#ltDeadZoneMax;
	}
	set ltDeadZoneMax(value: number) {
		if (!Number.isFinite(value)) return;
		value = clamp(0, value, 1);
		if (this.#ltDeadZoneMax === value) return;
		this.#ltLinearMapper = createLinearMapper(
			this.#ltDeadZoneMin,
			this.#ltDeadZoneMax,
		);
	}
	get rtDeadZoneMin() {
		return this.#rtDeadZoneMin;
	}
	set rtDeadZoneMin(value: number) {
		if (!Number.isFinite(value)) return;
		value = clamp(0, value, 1);
		if (this.#rtDeadZoneMin === value) return;
		this.#rtLinearMapper = createLinearMapper(
			this.#rtDeadZoneMin,
			this.#rtDeadZoneMax,
		);
	}
	get rtDeadZoneMax() {
		return this.#rtDeadZoneMax;
	}
	set rtDeadZoneMax(value: number) {
		if (!Number.isFinite(value)) return;
		value = clamp(0, value, 1);
		if (this.#rtDeadZoneMax === value) return;
		this.#rtLinearMapper = createLinearMapper(
			this.#rtDeadZoneMin,
			this.#rtDeadZoneMax,
		);
	}
	//#region Vibration
	rumble({
		type,
		leftTrigger,
		rightTrigger,
		strongMagnitude,
		weakMagnitude,
	}: GameControllerRumbleOptions) {
		this.#vibrationType = type;
		this.#leftTrigger = leftTrigger;
		this.#rightTrigger = rightTrigger;
		this.#strongMagnitude = strongMagnitude;
		this.#weakMagnitude = weakMagnitude;
		this.#vibrating = true;
	}
	stopRumble() {
		this.#vibrating = false;
		navigator.getGamepads()[this.#index]?.vibrationActuator.reset();
	}
	rumbleOnce(
		type: GamepadHapticEffectType,
		params?: GamepadEffectParameters,
	): Promise<GamepadHapticsResult> | undefined {
		return navigator
			.getGamepads()
			[this.#index]?.vibrationActuator.playEffect(type, params);
	}
	#triggerEmitBefore = { lt: false, rt: false };
	#stickEmitBefore = { ls: false, rs: false };
	#emitTrigger(type: 'lt' | 'rt', value: number) {
		if (value === 0) {
			if (!this.#triggerEmitBefore[type]) return;
			this.#triggerEmitBefore[type] = false;
		} else {
			this.#triggerEmitBefore[type] = true;
		}
		this.#events.emit(new EventValue(type, { target: this, value }));
	}
	#emitStick(type: 'ls' | 'rs', stick: Vector2) {
		if (stick.length === 0) {
			if (!this.#stickEmitBefore[type]) return;
			this.#stickEmitBefore[type] = false;
		} else {
			this.#stickEmitBefore[type] = true;
		}
		const { x, y } = stick;
		this.#events.emit(new EventVector(type, { target: this, x, y }));
	}
	#gamepadCycle() {
		const gamepad = navigator.getGamepads()[this.#index];
		if (!gamepad) return;
		let arrow = false;
		// Buttons
		const buttons = gamepad.buttons.map((button, i) => {
			if (['lt', 'rt'].includes(BUTTONS[i])) return button.value;
			return button.pressed;
		}) as GamepadButtons;

		buttons.forEach((value, i) => {
			if (this.#buttons[i] === value) return;
			if ([6, 7].includes(i)) return;
			this.#buttons[i] = value;
			const event = new EventValue(BUTTONS[i], {
				target: this,
				value,
			});
			this.#events.emit(event as any);
			if (['up', 'right', 'down', 'left'].includes(BUTTONS[i])) arrow = true;
		});
		// Arrow
		if (arrow) {
			this.#events.emit(new EventBase('arrow', { target: this }));
		}
		// Trigger
		this.#buttons[6] = clamp(0, this.#ltLinearMapper(this.#buttons[6]), 1);
		this.#buttons[7] = clamp(0, this.#rtLinearMapper(this.#buttons[7]), 1);
		this.#emitTrigger('lt', this.#buttons[6]);
		this.#emitTrigger('rt', this.#buttons[7]);
		// Stick
		const { axes } = gamepad;
		this.#ls.x = axes[0];
		this.#ls.y = axes[1];
		this.#ls.length = clamp(0, this.#lsLinearMapper(this.#ls.length), 1);
		this.#rs.x = axes[2];
		this.#rs.y = axes[3];
		this.#rs.length = clamp(0, this.#rsLinearMapper(this.#rs.length), 1);
		this.#emitStick('ls', this.#ls);
		this.#emitStick('rs', this.#rs);
		// Vibration
		if (!this.#vibrating) return;
		gamepad.vibrationActuator.playEffect(this.#vibrationType, {
			startDelay: 0,
			duration: 200,
			leftTrigger: this.#leftTrigger,
			rightTrigger: this.#rightTrigger,
			strongMagnitude: this.#strongMagnitude,
			weakMagnitude: this.#weakMagnitude,
		});
	}
}
