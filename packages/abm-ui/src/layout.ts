import { AnimationFrameController, type ArrayOr, asArray } from 'abm-utils';
import { $rect } from './infra/dom';

/**
 * 布局控制器
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/other/layout)
 */
export class LayoutController {
	#rects: DOMRect[] = [];
	#frameController = new AnimationFrameController(() => this.#update());
	targets: ArrayOr<Element>;
	updateLayout: (...rects: DOMRect[]) => void;
	constructor(
		target: LayoutController['targets'],
		updateLayout: LayoutController['updateLayout'],
	) {
		this.targets = target;
		this.updateLayout = updateLayout;
	}
	/** 运行中 */
	get running() {
		return this.#frameController.isRunning;
	}
	#update() {
		const rects = asArray(this.targets).map($rect);
		if (rects.length === 0) return;
		for (const [index, rect] of rects.entries()) {
			const prev = this.#rects[index];
			if (!prev) break;
			if (rect.x !== prev.x) break;
			if (rect.y !== prev.y) break;
			if (rect.width !== prev.width) break;
			if (rect.height !== prev.height) break;
			if (index + 1 === rects.length) return;
		}
		this.#rects = rects;
		this.updateLayout(...this.#rects);
	}
	/**
	 * 开始
	 * @param skipFirst 跳过第一次布局
	 */
	start(skipFirst?: boolean) {
		if (this.running) return;
		if (skipFirst) this.#rects = asArray(this.targets).map($rect);
		this.#frameController.start();
	}
	/** 停止 */
	stop() {
		this.#rects = [];
		this.#frameController.stop();
	}
	/**
	 * 强制更新
	 * @description
	 * 无视运行状态和是否发生变化
	 */
	forceUpdate() {
		const rects = asArray(this.targets).map($rect);
		if (this.running) this.#rects = rects;
		this.updateLayout(...rects);
	}
}
