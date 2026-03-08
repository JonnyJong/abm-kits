import {
	EventEmitter,
	type EventHandler,
	type Iter,
	RepeatingTriggerController,
	SetMap,
	sortByCodePoint,
	Timeout,
} from 'abm-utils';
import { DEFAULT } from '../constant';
import { $on } from '../infra/event';

//#region Define

type Key<T> = keyof T & string;
type Args<T, K extends Key<T>> = T[K] extends any[] ? T[K] : [T[K]];

export type KeyCode = (typeof RAW_KEY_CODE)[number];

export interface KeyboardEventMap {
	/** 按键按下 */
	down: [key: KeyCode];
	/** 按键释放 */
	up: [key: KeyCode];
	/** 按键按下并释放 */
	press: [key: KeyCode];
	/** 按键触发 */
	trigger: [key: KeyCode];
	/** 快捷键按下 */
	shortcut: [id: string];
	/** 快捷键触发 */
	shortcutTrigger: [id: string];
	/** 别名按键按下 */
	aliasDown: [name: string];
	/** 别名按键释放 */
	aliasUp: [name: string];
	/** 别名按键按下并释放 */
	aliasPress: [name: string];
	/** 别名按键触发 */
	aliasTrigger: [name: string];
	/** 按键绑定更新 */
	bindUpdate: [keys: KeyCode[]];
	/** 按键绑定结束 */
	bindEnd: [keys: KeyCode[]];
}

//#region Var

const BIND_DEACTIVATION_DELAY = 100;

const RAW_KEY_CODE = [
	'Escape',
	'F1',
	'F2',
	'F3',
	'F4',
	'F5',
	'F6',
	'F7',
	'F8',
	'F9',
	'F10',
	'F11',
	'F12',
	'F13',
	'F14',
	'F15',
	'F16',
	'F17',
	'F18',
	'F19',
	'F20',
	'CapsLock',
	'ControlLeft',
	'AltLeft',
	'ShiftLeft',
	'ControlRight',
	'AltRight',
	'ShiftRight',
	'Tab',
	'Backquote',
	'Digit0',
	'Digit1',
	'Digit2',
	'Digit3',
	'Digit4',
	'Digit5',
	'Digit6',
	'Digit7',
	'Digit8',
	'Digit9',
	'Minus',
	'Equal',
	'Backspace',
	'Enter',
	'BracketLeft',
	'BracketRight',
	'Backslash',
	'Semicolon',
	'Quote',
	'Comma',
	'Period',
	'Slash',
	'Space',
	'Home',
	'End',
	'PageUp',
	'PageDown',
	'ArrowUp',
	'ArrowRight',
	'ArrowDown',
	'ArrowLeft',
	'KeyA',
	'KeyB',
	'KeyC',
	'KeyD',
	'KeyE',
	'KeyF',
	'KeyG',
	'KeyH',
	'KeyI',
	'KeyJ',
	'KeyK',
	'KeyL',
	'KeyM',
	'KeyN',
	'KeyO',
	'KeyP',
	'KeyQ',
	'KeyR',
	'KeyS',
	'KeyT',
	'KeyU',
	'KeyV',
	'KeyW',
	'KeyX',
	'KeyY',
	'KeyZ',
	'Numpad0',
	'Numpad1',
	'Numpad2',
	'Numpad3',
	'Numpad4',
	'Numpad5',
	'Numpad6',
	'Numpad7',
	'Numpad8',
	'Numpad9',
	'NumpadAdd',
	'NumpadSubtract',
	'NumpadMultiply',
	'NumpadDivide',
	'NumpadDecimal',
] as const;

const keyCode = new Set<KeyCode>(RAW_KEY_CODE);

export const KEY_CODE = Object.freeze({
	has(code: KeyCode | (string & {})): code is KeyCode {
		return keyCode.has(code as any);
	},
	[Symbol.iterator](): Iter<KeyCode> {
		return keyCode.values();
	},
	values(): Iter<KeyCode> {
		return keyCode.values();
	},
	size: keyCode.size,
});

