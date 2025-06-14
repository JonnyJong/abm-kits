import {
	$$,
	$div,
	$new,
	$path,
	$ready,
	DOMContents,
	IntervalController,
	asArray,
	clamp,
} from 'abm-utils';
import { configs } from '../configs';
import { navigate } from '../navigate';

type Position = { x: number; y: number };

const PADDING = 24;

function calcPositionByTarget(
	width: number,
	height: number,
	target: HTMLElement,
): Position {
	const { top, bottom, left, width: size } = target.getBoundingClientRect();
	const {
		top: safeTop,
		left: safeLeft,
		right: safeRight,
	} = configs.screen.safeRect;

	let y = top - height - PADDING;
	if (y < safeTop) y = bottom + PADDING;
	const x = clamp(safeLeft, left + size / 2 - width / 2, safeRight);

	return { x, y };
}
function calcPositionByPoint(
	width: number,
	height: number,
	{ x, y }: Position,
): Position {
	const { left, right, top, bottom } = configs.screen.safeRect;

	if (x + PADDING + width > right) {
		x -= width + PADDING;
	} else {
		x += PADDING;
	}
	x = Math.max(left, x);

	if (y + PADDING + height > bottom) {
		y -= height + PADDING;
	} else {
		y += PADDING;
	}
	y = Math.max(top, y);

	return { x, y };
}

class UITooltips {
	#map = new WeakMap<HTMLElement, DOMContents>();
	constructor() {
		$ready(() => this.#init());

		this.#resizeObserver.observe(this.#contentElement);

		addEventListener('pointerdown', this.#pointerDownHandler);
		addEventListener('pointermove', this.#pointerMoveHandler);
		addEventListener('touchstart', this.#touchStartHandler);
		addEventListener('touchend', this.#touchEndHandler);
		navigate.on('nav', this.#navHandler);
	}
	#init() {
		document.body.append(this.#tooltipsElement);
		for (const target of $$('[tooltips]')) {
			const tooltips = target.getAttribute('tooltips');
			if (!tooltips) continue;
			const content = $new('w-lang');
			content.key = tooltips;
			this.#map.set(target, content);
		}
		this.#updateView();
	}
	//#region View
	#currentTarget: WeakRef<HTMLElement> | null = null;
	#path: HTMLElement[] = [];
	#contentElement = $div({
		class: ['ui-tooltips-content'],
		attr: { 'ui-layout': 'flow-column' },
	});
	#tooltipsElement = $div({
		class: ['ui-tooltips'],
		content: this.#contentElement,
	});
	#contentWidth = 0;
	#contentHeight = 0;
	#resizeObserver = new ResizeObserver((entries) => {
		this.#contentWidth = entries[0].borderBoxSize[0].inlineSize;
		this.#contentHeight = entries[0].borderBoxSize[0].blockSize;
	});
	#position?: Position;
	#updatePosition() {
		let pos: Position | null = null;

		const target = this.#currentTarget?.deref();
		if (this.#position) {
			pos = calcPositionByPoint(
				this.#contentWidth,
				this.#contentHeight,
				this.#position,
			);
		} else if (target) {
			pos = calcPositionByTarget(this.#contentWidth, this.#contentHeight, target);
		}

		if (!pos) return;

		this.#tooltipsElement.style.left = `${pos.x}px`;
		this.#tooltipsElement.style.top = `${pos.y}px`;
	}
	#updateView() {
		// Path
		let path = this.#path;
		const lockItem = this.#lock?.deref();
		if (lockItem) path = [lockItem];
		// Target
		let target: HTMLElement | null = null;
		let content: DOMContents | undefined = undefined;
		for (const element of path) {
			content = this.#map.get(element);
			if (content === undefined) continue;
			target = element;
			break;
		}
		// Check
		if (!target || content === undefined) {
			this.#currentTarget = null;
			this.#updateVisibility(false);
			return;
		}
		// Display: cached
		if (this.#currentTarget?.deref() === target) {
			this.#updateVisibility(true);
			this.#updatePosition();
			return;
		}
		// Display
		this.#currentTarget = new WeakRef(target);
		this.#updateVisibility(true);
		this.#contentElement.replaceChildren(...asArray(content));
		this.#updatePosition();
	}
	#updateVisibility(visibility: boolean) {
		this.#tooltipsElement.classList.toggle('ui-tooltips-show', visibility);
		if (!visibility) this.#positionUpdater.stop();
	}
	#positionUpdater = new IntervalController(this.#updatePosition, 300, this);
	//#region Tooltips
	/** 获取元素对应的工具提示内容 */
	get(target: HTMLElement): DOMContents | undefined {
		return this.#map.get(target);
	}
	/**
	 * 为元素设置工具提示
	 * @param target - 目标元素
	 * @param content - 工具提示内容，`undefined` 时移除工具提示
	 */
	set(target: HTMLElement, content?: DOMContents): void {
		if (content === undefined) {
			this.#map.delete(target);
			if (this.#lock?.deref() === target) this.#lock = null;
			this.#updateView();
			return;
		}
		this.#map.set(target, content);

		if (this.#currentTarget?.deref() !== target) {
			this.#updateView();
			return;
		}

		this.#contentElement.replaceChildren(...asArray(content));
		this.#updatePosition();
	}
	//#region Lock
	#lock: WeakRef<HTMLElement> | null = null;
	/**
	 * 锁定工具提示，锁定后工具提示将始终显示
	 * @param target - 目标元素
	 */
	lock(target: HTMLElement) {
		if (!this.#map.has(target)) return;
		if (this.#lock?.deref() === target) return;
		this.#lock = new WeakRef(target);
		this.#updateView();
	}
	/**
	 * 解锁工具提示
	 */
	unlock() {
		this.#lock = null;
		this.#updateView();
	}
	//#region Pointer
	#penDownTimestamp = 0;
	#pointerDownHandler = (event: PointerEvent) => {
		if (event.pointerType !== 'pen') return;
		this.#penDownTimestamp = event.timeStamp;
	};
	#pointerMoveHandler = (event: PointerEvent) => {
		if (event.pointerType === 'touch') return;
		const path = event.composedPath() as HTMLElement[];
		this.#position = { x: event.x, y: event.y };

		if (path[0] === this.#path[0]) {
			if (this.#currentTarget?.deref()) this.#updatePosition();
			return;
		}

		this.#path = path;
		this.#updateView();
		this.#positionUpdater.stop();
	};
	//#region Touch
	#touchStartHandler = (event: TouchEvent) => {
		if (event.timeStamp === this.#penDownTimestamp) return;
		const path = event.composedPath() as HTMLElement[];
		this.#position = undefined;

		if (path[0] === this.#path[0]) return;
		this.#path = path;
		this.#updateView();

		if (!this.#currentTarget?.deref()) return;
		this.#positionUpdater.start();
	};
	#touchEndHandler = (event: TouchEvent) => {
		if (event.touches.length !== 0) return;
		this.#path = [];
		this.#updateVisibility(false);

		this.#positionUpdater.stop();
	};
	//#region Nav
	#navHandler = () => {
		this.#position = undefined;
		const target = navigate.current;
		if (!target) {
			this.#path = [];
			this.#positionUpdater.stop();
			return;
		}
		this.#path = $path(target);
		this.#updateView();

		if (!this.#currentTarget?.deref()) return;
		this.#positionUpdater.start();
	};
}

/** 工具提示 */
export const tooltips = new UITooltips();
