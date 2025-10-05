import {
	areSetEqual,
	EventBase,
	EventBaseInit,
	EventHandler,
	EventKey,
	EventKeyInit,
	Events,
	EventsList,
	IEventSource,
	RepeatingTriggerController,
} from 'abm-utils';

declare global {
	class KeyboardLayoutMap {
		readonly size: number;
		entries(): MapIterator<[string, string]>;
		forEach<T = KeyboardLayoutMap>(
			callbackfn: (this: T, value: string, key: string, map: this) => void,
			thisArg?: T,
		): void;
		get(key: string): string | undefined;
		has(key: string): boolean;
		keys(): MapIterator<string>;
		values(): MapIterator<string>;
	}
	class Keyboard extends EventTarget {
		getLayoutMap(): Promise<KeyboardLayoutMap>;
		lock(keyCodes?: string[]): Promise<void>;
		unlock(): void;
	}
	interface Navigator {
		readonly keyboard: Keyboard;
	}
}

export const DEFAULT_SHORTCUT_MAP: KeyBindMap = {
	'ui.navNext': [new Set(['Tab'])],
	'ui.navPrev': [new Set(['Tab', 'ShiftLeft'])],
};

export const DEFAULT_ALIAS_MAP: AliasMap = {
	'ui.confirm': new Set(['Enter', 'Space']),
	'ui.cancel': new Set(['Escape']),
	'ui.up': new Set(['ArrowUp']),
	'ui.right': new Set(['ArrowRight']),
	'ui.down': new Set(['ArrowDown']),
	'ui.left': new Set(['ArrowLeft']),
	'ui.selectMulti': new Set(['ControlLeft', 'ControlRight']),
	'ui.selectRange': new Set(['ShiftLeft', 'ShiftRight']),
};

export type KeysAllow =
	| 'Escape'
	| 'F1'
	| 'F2'
	| 'F3'
	| 'F4'
	| 'F5'
	| 'F6'
	| 'F7'
	| 'F8'
	| 'F9'
	| 'F10'
	| 'F11'
	| 'F12'
	| 'F13'
	| 'F14'
	| 'F15'
	| 'F16'
	| 'F17'
	| 'F18'
	| 'F19'
	| 'F20'
	| 'CapsLock'
	| 'ControlLeft'
	| 'AltLeft'
	| 'ShiftLeft'
	| 'ControlRight'
	| 'AltRight'
	| 'ShiftRight'
	| 'Tab'
	| 'Backquote'
	| 'Digit0'
	| 'Digit1'
	| 'Digit2'
	| 'Digit3'
	| 'Digit4'
	| 'Digit5'
	| 'Digit6'
	| 'Digit7'
	| 'Digit8'
	| 'Digit9'
	| 'Minus'
	| 'Equal'
	| 'Backspace'
	| 'Enter'
	| 'BracketLeft'
	| 'BracketRight'
	| 'Backslash'
	| 'Semicolon'
	| 'Quote'
	| 'Comma'
	| 'Period'
	| 'Slash'
	| 'Space'
	| 'Home'
	| 'End'
	| 'PageUp'
	| 'PageDown'
	| 'ArrowUp'
	| 'ArrowRight'
	| 'ArrowDown'
	| 'ArrowLeft'
	| 'KeyA'
	| 'KeyB'
	| 'KeyC'
	| 'KeyD'
	| 'KeyE'
	| 'KeyF'
	| 'KeyG'
	| 'KeyH'
	| 'KeyI'
	| 'KeyJ'
	| 'KeyK'
	| 'KeyL'
	| 'KeyM'
	| 'KeyN'
	| 'KeyO'
	| 'KeyP'
	| 'KeyQ'
	| 'KeyR'
	| 'KeyS'
	| 'KeyT'
	| 'KeyU'
	| 'KeyV'
	| 'KeyW'
	| 'KeyX'
	| 'KeyY'
	| 'KeyZ'
	| 'Numpad0'
	| 'Numpad1'
	| 'Numpad2'
	| 'Numpad3'
	| 'Numpad4'
	| 'Numpad5'
	| 'Numpad6'
	| 'Numpad7'
	| 'Numpad8'
	| 'Numpad9'
	| 'NumpadAdd'
	| 'NumpadSubtract'
	| 'NumpadMultiply'
	| 'NumpadDivide'
	| 'NumpadDecimal';