const WEB_NAVIGATE_KEYS = new Set<KeyCode>([
	'ArrowUp',
	'ArrowRight',
	'ArrowDown',
	'ArrowLeft',
	'Space',
	'Tab',
]);

const INPUT_MODE_KEYS = new Set<KeyCode>(['Tab']);

let PREVENT_KEYS = WEB_NAVIGATE_KEYS;

/** 当前激活的按键 */
const activated = new Set<KeyCode>();
const triggerController = new RepeatingTriggerController(trigger);

//#region Helper

function checkKey(key: KeyCode) {
	if (KEY_CODE.has(key)) return;
	throw new Error(`Undefined key code: ${key}`);
}

function checkKeys(keys: Iterable<KeyCode>) {
	for (const key of keys) {
		if (KEY_CODE.has(key)) continue;
		throw new Error(`Undefined key code detected: ${[...keys].join(' + ')}`);
	}
}

function joinKeys(keys: Iterable<KeyCode>) {
	return sortByCodePoint([...keys]).join('+');
}

function splitKeys(keys: string): Set<KeyCode> {
	return new Set(keys.split('+') as any);
}

//#region Handler

function trigger() {
	if (binding) return;
	const alias: string[] = [];
	for (const key of activated) {
		emit('trigger', key);
		const a = reverseAlias.get(key);
		if (a) alias.push(...a);
	}
	for (const id of new Set(alias)) {
		emit('aliasTrigger', id);
	}
	emitShortcut(true);
}

function keyDownHandler(event: KeyboardEvent) {
	// Check
	if (blocked) return;
	if (event.isComposing) return;
	const key = event.code as KeyCode;
	if (!KEY_CODE.has(key)) return;
	if (PREVENT_KEYS.has(key)) {
		event.preventDefault();
	}
	if (activated.has(key)) return;
	activated.add(key);
	// Bind
	if (binding) return handleBindDown(key);
	// Down
	emit('down', key);
	// Alias
	emitAlias(key, 'aliasDown');
	// Shortcut
	emitShortcut();
	// Trigger
	triggerController.restart();
}

function keyUpHandler(event: KeyboardEvent) {
	// Check
	if (blocked) return;
	if (event.isComposing) return;
	const key = event.code as KeyCode;
	if (!KEY_CODE.has(key)) return;
	if (!activated.has(key)) return;
	activated.delete(key);
	if (activated.size === 0) triggerController.stop();
	// Bind
	if (binding) return handleBindUp(key);
	// Up
	emit('up', key);
	// Press
	emit('press', key);
	// Alias
	emitAlias(key, 'aliasUp', 'aliasPress');
}

function blurHandler() {
	triggerController.stop();
	if (binding) return handleBindBlur();
	for (const key of activated) {
		emit('up', key);
		emitAlias(key, 'aliasUp');
	}
	activated.clear();
}

//#region Shortcut

/**
 * 快捷键图
 * @description
 * 快捷键键值需通过 {@link joinKeys} 函数合并
 */
const shortcuts = new SetMap<string, string>();
/**
 * 快捷键反查图
 * @description
 * 快捷键键值需通过 {@link joinKeys} 函数合并
 */
const reverseShortcuts = new SetMap<string, string>();

function emitShortcut(trigger?: boolean) {
	const k = joinKeys(activated);
	const shortcuts = reverseShortcuts.get(k);
	if (!shortcuts) return;
	for (const id of shortcuts) {
		emit<'shortcut' | 'shortcutTrigger'>(
			trigger ? 'shortcutTrigger' : 'shortcut',
			id,
		);
	}
}

