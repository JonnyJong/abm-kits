import { EventBase, EventHandler, Events, callTask } from 'abm-utils';
import { initInput } from './input';
import {
	INavigate,
	NavDirection,
	Navigable,
	NavigateCallbackOptions,
	NavigateEvents,
	NavigateEventsInit,
	StackItem,
} from './types';
import {
	isAvailable,
	isContains,
	searchByOrder,
	searchInwards,
	searchOutwards,
} from './utils';
import { NavigateUI } from './view';

export {
	NavDirection,
	NavigateCallbackOptions,
	Navigable,
	NavigateEvents,
	INavigate,
} from './types';

class Navigate implements INavigate {
	//#region Nav Stack
	#stack: StackItem[] = [[document.body, null, null]];
	get #current() {
		return this.#stack.at(-1)![1]?.deref() ?? null;
	}
	set #current(value: Navigable | null) {
		const topLayer = this.#stack.at(-1)!;
		if (value === null) topLayer[1] = value;
		else topLayer[1] = new WeakRef(value);
		topLayer[2] = null;
		if (value) this.#ui.focus(value);
	}
	#getCurrentLayer = () => {
		const [root, current, lock] = this.#stack.at(-1)!;
		return {
			root,
			current: current?.deref() ?? null,
			lock: lock?.deref() ?? null,
		};
	};
	#clearCurrent = (): void => {
		const layer = this.#stack.at(-1)!;
		layer[1] = null;
		layer[2] = null;
	};
	get current(): HTMLElement | null {
		return this.#current;
	}
	set current(value: HTMLElement) {
		if (!(value instanceof HTMLElement)) return;
		if (!isAvailable(value, this.#stack.at(-1)![0])) return;
		this.#current = value;
	}
	lock(value: HTMLElement | null): void {
		if (!(value instanceof HTMLElement) && value !== null) return;
		this.#stack.at(-1)![2] = value ? new WeakRef(value) : value;
	}
	get locking(): boolean {
		return !!this.#stack.at(-1)?.[2]?.deref();
	}
	addLayer(root: Navigable, current?: Navigable): void {
		if (!(root instanceof HTMLElement || (root as any) instanceof ShadowRoot))
			return;
		if (!isAvailable(root)) return;
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
		this.#events.emit(new EventBase('layer', { target: this }));
	}
	rmLayer(root: Navigable): boolean {
		if (!(root instanceof HTMLElement || (root as any) instanceof ShadowRoot))
			return false;
		const index = this.#stack.findIndex(([r]) => r === root);
		if (index === -1) return false;
		this.#stack.splice(index, 1);
		if (this.#current) this.#ui.focus(this.#current);
		this.#events.emit(new EventBase('layer', { target: this }));
		return true;
	}
	//#region Nav
	nav(direction: NavDirection) {
		let { root, current, lock } = this.#getCurrentLayer();
		if (lock) {
			this.#callback({ direction });
			return;
		}
		if (!isAvailable(current, root)) current = null;

		let next: Navigable | null = null;
		if (direction === 'prev' || direction === 'next') {
			next = searchByOrder(root, direction, current);
		} else {
			next = searchInwards(
				current?.navParent ?? (current?.parentNode as Navigable) ?? root,
				direction,
				current ?? this.#ui.getRect(),
			);
			if (!next && current) {
				next = searchOutwards(
					root,
					direction,
					current.getBoundingClientRect(),
					current,
				);
			}
		}
		if (!next) return;

		this.#current = next;
		this.#events.emit(new EventBase('nav', { target: this }));
	}
	//#region Events
	#callback = (options: NavigateCallbackOptions, target = this.#current) => {
		if (!target) return;
		callTask<[NavigateCallbackOptions], Navigable>(
			target.navCallback!,
			target,
			options,
		);
	};
	#events = new Events<NavigateEventsInit>(['nav', 'active', 'cancel', 'layer']);
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
	//#region Other
	#ui = new NavigateUI({
		navigate: this,
		events: this.#events,
		getCurrentLayer: this.#getCurrentLayer,
		clearCurrent: this.#clearCurrent,
	});
	constructor() {
		initInput({
			navigate: this,
			events: this.#events,
			ui: this.#ui,
			getCurrentLayer: this.#getCurrentLayer,
			clearCurrent: this.#clearCurrent,
			callback: this.#callback,
		});
	}
	blockKeyboard = false;
	blockGameController = false;
}

export const navigate = new Navigate();
