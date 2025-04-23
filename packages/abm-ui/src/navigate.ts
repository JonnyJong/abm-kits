import { $$, $ready, RepeatingTriggerController, callTask } from 'abm-utils';
import {
	$apply,
	$div,
	AnimationFrameController,
	Direction4,
	Vec2,
	Vector2,
} from 'abm-utils';
import { EventBase, EventBaseInit } from './events/api/base';
import { EventValue, EventValueInit } from './events/api/value';
import {
	EventHandler,
	Events,
	EventsList,
	IEventSource,
} from './events/events';
import { GameController } from './game-controller';
import { KeyboardEvents, keyboard } from './keyboard';

export type NavDirection = Direction4 | 'next' | 'prev';
export interface NavigateCallbackOptions {
	direction?: NavDirection;
	active?: boolean;
	cancel?: boolean;
}

export interface Navigable extends HTMLElement {
	nonNavigable?: boolean;
	navCallback?: (options: NavigateCallbackOptions) => any;
	navParent?: Navigable;
	navChildren?: Navigable[];
}

type NavFilter = (from: Vec2, to: DOMRect) => boolean;
type Rect = {
	top: number;
	left: number;
	height: number;
	width: number;
};
type StackItem = [
	root: Navigable,
	current: WeakRef<Navigable> | null,
	lock: WeakRef<Navigable> | null,
];

const KEY_ALIAS_DIRECTION_MAP = {
	'ui.up': 'up',
	'ui.right': 'right',
	'ui.down': 'down',
	'ui.left': 'left',
};
const GAME_CONTROLLER_SWITCH_DEAD_ZONE = 0.3;
const SCROLL_OPTIONS: ScrollIntoViewOptions = {
	block: 'center',
	inline: 'center',
	behavior: 'smooth',
};

const NAV_FILTERS: {
	[key in Direction4]: NavFilter;
} = {
	up: (from, to) => to.bottom < from[1],
	right: (from, to) => from[0] < to.left,
	down: (from, to) => from[1] < to.top,
	left: (from, to) => to.right < from[0],
};

function getDistance(rectA: Rect, rectB: Rect): number {
	const { width: widthA, height: heightA, top: topA, left: leftA } = rectA;
	const { width: widthB, height: heightB, top: topB, left: leftB } = rectB;
	const xA = leftA + widthA / 2;
	const yA = topA + heightA / 2;
	const xB = leftB + widthB / 2;
	const yB = topB + heightB / 2;

	const vec = new Vector2(Math.abs(xB - xA), Math.abs(yB - yA));
	const length = vec.length;

	if (vec.x === 0) {
		return vec.y - (heightA + heightB) / 2;
	}
	if (vec.y === 0) {
		return vec.x - (widthA + widthB) / 2;
	}

	const sin = vec.y / length;
	const cos = vec.x / length;
	return (
		length -
		Math.min(heightA / 2 / sin, widthA / 2 / cos) -
		Math.min(heightB / 2 / sin, widthB / 2 / cos)
	);
}

function isInside([x, y]: Vec2, { top, bottom, left, right }: DOMRect) {
	return x >= left && x <= right && y >= top && y <= bottom;
}
function isContains(parent: Navigable, child: Navigable): boolean {
	if (parent.contains(child)) return true;
	const children = parent.navChildren;
	if (children) {
		for (const c of children) {
			if (c.contains(child)) return true;
		}
		return false;
	}
	return $$<Navigable>('[ui-nav-group]', parent).some((p) =>
		isContains(p, child),
	);
}

function NearestFinder(begin: Rect, direction: Direction4) {
	const position: Vec2 = [
		begin.left + begin.width / 2,
		begin.top + begin.height / 2,
	];
	let distance = Infinity;
	return function next(nextRect: DOMRect): boolean {
		if (
			nextRect.x === 0 &&
			nextRect.y === 0 &&
			nextRect.width === 0 &&
			nextRect.height === 0
		)
			return false;
		const nextDistance = getDistance(begin, nextRect);
		if (nextDistance >= distance) return false;
		if (
			!(NAV_FILTERS[direction](position, nextRect) || isInside(position, nextRect))
		)
			return false;
		distance = nextDistance;
		return true;
	};
}

