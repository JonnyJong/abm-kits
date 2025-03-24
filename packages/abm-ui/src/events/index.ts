import { UIEventActiveManager } from './ui/active';
import { UIEventHoverManager } from './ui/hover';
import { UIEventSlideManager } from './ui/slide';

//#region Provided Event API
class ProvidedEvents {
	#hover = new UIEventHoverManager();
	#active = new UIEventActiveManager();
	#slide = new UIEventSlideManager();
	get hover() {
		return this.#hover;
	}
	get active() {
		return this.#active;
	}
	get slide() {
		return this.#slide;
	}
}

export const events = new ProvidedEvents();

export type { UIEventHoverHandler } from './ui/hover';
export { UIEventHover } from './ui/hover';
export type { UIEventActiveHandler } from './ui/active';
export { UIEventActive } from './ui/active';
export type { UIEventSlideHandler, UIEventSlideState } from './ui/slide';
export { UIEventSlide } from './ui/slide';