/** 键盘快捷键 API */
const shortcut = Object.freeze({
	/** 查询是否有指定 ID 的快捷键组 */
	hasId(id: string): boolean {
		return shortcuts.hasKey(id);
	},
	/** 查询是否有指定 ID 的快捷键 */
	has(id: string, keys: Iterable<KeyCode>): boolean {
		const k = joinKeys(keys);
		return shortcuts.has(id, k);
	},
	/** 获取指定 ID 的快捷键的所有按键组合 */
	get(id: string): Set<KeyCode>[] {
		return [...(shortcuts.get(id) ?? [])].map(splitKeys);
	},
	/**
	 * 设置快捷键
	 * @description 为指定 ID 设置多组快捷键
	 * @param id 快捷键 ID
	 * @param set 快捷键组
	 */
	set(id: string, set: Iterable<Iterable<KeyCode>>): void {
		const keys = [...set].map((keys) => {
			checkKeys(keys);
			return joinKeys(keys);
		});
		for (const k of shortcuts.get(id) ?? []) {
			reverseShortcuts.delete(k, id);
		}
		shortcuts.set(id, keys);
		for (const k of keys) {
			reverseShortcuts.add(k, id);
		}
	},
	/**
	 * 添加快捷键
	 * @description 为指定 ID 添加一个快捷键
	 * @param id 快捷键 ID
	 * @param group 快捷键
	 */
	add(id: string, keys: Iterable<KeyCode>): void {
		checkKeys(keys);
		const k = joinKeys(keys);
		shortcuts.add(id, k);
		reverseShortcuts.add(k, id);
	},
	/**
	 * 移除快捷键
	 * @description 为指定 ID 移除一个快捷键
	 * @param id 快捷键 ID
	 * @param group 快捷键
	 */
	rm(id: string, keys: Iterable<KeyCode>): void {
		const k = joinKeys(keys);
		shortcuts.delete(id, k);
		reverseShortcuts.delete(k, id);
	},
	/**
	 * 删除快捷键
	 * @description 移除指定 ID 的所有快捷键
	 * @param id 快捷键 ID
	 */
	delete(id: string): void {
		const keys = shortcuts.get(id);
		if (!keys) return;
		for (const k of keys) {
			reverseShortcuts.delete(k, id);
		}
		shortcuts.deleteKey(id);
	},
	/** 遍历所有快捷键 */
	[Symbol.iterator](): Iterator<[string, Set<KeyCode>[]]> {
		return this.entires();
	},
	/** 遍历所有快捷键 */
	*entires(): Iterator<[string, Set<KeyCode>[]]> {
		for (const [name, items] of shortcuts) {
			yield [name, [...items].map(splitKeys)];
		}
	},
	/** 遍历所有快捷键 ID */
	keys(): Iterator<string> {
		return shortcuts.keys();
	},
	/** 检查对应 ID 的快捷键是否激活中 */
	isActivated(id: string): boolean {
		return shortcuts.get(id)?.has(joinKeys(activated)) ?? false;
	},
});

//#region Alias

const aliasMap = new SetMap<string, KeyCode>();

const reverseAlias = new SetMap<KeyCode, string>();