function NavItemFilter(from?: any) {
	const SAME = (item: Element) => item === from;
	const NAVIGABLE = (item: Element) =>
		!(item as Navigable).nonNavigable &&
		(item.clientHeight !== 0 || item.clientWidth !== 0);
	const IS_NAV_ITEM = (item: Element) => item.hasAttribute('ui-nav');
	// Group Check
	const IS_GROUP_DIRECT = (item: Element) =>
		(item as Navigable).navChildren?.some(NAVIGABLE);
	const IS_GROUP_A = (item: Element) => $$('[ui-nav]', item).some(NAVIGABLE);
	const IS_GROUP_B = (item: Element) =>
		$$<Navigable>('[ui-nav-group]', item).some((group) =>
			group.navChildren?.some(NAVIGABLE),
		);

	return function filter(item: Element) {
		if (SAME(item)) return false;
		if (!NAVIGABLE(item)) return false;
		if (IS_NAV_ITEM(item)) return true;

		if (IS_GROUP_DIRECT(item)) return true;
		if (IS_GROUP_A(item)) return true;
		if (IS_GROUP_B(item)) return true;

		return false;
	};
}

function searchInwards(
	root: Navigable,
	direction: Direction4,
	begin: Rect | HTMLElement,
): Navigable | null {
	const children = [...(root.navChildren ?? root.children)].filter(
		NavItemFilter(begin),
	);
	if (children.length === 0) return null;

	const rect =
		begin instanceof HTMLElement ? begin.getBoundingClientRect() : begin;
	const finder = NearestFinder(rect, direction);
	let item: Navigable | null = null;
	for (const child of children) {
		if (child === begin) continue;
		if (finder(child.getBoundingClientRect())) item = child as Navigable;
	}

	if (!item) return null;
	if (item.hasAttribute('ui-nav')) return item;
	return searchInwards(item, direction, rect);
}

function searchOutwards(
	border: HTMLElement,
	direction: Direction4,
	rect: Rect,
	from: Navigable,
) {
	const root = from.navParent ?? (from.parentNode as Navigable);
	if (!(root && checkAvailability(root, border))) return null;

	const children = [...(root.navChildren ?? root.children)].filter(
		NavItemFilter(from),
	);
	if (children.length === 0)
		return searchOutwards(border, direction, rect, root);

	const finder = NearestFinder(rect, direction);
	let item: Navigable | null = null;
	for (const child of children) {
		if (finder(child.getBoundingClientRect())) item = child as Navigable;
	}

	if (!item) return searchOutwards(border, direction, rect, root);
	if (item.hasAttribute('ui-nav')) return item;
	return searchInwards(item, direction, rect);
}
function searchByOrder(
	root: Navigable,
	direction: 'next' | 'prev',
	from?: Navigable | null,
): Navigable | null {
	const children = [...(root.navChildren ?? root.children)].filter(
		NavItemFilter(),
	);
	if (children.length === 0) return null;

	if (direction === 'next') children.reverse();
	while (from && children.length !== 0) {
		const last = children.pop() as Navigable;
		if (!isContains(last, from)) continue;
		if (last === from) break;
		children.push(last);
		break;
	}
	if (children.length === 0) return null;
	children.reverse();

	for (const target of children) {
		if (target.hasAttribute('ui-nav')) return target as Navigable;
		const result = searchByOrder(
			target as Navigable,
			direction,
			from && isContains(target as Navigable, from) ? from : null,
		);
		if (result) return result;
	}
	return null;
}

function checkAvailability(
	target?: Navigable | null,
	preferParent: HTMLElement = document.body,
): boolean {
	while (target) {
		if (isContains(preferParent, target)) return true;
		// if (preferParent.contains(target)) return true;
		target = ((target as unknown as ShadowRoot)?.host ??
			(target?.getRootNode() as ShadowRoot)?.host) as Navigable;
	}
	return false;
}

//#region #Navigate
interface NavigateEventsInit {
	nav: EventBaseInit<Navigate>;
	active: EventValueInit<Navigate, boolean>;
	cancel: EventValueInit<Navigate, boolean>;
}

export type NavigateEvents = EventsList<NavigateEventsInit>;

