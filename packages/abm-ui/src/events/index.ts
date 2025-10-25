/** biome-ignore-all lint/performance/noBarrelFile: Required as the primary library entry point for exporting public API */

import { UIEventActiveManager } from './active';
import { UIEventHoverManager } from './hover';
import { UIEventSlideManager } from './slide';

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

export type { UIEventActiveHandler } from './active';
export { UIEventActive } from './active';
export type { UIEventHoverHandler } from './hover';
export { UIEventHover } from './hover';
export type {
	Slidable,
	SlideBorder,
	UIEventSlideHandler,
	UIEventSlideState,
} from './slide';
export { UIEventSlide } from './slide';
