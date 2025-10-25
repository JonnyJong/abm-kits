import { callTask, EventBase, type Vec2 } from 'abm-utils';
import { configs } from '../configs';
import { type NavigateEvents, navigate } from '../navigate';
import type { IUIEventBase, IUIEventBaseManage, IUIEventHandler } from './base';

export class UIEventActive
	extends EventBase<'active', HTMLElement>
	implements IUIEventBase<'active'>
{
	#active: boolean;
	#cancel: boolean;
	#identifier: number;
	#position?: readonly [number, number];
	constructor(
		target: HTMLElement,
		active: boolean,
		cancel: boolean,
		identifier: number,
		position?: Vec2,
	) {
		super('active', { target });
		this.#active = active;
		this.#cancel = cancel;
		this.#identifier = identifier;
		if (!position) return;
		this.#position = Object.freeze(position.slice(0, 2) as Vec2);
	}
	get active() {
		return this.#active;
	}
	get cancel() {
		return this.#cancel;
	}
	/**
	 * @description
	 * - `-2`: Nav
	 * - `-1`: Mouse
	 * - `>= 0`: Touch & Pen
	 */
	get identifier() {
		return this.#identifier;
	}
	get position() {
		return this.#position;
	}
}

export type UIEventActiveHandler = IUIEventHandler<
	'active',
	HTMLElement,
	UIEventActive
>;

