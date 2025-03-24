import { callTask } from 'abm-utils';
import { navigate } from '../../navigate';
import { EventBase } from '../api/base';
import { IUIEventBase, IUIEventBaseManage, IUIEventHandler } from './base';

export class UIEventHover
	extends EventBase<'hover', HTMLElement>
	implements IUIEventBase<'hover'>
{
	#hover: boolean;
	constructor(target: HTMLElement, hover: boolean) {
		super('hover', { target });
		this.#hover = hover;
	}
	get hover() {
		return this.#hover;
	}
}

export type UIEventHoverHandler = IUIEventHandler<
	'hover',
	HTMLElement,
	UIEventHover
>;

export class UIEventHoverManager implements IUIEventBaseManage<'hover'> {
	constructor() {
		navigate.on('nav', this.#navHandler);
	}
	#subscriptions: WeakMap<HTMLElement, Set<UIEventHoverHandler>> = new WeakMap();
	#activated: Set<HTMLElement> = new Set();
	#emit(target: HTMLElement, hover: boolean) {
		const handlers = this.#subscriptions.get(target);
		if (!handlers) return;
		const event = new UIEventHover(target, hover);
		for (const handler of handlers) {
			callTask(handler, target, event);
		}
	}
	on<Target extends HTMLElement>(
		target: Target,
		handler: UIEventHoverHandler,
	): void {
		let handlers = this.#subscriptions.get(target);
		if (!handlers) {
			handlers = new Set();
			this.#subscriptions.set(target, handlers);
			// Bind events
			target.addEventListener('pointermove', this.#pointerMoveHandler);
		}
		handlers.add(handler);
	}
	off<Target extends HTMLElement>(
		target: Target,
		handler: UIEventHoverHandler,
	): void {
		this.#subscriptions.get(target)?.delete(handler);
	}
	add<Target extends HTMLElement>(target: Target): void {
		if (this.#subscriptions.has(target)) return;
		this.#subscriptions.set(target, new Set());
		// Bind events
		target.addEventListener('pointermove', this.#pointerMoveHandler);
	}
	rm<Target extends HTMLElement>(target: Target): void {
		this.#subscriptions.delete(target);
		this.#deactivate(target);
		// Unbind events
		target.removeEventListener('pointermove', this.#pointerMoveHandler);
		target.removeEventListener('pointerout', this.#pointerOutHandler);
	}
	#activate(target: HTMLElement) {
		this.#activated.add(target);
		target.toggleAttribute('ui-hover', true);
	}
	#deactivate(target: HTMLElement) {
		this.#activated.delete(target);
		target.toggleAttribute('ui-hover', false);
	}
	//#region Pointer
	#pointerMoveHandler = (event: PointerEvent) => {
		if (event.pointerType === 'touch') return;
		if (event.buttons !== 0) return;
		const target = event.currentTarget as HTMLElement;
		if (!target || this.#activated.has(target)) return;
		this.#activate(target);
		this.#emit(target, true);
		target.addEventListener('pointerout', this.#pointerOutHandler);
	};
	#pointerOutHandler = (event: PointerEvent) => {
		if (event.pointerType === 'touch') return;
		const target = event.currentTarget as HTMLElement;
		if (!(target && this.#activated.has(target))) return;
		this.#deactivate(target);
		this.#emit(target, false);
		target.removeEventListener('pointerout', this.#pointerOutHandler);
	};
	//#region Nav
	#navHandler = () => {
		const current = navigate.current;
		for (const target of [...this.#activated]) {
			if (target === current) return;
			this.#deactivate(target);
			this.#emit(target, false);
			target.removeEventListener('pointerout', this.#pointerOutHandler);
		}
		if (!current || this.#activated.has(current)) return;
		this.#activate(current);
		this.#emit(current, true);
	};
}
