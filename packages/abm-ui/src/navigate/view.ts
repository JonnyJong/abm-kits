import {
	$apply,
	$div,
	$ready,
	AnimationFrameController,
	EventBase,
	Events,
} from 'abm-utils';
import { INavigate, Navigable, NavigateEventsInit, Rect } from './types';
import { isAvailable, searchClosest } from './utils';

const SCROLL_OPTIONS: ScrollIntoViewOptions = {
	block: 'center',
	inline: 'center',
	behavior: 'smooth',
};

const CLASS_VISIBLE = 'ui-nav-visible';

export interface NavigateUIInit {
	navigate: INavigate;
	events: Events<NavigateEventsInit>;
	getCurrentLayer(): {
		root: Navigable;
		current: Navigable | null;
		lock: Navigable | null;
	};
	clearCurrent(): void;
}

export class NavigateUI {
	#navigate: INavigate;
	#events: NavigateUIInit['events'];
	#getCurrentLayer: NavigateUIInit['getCurrentLayer'];
	#clearCurrent: NavigateUIInit['clearCurrent'];
	#indicator = $div({ class: 'ui-nav' });
	#x = innerWidth / 2;
	#y = innerHeight / 2;
	#frameController = new AnimationFrameController(() => {
		let { root, current, lock } = this.#getCurrentLayer();
		if (!isAvailable(current, root) || current?.nonNavigable) {
			current = searchClosest(root, {
				left: this.#x,
				top: this.#y,
				height: 0,
				width: 0,
			});
			if (current) this.#navigate.current = current;
		}
		current = lock ?? current;

		if (!current) {
			this.#clearCurrent();
			this.hide();
			this.#events.emit(new EventBase('nav', { target: this.#navigate }));
			return;
		}

		const { top, left, width, height } = current.getBoundingClientRect();
		this.#x = left + width / 2;
		this.#y = top + height / 2;
		$apply(this.#indicator, {
			style: {
				top,
				left,
				width,
				height,
				$borderRadius: getComputedStyle(current).borderRadius,
			},
		});
		this.#indicator.classList.add(CLASS_VISIBLE);
	});
	constructor({
		navigate,
		events,
		getCurrentLayer,
		clearCurrent,
	}: NavigateUIInit) {
		this.#navigate = navigate;
		this.#events = events;
		this.#getCurrentLayer = getCurrentLayer;
		this.#clearCurrent = clearCurrent;
		$ready(() => document.body.append(this.#indicator));
	}
	focus(target: Navigable) {
		target.scrollIntoView(SCROLL_OPTIONS);
		this.#frameController.start();
	}
	hide(x?: number, y?: number) {
		this.#frameController.stop();
		this.#indicator.classList.remove(CLASS_VISIBLE);
		this.#indicator.style.width = '';
		this.#indicator.style.height = '';
		if (x === undefined || y === undefined) return;
		this.#x = x;
		this.#y = y;
		this.#indicator.style.left = `${x}px`;
		this.#indicator.style.top = `${y}px`;
	}
	getRect(): Rect {
		return {
			left: this.#x,
			top: this.#y,
			width: 0,
			height: 0,
		};
	}
}