export class UIEventActiveManager implements IUIEventBaseManage<'active'> {
	constructor() {
		navigate.on('nav', this.#navHandler);
		navigate.on('active', this.#activeHandler);
		navigate.on('cancel', this.#cancelHandler);
	}
	#subscriptions: WeakMap<HTMLElement, Set<UIEventActiveHandler>> =
		new WeakMap();
	/**
	 * - `-2`: Nav
	 * - `-1`: Mouse
	 * - `>= 0`: Touch & Pen
	 */
	#activated: Map<HTMLElement, number> = new Map();
	#emit(
		target: HTMLElement,
		active: boolean,
		cancel: boolean,
		identifier: number,
		position?: Vec2,
	) {
		const handlers = this.#subscriptions.get(target);
		if (!handlers) return;
		const event = new UIEventActive(target, active, cancel, identifier, position);
		for (const handler of handlers) {
			callTask(handler, target, event);
		}
	}
	on<Target extends HTMLElement>(
		target: Target,
		handler: UIEventActiveHandler,
	): void {
		let handlers = this.#subscriptions.get(target);
		if (!handlers) {
			handlers = new Set();
			this.#subscriptions.set(target, handlers);
			this.#bind(target);
		}
		handlers.add(handler);
	}
	off<Target extends HTMLElement>(
		target: Target,
		handler: UIEventActiveHandler,
	): void {
		this.#subscriptions.get(target)?.delete(handler);
	}
	add<Target extends HTMLElement>(target: Target): void {
		if (this.#subscriptions.has(target)) return;
		this.#subscriptions.set(target, new Set());
		this.#bind(target);
	}
	rm<Target extends HTMLElement>(target: Target): void {
		this.#subscriptions.delete(target);
		this.#deactivate(target);
		this.#unbind(target);
	}
	#bind<Target extends HTMLElement>(target: Target): void {
		target.addEventListener('pointerdown', this.#pointerDownHandler);
		// target.addEventListener('mousedown', this.#mouseDownHandler);
		target.addEventListener('touchstart', this.#touchStart);
	}
	#unbind<Target extends HTMLElement>(target: Target): void {
		// target.removeEventListener('mousedown', this.#mouseDownHandler);
		target.removeEventListener('pointerdown', this.#pointerDownHandler);
	}
	#activate(target: HTMLElement, identifier: number) {
		this.#activated.set(target, identifier);
		target.toggleAttribute('ui-active', true);
		if (identifier === -2) return;
		if (identifier === -1) {
			// target.addEventListener('mouseup', this.#mouseUpHandler);
			// target.addEventListener('mouseleave', this.#mouseLeaveHandler);
			target.addEventListener('pointerup', this.#pointerUpHandler);
			target.addEventListener('pointerleave', this.#pointerLeaveHandler);
			return;
		}
		target.addEventListener('touchend', this.#touchEnd);
		target.addEventListener('touchmove', this.#touchMove);
	}
	#deactivate(target: HTMLElement) {
		this.#activated.delete(target);
		target.toggleAttribute('ui-active', false);
		target.removeEventListener('pointerup', this.#pointerUpHandler);
		target.removeEventListener('pointerleave', this.#pointerLeaveHandler);
		target.removeEventListener('touchend', this.#touchEnd);
		target.removeEventListener('touchmove', this.#touchMove);
	}
	start(target: HTMLElement): boolean {
		if (!target || this.#activated.has(target)) return false;
		this.#activate(target, -2);
		this.#emit(target, true, false, -2);
		return true;
	}
	end(target: HTMLElement): boolean {
		if (!(target && this.#activated.has(target))) return false;
		this.#deactivate(target);
		this.#emit(target, false, false, -2);
		return true;
	}
	cancel(target: HTMLElement): boolean {
		if (!(target && this.#activated.has(target))) return false;
		this.#deactivate(target);
		return true;
	}
	//#region Mouse
	#pointerDownHandler = (event: PointerEvent) => {
		if (event.pointerType === 'touch') return;
		if (event.button !== 0) return;
		const target = event.currentTarget as HTMLElement;
		if (!target || this.#activated.has(target)) return;
		this.#activate(target, -1);
		this.#emit(target, true, false, -1, [event.x, event.y]);
	};
	#pointerUpHandler = (event: PointerEvent) => {
		if (event.pointerType === 'touch') return;
		if (event.button !== 0) return;
		const target = event.currentTarget as HTMLElement;
		if (!(target && this.#activated.has(target))) return;
		this.#deactivate(target);
		this.#emit(target, false, false, -1, [event.x, event.y]);
	};
	#pointerLeaveHandler = (event: PointerEvent) => {
		if (event.pointerType === 'touch') return;
		const target = event.currentTarget as HTMLElement;
		if (!(target && this.#activated.has(target))) return;
		this.#deactivate(target);
		this.#emit(target, false, true, -1, [event.x, event.y]);
	};
	//#region Touch
	#touchStartTime = 0;
	#touchStartX = 0;
	#touchStartY = 0;
	#touchStart = (event: TouchEvent) => {
		// 若页面正在滚动，则不处理
		if (!event.cancelable) return;

		const target = event.currentTarget as HTMLElement;
		if (target.hasAttribute('disabled')) return;
		if (!target || this.#activated.has(target)) return;

		const { identifier, clientX, clientY } = event.changedTouches[0];

		this.#touchStartTime = Date.now();
		this.#touchStartX = clientX;
		this.#touchStartY = clientY;

		this.#activate(target, identifier);
		this.#emit(target, true, false, identifier, [clientX, clientY]);
	};
	#touchEnd = (event: TouchEvent) => {
		const target = event.currentTarget as HTMLElement;
		const identifier = this.#activated.get(target);
		if (!(target && typeof identifier === 'number')) return;
		const touch = [...event.changedTouches].find(
			(touch) => touch.identifier === identifier,
		);
		if (!touch) return;
		this.#deactivate(target);
		this.#emit(target, false, false, identifier, [touch.clientX, touch.clientY]);
	};
	#touchMove = (event: TouchEvent) => {
		const target = event.currentTarget as HTMLElement;
		const identifier = this.#activated.get(target);
		if (!(target && typeof identifier === 'number')) return;
		const touch = [...event.changedTouches].find(
			(touch) => touch.identifier === identifier,
		);
		if (!touch) return;
		const { left, right, top, bottom } = target.getBoundingClientRect();
		const { clientX, clientY } = touch;
		let isSwipe = false;
		if (this.#touchStartTime !== 0) {
			const duration = Date.now() - this.#touchStartTime;
			const distance = Math.sqrt(
				(clientX - this.#touchStartX) ** 2 + (clientY - this.#touchStartY) ** 2,
			);
			const speed = distance / duration;
			isSwipe =
				duration < configs.touch.holdDurationThreshold &&
				speed >= configs.touch.swipeThreshold;
			this.#touchStartTime = 0;
		}
		if (
			!isSwipe &&
			clientX >= left &&
			clientX <= right &&
			clientY >= top &&
			clientY <= bottom
		) {
			event.preventDefault();
			return;
		}
		this.#deactivate(target);
		this.#emit(target, false, true, identifier, [clientX, clientY]);
	};
	//#region Nav
	#navHandler = () => {
		const target = navigate.current;
		for (const item of [...this.#activated.keys()]) {
			if (target === item) continue;
			this.#deactivate(item);
			this.#emit(item, false, true, -2);
		}
	};
	#activeHandler = (event: NavigateEvents['active']) => {
		const target = navigate.current;
		if (!(target && this.#subscriptions.has(target))) return;
		const activating = this.#activated.has(target);
		if (event.value === activating) return;

		if (event.value) this.#activate(target, -2);
		else this.#deactivate(target);
		this.#emit(target, event.value, false, -2);
	};
	#cancelHandler = (_event: NavigateEvents['cancel']) => {
		const target = navigate.current;
		if (!(target && this.#activated.has(target))) return;
		this.#deactivate(target);
		this.#emit(target, false, true, -2);
	};
}