/** 按键别名 API */
const alias = Object.freeze({
	/** 查询指定 ID 的按键别名是否存在 */
	hasId(id: string): boolean {
		return aliasMap.hasKey(id);
	},
	/** 查询是否有指定 ID 的按键别名是否有某个按键 */
	has(id: string, key: KeyCode): boolean {
		return aliasMap.has(id, key);
	},
	/** 获取指定 ID 的按键别名的所有按键 */
	get(id: string): KeyCode[] {
		return [...(aliasMap.get(id) ?? [])];
	},
	/**
	 * 设置按键别名
	 * @description 为指定 ID 的按键别名设置多个按键
	 * @param id 按键别名 ID
	 * @param keys 一组按键
	 */
	set(id: string, keys: Iterable<KeyCode>): void {
		for (const key of keys) checkKey(key);
		for (const key of aliasMap.get(id) ?? []) {
			reverseAlias.delete(key, id);
		}
		aliasMap.set(id, keys);
		for (const key of keys) {
			reverseAlias.add(key, id);
		}
	},
	/**
	 * 添加按键别名
	 * @description 为指定 ID 的按键别名添加一个按键
	 * @param id 按键别名 ID
	 * @param key 按键
	 */
	add(id: string, key: KeyCode): void {
		checkKey(key);
		aliasMap.add(id, key);
		reverseAlias.add(key, id);
	},
	/**
	 * 移除按键别名
	 * @description 为指定 ID 的按键别名移除一个按键
	 * @param id 按键别名 ID
	 * @param key 按键
	 */
	rm(id: string, key: KeyCode): void {
		aliasMap.delete(id, key);
		reverseAlias.delete(key, id);
	},
	/**
	 * 删除按键别名
	 * @description 移除指定 ID 的按键别名的所有按键
	 * @param id 按键别名 ID
	 */
	delete(id: string): void {
		const keys = aliasMap.get(id);
		if (!keys) return;
		for (const key of keys) {
			reverseAlias.delete(key, id);
		}
		aliasMap.deleteKey(id);
	},
	/** 遍历所有按键别名 */
	[Symbol.iterator](): Iterator<[string, KeyCode[]]> {
		return this.entires();
	},
	/** 遍历所有按键别名 */
	*entires(): Iterator<[string, KeyCode[]]> {
		for (const [name, items] of aliasMap) {
			yield [name, [...items]];
		}
	},
	/** 遍历所有按键别名 ID */
	keys(): Iterator<string> {
		return aliasMap.keys();
	},
	/** 检查按键别名 ID 对应的按键是否激活中 */
	isActivated(id: string): boolean {
		const keys = aliasMap.get(id);
		if (!keys) return false;
		for (const key of keys) {
			if (activated.has(key)) return true;
		}
		return false;
	},
});

function emitAlias(
	key: KeyCode,
	...events: (keyof KeyboardEventMap & `alias${string}`)[]
): void {
	const alias = reverseAlias.get(key);
	if (!alias) return;
	for (const e of events) {
		for (const id of alias) {
			emit(e, id);
		}
	}
}

//#region Event

const emitter = new EventEmitter<KeyboardEventMap>();

/**
 * 注册事件监听器
 * @param event 要监听的事件类型
 * @param handler 事件处理函数
 * @description
 * - `down`：按键被按下
 * - `up`：按键被松开
 * - `press`：按键被按下后松开
 * - `trigger`：按键被按下（按住重复触发）
 * - `shortcut`：快捷键按下
 * - `shortcutTrigger`：快捷键按下（按住重复触发）
 * - `aliasDown`：别名按键被按下
 * - `aliasUp`：别名按键被松开
 * - `aliasPress`：别名按键被按下后松开
 * - `aliasTrigger`：别名按键被按下（按住重复触发）
 */
function on<K extends Key<KeyboardEventMap>>(
	event: K,
	handler: EventHandler<Args<KeyboardEventMap, K>>,
): void {
	emitter.on<K>(event, handler);
}

/**
 * 注册一次性事件监听器
 * @param event 要监听的事件类型
 * @param handler 事件处理函数
 * @description
 * - `down`：按键被按下
 * - `up`：按键被松开
 * - `press`：按键被按下后松开
 * - `trigger`：按键被按下（按住重复触发）
 * - `shortcut`：快捷键按下
 * - `shortcutTrigger`：快捷键按下（按住重复触发）
 * - `aliasDown`：别名按键被按下
 * - `aliasUp`：别名按键被松开
 * - `aliasPress`：别名按键被按下后松开
 * - `aliasTrigger`：别名按键被按下（按住重复触发）
 */
function once<K extends Key<KeyboardEventMap>>(
	event: K,
	handler: EventHandler<Args<KeyboardEventMap, K>>,
): void {
	emitter.once<K>(event, handler);
}

/**
 * 移除事件监听器
 * @param event 要移除的事件类型
 * @param handler 要移除的事件处理函数
 * @description
 * - `down`：按键被按下
 * - `up`：按键被松开
 * - `press`：按键被按下后松开
 * - `trigger`：按键被按下（按住重复触发）
 * - `shortcut`：快捷键按下
 * - `shortcutTrigger`：快捷键按下（按住重复触发）
 * - `aliasDown`：别名按键被按下
 * - `aliasUp`：别名按键被松开
 * - `aliasPress`：别名按键被按下后松开
 * - `aliasTrigger`：别名按键被按下（按住重复触发）
 */