export const KEYS_ALLOW: readonly KeysAllow[] = Object.freeze([
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
]);

const DEFAULT_WEB_BEHAVIOR_RELATED_BUTTONS = new Set<KeysAllow>([
	'ArrowUp',
	'ArrowRight',
	'ArrowDown',
	'ArrowLeft',
	'Space',
	'Tab',
]);

export type KeyBindItem = Set<KeysAllow>;
export type KeyBindGroup = KeyBindItem[];
export type KeyBindMap = {
	[id: string]: KeyBindGroup;
};
export type AliasItem = Set<KeysAllow>;
export type AliasMap = {
	[id: string]: AliasItem;
};

const BINDING = Symbol();
const DEACTIVATION_DELAY = 100;

interface KeyBinderEventsInit {
	update: EventBaseInit<KeyBinder>;
	done: EventBaseInit<KeyBinder>;
}

export interface KeyBinderEvents extends EventsList<KeyBinderEventsInit> {}

interface KeyboardEventsInit {
	down: EventKeyInit<KeyboardManager, KeysAllow>;
	up: EventKeyInit<KeyboardManager, KeysAllow>;
	press: EventKeyInit<KeyboardManager, KeysAllow>;
	trigger: EventKeyInit<KeyboardManager, KeysAllow>;
	shortcut: EventKeyInit<KeyboardManager, string>;
	shortcutTrigger: EventKeyInit<KeyboardManager, string>;
	aliasDown: EventKeyInit<KeyboardManager, string>;
	aliasUp: EventKeyInit<KeyboardManager, string>;
	aliasPress: EventKeyInit<KeyboardManager, string>;
	aliasTrigger: EventKeyInit<KeyboardManager, string>;
}

export interface KeyboardEvents extends EventsList<KeyboardEventsInit> {}