class Navigate implements IEventSource<NavigateEventsInit> {
	#events = new Events<NavigateEventsInit>(['nav', 'active', 'cancel']);
	#indicator = $div({ class: 'ui-nav' });
	#controller = GameController.getInstance(0);
	#position: Vec2 = [window.innerWidth / 2, window.innerHeight / 2];
	constructor() {
		$ready(() => document.body.append(this.#indicator));
		keyboard.on('aliasTrigger', this.#aliasTriggerHandler);
		keyboard.on('shortcutTrigger', this.#shortcutHandler);
		this.#controller.on('ls', this.#lsHandler);
		this.#controller.on('arrow', this.#arrowHandler);
		window.addEventListener('wheel', this.#stopNavHandler);
		window.addEventListener('pointermove', this.#stopNavHandler);
		keyboard.on('aliasDown', this.#aliasDownHandler);
		keyboard.on('aliasUp', this.#aliasUpHandler);
		this.#controller.on('a', this.#aHandler);
		this.#controller.on('b', this.#bHandler);
	}
	#callback(options: NavigateCallbackOptions, target = this.#current) {
		if (!target) return;
		if (typeof target.navCallback !== 'function') return;
		callTask<[NavigateCallbackOptions], Navigable>(
			target.navCallback,
			target,
			options,
		);
	}
	//#region Nav
	/**
	 * 导航到下一元素
	 * Navigate to the next element
	 */
	nav(direction: NavDirection) {
		const root = this.#root;
		let current = this.#current;
		if (this.locking) {
			this.#callback({ direction });
			return;
		}
		if (!checkAvailability(current, root)) current = null;

		let next: Navigable | null = null;
		if (['next', 'prev'].includes(direction)) {
			next = searchByOrder(root, direction as 'next' | 'prev', current);
		} else {
			next = searchInwards(
				current?.navParent ?? (current?.parentNode as HTMLElement) ?? root,
				direction as Direction4,
				current ?? {
					left: this.#position[0],
					top: this.#position[1],
					width: 0,
					height: 0,
				},
			);
			if (!next && current)
				next = searchOutwards(
					root,
					direction as Direction4,
					current.getBoundingClientRect(),
					current,
				);
		}
		if (!next) return;

		this.#current = next;
		current = next;
		current.scrollIntoView(SCROLL_OPTIONS);
		this.#frameController.start();
		this.#events.emit(new EventBase('nav', { target: this }));
	}
	//#region View
	#update = () => {
		const root = this.#root;
		let current = this.#current;
		if (!checkAvailability(current, root) || current?.nonNavigable)
			current = null;
		const lock = this.#lock;
		if (lock) current = lock;

		if (!current) {
			this.#current = null;
			this.#frameController.stop();
			this.#indicator.classList.remove('ui-nav-visible');
			this.#events.emit(new EventBase('nav', { target: this }));
			return;
		}

		const { top, left, width, height } = current.getBoundingClientRect();
		this.#position = [left + width / 2, top + height / 2];
		$apply(this.#indicator, {
			style: {
				top,
				left,
				width,
				height,
				'--borderRadius': getComputedStyle(current).borderRadius,
			},
		});
		this.#indicator.classList.add('ui-nav-visible');
	};
	#frameController = new AnimationFrameController(this.#update);
	//#region Event
	blockKeyboard = false;
	#aliasTriggerHandler = (event: KeyboardEvents['aliasTrigger']) => {
		if (this.blockKeyboard) return;
		const direction = (KEY_ALIAS_DIRECTION_MAP as any)[event.key];
		if (!direction) return;
		this.nav(direction);
	};
	#shortcutHandler = (event: KeyboardEvents['shortcutTrigger']) => {
		if (this.blockKeyboard) return;
		if (event.key === 'ui.navPrev') this.nav('prev');
		else if (event.key === 'ui.navNext') this.nav('next');
	};
	#upController = new RepeatingTriggerController(() => this.nav('up'));
	#rightController = new RepeatingTriggerController(() => this.nav('right'));
	#downController = new RepeatingTriggerController(() => this.nav('down'));
	#leftController = new RepeatingTriggerController(() => this.nav('left'));
	#lsHandler = () => {
		const vec = this.#controller.ls;
		let direction = vec.direction;
		if (vec.length < GAME_CONTROLLER_SWITCH_DEAD_ZONE) direction = undefined;
		this.#upController[direction === 'up' ? 'start' : 'stop']();
		this.#rightController[direction === 'right' ? 'start' : 'stop']();
		this.#downController[direction === 'down' ? 'start' : 'stop']();
		this.#leftController[direction === 'left' ? 'start' : 'stop']();
	};
	#arrowHandler = () => {
		this.#upController[this.#controller.up ? 'start' : 'stop']();
		this.#rightController[this.#controller.right ? 'start' : 'stop']();
		this.#downController[this.#controller.down ? 'start' : 'stop']();
		this.#leftController[this.#controller.left ? 'start' : 'stop']();
	};
	#stopNavHandler = (event: MouseEvent) => {
		const current = this.#current;
		if (current && this.locking) this.#callback({ active: false, cancel: true });

		this.#indicator.classList.remove('ui-nav-visible');
		this.#position = [event.x, event.y];
		this.#indicator.style.left = `${event.x}px`;
		this.#indicator.style.top = `${event.y}px`;
		if (current === null) return;
		this.#frameController.stop();
		this.#current = null;
		this.#events.emit(new EventBase('nav', { target: this }));
	};
	#aliasDownHandler = (event: KeyboardEvents['aliasDown']) => {
		const root = this.#root;
		const current = this.#current;
		let type: 'active' | 'cancel' | '' = '';
		if (event.key === 'ui.confirm') type = 'active';
		if (event.key === 'ui.cancel') type = 'cancel';
		if (!type) return;
		this.#callback({ [type]: true }, root);
		if (!current) return;
		this.#callback({ [type]: true });
		if (this.locking) return;
		this.#events.emit(new EventValue(type, { target: this, value: true }));
	};
	#aliasUpHandler = (event: KeyboardEvents['aliasUp']) => {
		const root = this.#root;
		const current = this.#current;
		let type: keyof NavigateEvents | '' = '';
		if (event.key === 'ui.confirm') type = 'active';
		if (event.key === 'ui.cancel') type = 'cancel';
		if (!type) return;
		this.#callback({ [type]: false }, root);
		if (!current) return;
		this.#callback({ [type]: false });
		if (this.locking) return;
		this.#events.emit(new EventValue(type, { target: this, value: false }));
	};
	#aHandler = () => {
		const root = this.#root;
		const current = this.#current;
		this.#callback({ active: this.#controller.a }, root);
		if (!current) return;
		this.#callback({ active: this.#controller.a });
		if (this.locking) return;
		this.#events.emit(
			new EventValue('active', { target: this, value: this.#controller.a }),
		);
	};
	#bHandler = () => {
		const root = this.#root;
		const current = this.#current;
		this.#callback({ cancel: this.#controller.b }, root);
		if (!current) return;
		this.#callback({ cancel: this.#controller.b });
		if (this.locking) return;
		this.#events.emit(
			new EventValue('cancel', { target: this, value: this.#controller.b }),
		);
	};
	on<Type extends keyof NavigateEvents>(
		type: Type,
		handler: EventHandler<Type, NavigateEventsInit[Type], any>,
	): void {
		this.#events.on(type, handler);
	}
	once<Type extends keyof NavigateEvents>(
		type: Type,
		handler: EventHandler<Type, NavigateEventsInit[Type], any>,
	): void {
		this.#events.once(type, handler);
	}
	off<Type extends keyof NavigateEvents>(
		type: Type,
		handler: EventHandler<Type, NavigateEventsInit[Type], any>,
	): void {
		this.#events.on(type, handler);
	}
	//#region Nav Stack
	/**
	 * 导航栈 Nav Stack
	 * @description
	 * 导航范围仅限栈顶元素的子元素
	 * The navigation scope is limited to the child elements of the top element of the stack
	 */
	#stack: StackItem[] = [[document.body, null, null]];
	get #current() {
		return this.#stack.at(-1)![1]?.deref() ?? null;
	}
	set #current(value: Navigable | null) {
		const topLayer = this.#stack.at(-1)!;
		if (value === null) topLayer[1] = value;
		else topLayer[1] = new WeakRef(value);
		topLayer[2] = null;
	}
	get #root() {
		return this.#stack.at(-1)![0];
	}
	get current(): HTMLElement | null {
		return this.#current;
	}
	set current(value: HTMLElement) {
		const topLayer = this.#stack.at(-1)!;
		if (!(value instanceof HTMLElement && checkAvailability(value, topLayer[0])))
			return;
		topLayer[1] = new WeakRef(value);
		topLayer[2] = null;
		this.#frameController.start();
	}
	get #lock() {
		const topLayer = this.#stack.at(-1)!;
		if (!topLayer[1]?.deref()) return null;
		return topLayer[2]?.deref() ?? null;
	}
	lock(value: HTMLElement | null) {
		if (!(value instanceof HTMLElement) && value !== null) return;
		this.#stack.at(-1)![2] = value ? new WeakRef(value) : value;
	}
	get locking() {
		return !!this.#lock;
	}
	addLayer(root: Navigable, current?: Navigable) {
		if (
			!(
				(root instanceof HTMLElement || (root as any) instanceof ShadowRoot) &&
				checkAvailability(root)
			)
		)
			return;
		const index = this.#stack.findIndex(([r]) => r === root);
		const currentAvailable =
			current instanceof HTMLElement && isContains(root, current);
		if (index === -1) {
			this.#stack.push([
				root,
				currentAvailable ? new WeakRef(current) : null,
				null,
			]);
		} else {
			const [layer] = this.#stack.splice(index, 1);
			this.#stack.push(layer);
			if (currentAvailable) layer[1] = new WeakRef(current);
		}
		this.#events.emit(new EventBase('nav', { target: this }));
	}
	rmLayer(root: Navigable): boolean {
		if (
			!(
				(root instanceof HTMLElement || (root as any) instanceof ShadowRoot) &&
				checkAvailability(root)
			)
		)
			return false;
		const index = this.#stack.findIndex(([r]) => r === root);
		if (index === -1) return false;
		this.#stack.splice(index, 1);
		if (this.#current) this.#frameController.start();
		this.#events.emit(new EventBase('nav', { target: this }));
		return true;
	}
}

export const navigate = new Navigate();

// TODO: 重构优化 Navigate 模块结构