function off<K extends Key<KeyboardEventMap>>(
	event: K,
	handler: EventHandler<Args<KeyboardEventMap, K>>,
): void {
	emitter.off<K>(event, handler);
}

function emit<K extends Key<KeyboardEventMap>>(
	event: K,
	...args: Args<KeyboardEventMap, K>
) {
	emitter.emit<K>(event, ...args);
}

//#region Binder

/** 正在绑定 */
let binding = false;
const bindActivated = new Set<KeyCode>();
const bindDeactivating = new Set<KeyCode>();
const bindTimeout = new Timeout(() => {
	deactivateBind();
	emitBind();
}, BIND_DEACTIVATION_DELAY);

/** 触发绑定事件 */
function emitBind(end?: boolean) {
	emit(end ? 'bindEnd' : 'bindUpdate', [...bindActivated]);
}

/** 确认取消松开按键的绑定 */
function deactivateBind() {
	for (const key of bindDeactivating) bindActivated.delete(key);
	bindDeactivating.clear();
}

/** 处理按键绑定按下 */
function handleBindDown(key: KeyCode) {
	// Clear
	if (bindTimeout.running) {
		bindTimeout.stop();
		deactivateBind();
	}
	// Add
	bindActivated.add(key);
	emitBind();
}

/** 处理按键绑定松开 */
function handleBindUp(key: KeyCode) {
	// Deactivate
	bindDeactivating.add(key);
	// Done
	if (bindDeactivating.size === bindActivated.size) {
		binding = false;
		bindTimeout.stop();
		emitBind(true);
		return;
	}
	// Wait
	bindTimeout.restart();
}

/** 处理按键绑定时失去焦点 */
function handleBindBlur() {
	bindTimeout.stop();
	bindActivated.clear();
	emitBind();
}

/** 按键绑定 API */
const bind = Object.freeze({
	/** 是否正在绑定 */
	get binding() {
		return binding;
	},
	/**
	 * 开始
	 * @returns 若正在绑定，将不会中断正在进行的按键绑定，并返回 `false`
	 */
	start(): boolean {
		if (binding) return false;
		binding = true;
		bindActivated.clear();
		bindDeactivating.clear();
		return true;
	},
	/**
	 * 停止
	 * @returns 若未在绑定，返回 `false`
	 */
	stop(): boolean {
		if (!binding) return false;
		binding = false;
		return true;
	},
});

//#region Other

function setInputMode(enable: boolean) {
	// TODO: 需要更好的处理方式
	PREVENT_KEYS = enable ? INPUT_MODE_KEYS : WEB_NAVIGATE_KEYS;
}

function isInputMode(): boolean {
	return PREVENT_KEYS === INPUT_MODE_KEYS;
}

let blocked = false;
/** 禁用键盘 API */
export function setKeyboardBlock(value: boolean) {
	if (value === blocked) return;
	blocked = value;
	if (value) blurHandler();
}

/** 检查按键是否激活 */
function isActivated(key: KeyCode): boolean {
	return activated.has(key);
}

//#region Init
$on(window, 'keydown', keyDownHandler);
$on(window, 'keyup', keyUpHandler);
$on(window, 'blur', blurHandler);

for (const [id, keys] of Object.entries(DEFAULT.SHORTCUT)) {
	shortcut.add(id, keys);
}
for (const [id, keys] of Object.entries(DEFAULT.ALIAS)) {
	alias.set(id, keys);
}

//#region Exports
/** 键盘 API */
export const keyboard = {
	/** 键盘快捷键 API */
	shortcut,
	/** 按键别名 API */
	alias,
	/** 按键绑定 API */
	bind,
	on,
	once,
	off,
	isActivated,
	setInputMode,
	isInputMode,
};