//#region Binder
class KeyBinder implements IEventSource<KeyBinderEventsInit> {
	#events = new Events<KeyBinderEventsInit>(['done', 'update']);
	#binding = true;
	#activated = new Set<string>();
	#deactivating = new Set<string>();
	#timer: number | null = null;
	constructor() {
		window.addEventListener('keydown', this.#keyDownHandler);
		window.addEventListener('keyup', this.#keyUpHandler);
		window.addEventListener('blur', this.#blurHandler);
	}
	#keyDownHandler = (event: KeyboardEvent) => {
		if (event.isComposing) return;
		if (!KEYS_ALLOW.includes(event.code as any)) return;
		if (this.#activated.has(event.code) && !this.#deactivating.has(event.code))
			return;

		// Clear
		if (this.#timer !== null) {
			clearTimeout(this.#timer);
			this.#timer = null;
			for (const key of this.#deactivating) {
				this.#activated.delete(key);
			}
			this.#deactivating.clear();
		}
		// Add
		this.#activated.add(event.code);
		this.#events.emit(new EventBase('update', { target: this }));
	};
	#keyUpHandler = (event: KeyboardEvent) => {
		if (event.isComposing) return;
		if (!KEYS_ALLOW.includes(event.code as any)) return;

		// Deactivate
		this.#deactivating.add(event.code);
		// Done
		if (this.#deactivating.size === this.#activated.size) {
			this.cancel();
			if (this.#timer !== null) {
				clearTimeout(this.#timer);
				this.#timer = null;
			}
			this.#events.emit(new EventBase('done', { target: this }));
			return;
		}
		// Wait
		if (this.#timer !== null) {
			clearTimeout(this.#timer);
			this.#timer = null;
		}
		this.#timer = setTimeout(() => {
			this.#timer = null;
			for (const key of this.#deactivating) {
				this.#activated.delete(key);
			}
			this.#deactivating.clear();
			this.#events.emit(new EventBase('update', { target: this }));
		}, DEACTIVATION_DELAY);
	};
	#blurHandler = () => {
		if (this.#timer !== null) {
			clearTimeout(this.#timer);
			this.#timer = null;
		}
		this.#activated.clear();
		this.#events.emit(new EventBase('update', { target: this }));
	};
	/** 取消当前按键绑定 */
	cancel() {
		window.removeEventListener('keydown', this.#keyDownHandler);
		window.removeEventListener('keyup', this.#keyUpHandler);
		window.removeEventListener('blur', this.#blurHandler);
		keyboard[BINDING] = false;
	}
	/** 是否正在绑定 */
	get binding() {
		return this.#binding;
	}
	/** 获取按下的按键 */
	get keys(): Set<KeysAllow> {
		return new Set(this.#activated) as any;
	}
	/**
	 * 注册事件监听器
	 * @param type - 要监听的事件类型
	 * @param handler - 事件处理函数
	 * @description
	 * - `update`：按下按键发生变化
	 * - `done`：用户完成按键输入
	 */
	on<Type extends keyof KeyBinderEventsInit>(
		type: Type,
		handler: EventHandler<Type, KeyBinderEventsInit[Type], KeyBinder>,
	): void {
		this.#events.on(type, handler);
	}
	/**
	 * 注册一次性事件监听器
	 * @param type - 要监听的事件类型
	 * @param handler - 事件处理函数
	 * @description
	 * - `update`：按下按键发生变化
	 * - `done`：用户完成按键输入
	 */
	once<Type extends keyof KeyBinderEventsInit>(
		type: Type,
		handler: EventHandler<Type, KeyBinderEventsInit[Type], KeyBinder>,
	): void {
		this.#events.once(type, handler);
	}
	/**
	 * 移除事件监听器
	 * @param type - 要移除的事件类型
	 * @param handler - 要移除的事件处理函数
	 * @description
	 * - `update`：按下按键发生变化
	 * - `done`：用户完成按键输入
	 */
	off<Type extends keyof KeyBinderEventsInit>(
		type: Type,
		handler: EventHandler<Type, KeyBinderEventsInit[Type], KeyBinder>,
	): void {
		this.#events.off(type, handler);
	}
}

//#region Manager
class KeyboardManager implements IEventSource<KeyboardEventsInit> {
	#events = new Events<KeyboardEventsInit>([
		'down',
		'up',
		'press',
		'trigger',
		'shortcut',
		'shortcutTrigger',
		'aliasDown',
		'aliasUp',
		'aliasPress',
		'aliasTrigger',
	]);
	#map: KeyBindMap = DEFAULT_SHORTCUT_MAP;
	#aliasMap: AliasMap = DEFAULT_ALIAS_MAP;
	#activated = new Set<KeysAllow>();
	[BINDING] = false;
	constructor() {
		window.addEventListener('keydown', this.#keyDownHandler);
		window.addEventListener('keyup', this.#keyUpHandler);
		window.addEventListener('blur', this.#blurHandler);
	}
	#trigger = () => {
		for (const key of this.#activated) {
			this.#events.emit(new EventKey('trigger', { target: this, key }));
			for (const id of this.#findAlias(key)) {
				this.#events.emit(new EventKey('aliasTrigger', { target: this, key: id }));
			}
		}
		this.#tryShortcut(true);
	};
	#triggerController = new RepeatingTriggerController(this.#trigger);
	#tryShortcut(trigger?: boolean) {
		FIND_ID: for (const [id, group] of Object.entries(this.#map)) {
			for (const item of group) {
				if (!areSetEqual(item, this.#activated)) continue;
				this.#events.emit(
					new EventKey('shortcut', {
						target: this,
						key: id,
					}),
				);
				if (!trigger) continue FIND_ID;
				this.#events.emit(
					new EventKey('shortcutTrigger', {
						target: this,
						key: id,
					}),
				);
				continue FIND_ID;
			}
		}
	}
	#findAlias(key: string): string[] {
		const ids: string[] = [];
		for (const [id, item] of Object.entries(this.#aliasMap)) {
			if (item.has(key as any)) ids.push(id);
		}
		return ids;
	}
	#checkItem(item: KeyBindItem | AliasItem) {
		for (const key of item) {
			if (KEYS_ALLOW.includes(key)) continue;
			throw new Error('Invalid key bind item.');
		}
	}
	/**
	 * 当前正按下的按键
	 * @readonly
	 */
	get pressing() {
		return [...this.#activated];
	}
	//#region ShortCut
	/** 快捷键绑定 */
	get bindMap() {
		const result: KeyBindMap = {};
		for (const [id, group] of Object.entries(this.#map)) {
			result[id] = group.map((item) => new Set(item as any));
		}
		return result;
	}
	set bindMap(value: KeyBindMap) {
		const map: KeyBindMap = {};
		for (const [id, group] of Object.entries(value)) {
			if (typeof id !== 'string' || !Array.isArray(group))
				throw new Error('Invalid key bind map.');
			map[id] = [];
			for (const item of group) {
				this.#checkItem(item);
				if (map[id].find((v) => areSetEqual(v, item))) continue;
				map[id].push(new Set(item as any));
			}
		}
		this.#map = map;
	}
	/**
	 * 设置快捷键
	 * @description 为同一 id 设置多组快捷键
	 * @param id - 快捷键 id
	 * @param group - 快捷键组
	 */
	set(id: string, group: KeyBindGroup): void {
		if (typeof id !== 'string') return;
		if (!Array.isArray(group)) throw new Error('Invalid key bind group.');
		const newGroup: KeyBindGroup = [];
		for (const item of group) {
			this.#checkItem(item);
			if (newGroup.find((v) => areSetEqual(v, item))) continue;
			newGroup.push(new Set(item as any));
		}
		this.#map[id] = newGroup;
	}
	/**
	 * 添加快捷键
	 * @description 为一 id 添加一个快捷键
	 * @param id - 快捷键 id
	 * @param group - 快捷键
	 */
	add(id: string, item: KeyBindItem): boolean {
		if (typeof id !== 'string') return false;
		this.#checkItem(item);
		if (this.#map[id]?.find((v) => areSetEqual(v, item))) return false;
		if (!this.#map[id]) this.#map[id] = [];
		this.#map[id].push(new Set(item as any));
		return true;
	}
	/**
	 * 移除快捷键
	 * @description 为一 id 移除一个快捷键
	 * @param id - 快捷键 id
	 * @param group - 快捷键
	 */
	rm(id: string, item: KeyBindItem): boolean {
		if (typeof id !== 'string' || !this.#map[id]) return false;
		const index = this.#map[id].findIndex((v) => areSetEqual(v, item));
		if (index === -1) return false;
		this.#map[id].splice(index, 1);
		return true;
	}
	/**
	 * 删除快捷键
	 * @description 移除一 id 的所有快捷键
	 * @param id - 快捷键 id
	 */
	delete(id: string): boolean {
		if (typeof id !== 'string') return false;
		if (!this.#map[id]) return false;
		delete this.#map[id];
		return true;
	}
	//#region Alias
	/** 按键别名 */
	get aliasMap() {
		const result: AliasMap = {};
		for (const [id, item] of Object.entries(this.#aliasMap)) {
			result[id] = new Set(item);
		}
		return result;
	}
	set aliasMap(value: AliasMap) {
		const map: AliasMap = {};
		for (const [id, item] of Object.entries(value)) {
			if (typeof id !== 'string') throw new Error('Invalid key bind map.');
			this.#checkItem(item);
			map[id] = new Set(item);
		}
		this.#aliasMap = map;
	}
	/**
	 * 设置按键别名
	 * @description 为多个按键设置同一别名
	 * @param id - 别名
	 * @param item - 按键
	 */
	setAlias(id: string, item: AliasItem): void {
		if (typeof id !== 'string') return;
		this.#checkItem(item);
		this.#aliasMap[id] = new Set(item);
	}
	/**
	 * 设置按键别名
	 * @description 将一个按键设置到一个别名
	 * @param id - 别名
	 * @param key - 按键
	 */
	addAlias(id: string, key: KeysAllow): boolean {
		if (typeof id !== 'string') return false;
		if (!KEYS_ALLOW.includes(key)) return false;
		if (this.#aliasMap[id]) this.#aliasMap[id].add(key);
		else this.#aliasMap[id] = new Set([key]);
		return true;
	}
	/**
	 * 移除按键别名
	 * @description 移除一个别名下的一个按键
	 * @param id - 别名
	 * @param key - 按键
	 */
	rmAlias(id: string, key: KeysAllow): boolean {
		if (typeof id !== 'string' || !this.#map[id]) return false;
		return this.#aliasMap[id].delete(key);
	}
	/**
	 * 删除别名
	 * @description 删除一个别名
	 * @param id - 别名
	 */
	deleteAlias(id: string): boolean {
		if (typeof id !== 'string') return false;
		if (!this.#aliasMap[id]) return false;
		delete this.#aliasMap[id];
		return true;
	}
	/**
	 * 检查别名按键是否激活中
	 * @param id - 别名
	 */
	isAliasActivated(id: string): boolean {
		const keys = this.#aliasMap[id];
		if (!keys) return false;
		for (const key of keys) {
			if (this.#activated.has(key)) return true;
		}
		return false;
	}
	//#region Bind
	/**
	 * 获取按键绑定器
	 * @description 当需要从用户输入获取快捷键时，使用该按键绑定器
	 */
	bind(): KeyBinder | null {
		if (this[BINDING]) return null;
		this[BINDING] = true;
		return new KeyBinder();
	}
	//#region Event
	preventDefaultWebBehavior = true;
	#keyDownHandler = (event: KeyboardEvent) => {
		if (
			this.preventDefaultWebBehavior &&
			DEFAULT_WEB_BEHAVIOR_RELATED_BUTTONS.has(event.code as any)
		)
			event.preventDefault();
		if (this[BINDING]) return;
		if (event.isComposing) return;
		if (!KEYS_ALLOW.includes(event.code as any)) return;
		const alias = this.#findAlias(event.code);
		const trigger = this.#activated.has(event.code as KeysAllow);
		this.#activated.add(event.code as KeysAllow);
		// Trigger & AliasTrigger & ShortcutTrigger
		this.#triggerController.restart();
		// Down Check
		if (trigger) return;
		// Down
		this.#events.emit(
			new EventKey('down', {
				target: this,
				key: event.code as KeysAllow,
			}),
		);
		// AliasDown
		for (const id of alias) {
			this.#events.emit(new EventKey('aliasDown', { target: this, key: id }));
		}
		// Shortcut
		this.#tryShortcut();
	};
	#keyUpHandler = (event: KeyboardEvent) => {
		if (this[BINDING]) return;
		if (event.isComposing) return;
		if (!KEYS_ALLOW.includes(event.code as any)) return;
		this.#activated.delete(event.code as KeysAllow);
		if (this.#activated.size === 0) this.#triggerController.stop();
		const alias = this.#findAlias(event.code);
		// Up
		this.#events.emit(
			new EventKey('up', {
				target: this,
				key: event.code as KeysAllow,
			}),
		);
		for (const id of alias) {
			this.#events.emit(new EventKey('aliasUp', { target: this, key: id }));
		}
		// Press
		this.#events.emit(
			new EventKey('press', {
				target: this,
				key: event.code as KeysAllow,
			}),
		);
		for (const id of alias) {
			this.#events.emit(new EventKey('aliasPress', { target: this, key: id }));
		}
	};
	#blurHandler = () => {
		this.#triggerController.stop();
		const pressed = [...this.#activated];
		this.#activated.clear();
		for (const key of pressed) {
			const alias = this.#findAlias(key);
			this.#events.emit(
				new EventKey('up', {
					target: this,
					key,
				}),
			);
			for (const id of alias) {
				this.#events.emit(new EventKey('aliasUp', { target: this, key: id }));
			}
		}
	};
	/**
	 * 注册事件监听器
	 * @param type - 要监听的事件类型
	 * @param handler - 事件处理函数
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
	on<Type extends keyof KeyboardEventsInit>(
		type: Type,
		handler: EventHandler<Type, KeyboardEventsInit[Type], KeyboardManager>,
	): void {
		this.#events.on(type, handler);
	}
	/**
	 * 注册一次性事件监听器
	 * @param type - 要监听的事件类型
	 * @param handler - 事件处理函数
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
	once<Type extends keyof KeyboardEventsInit>(
		type: Type,
		handler: EventHandler<Type, KeyboardEventsInit[Type], KeyboardManager>,
	): void {
		this.#events.once(type, handler);
	}
	/**
	 * 移除事件监听器
	 * @param type - 要移除的事件类型
	 * @param handler - 要移除的事件处理函数
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
	off<Type extends keyof KeyboardEventsInit>(
		type: Type,
		handler: EventHandler<Type, KeyboardEventsInit[Type], KeyboardManager>,
	): void {
		this.#events.off(type, handler);
	}
}

export const keyboard = new KeyboardManager();
