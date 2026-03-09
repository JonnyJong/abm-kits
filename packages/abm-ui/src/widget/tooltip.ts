import { asArray, clamp } from 'abm-utils';
import { $$, $div, type DOMContents } from '../infra/dom';
import { $off, $on } from '../infra/event';
import { safeRect } from '../infra/screen';
import { $style } from '../infra/style';
import { LayoutController } from '../layout';

//#region Var
const ATTR = 'tooltip';
const CLASS_BASE = 'ui-tooltip';
const CLASS_VISIBLE = `${CLASS_BASE}-visible`;
const PADDING = 24;

const map = new WeakMap<HTMLElement, DOMContents>();
let container: HTMLDivElement;
let current: HTMLElement | undefined;
let locked = false;

const layoutController = new LayoutController(
	[],
	({ top, left, bottom, right }, { width, height }) => {
		if (!current?.isConnected) return stop();
		const { vStart, hStart, hEnd } = safeRect;
		let y = top - height - PADDING;
		if (y < vStart) y = bottom + PADDING;
		const x = clamp(hStart, (left + right - width) / 2, hEnd - width);
		$style(container, { top: y, left: x });
	},
);

//#region Helper
function start(target: HTMLElement): boolean {
	const content = map.get(target);
	if (!content) return false;
	container.replaceChildren(...asArray(content));
	current = target;
	layoutController.targets = [target, container];
	layoutController.start();
	container.classList.add(CLASS_VISIBLE);
	return true;
}
function stop() {
	current = undefined;
	layoutController.stop();
	layoutController.targets = [];
	container.classList.remove(CLASS_VISIBLE);
	locked = false;
}

//#region Handler
function pointerEnterHandler(event: PointerEvent) {
	if (locked) return;
	const target = event.currentTarget as HTMLElement;
	if (!target) return;
	if (target === current) return;
	if (!start(target)) return;
	$on(target, 'pointerdown', pointerDownHandler);
	$on(target, 'pointerleave', cancelHandler);
	$on(target, 'pointerup', cancelHandler);
}

function pointerDownHandler(event: PointerEvent) {
	if (locked) return;
	if (event.pointerType === 'touch') return;
	cancelHandler(event);
}

function cancelHandler(event: PointerEvent) {
	if (locked) return;
	const target = event.currentTarget as HTMLElement;
	if (!target) return;
	if (target !== current) return;
	$off(target, 'pointerdown', pointerDownHandler);
	$off(target, 'pointerleave', cancelHandler);
	$off(target, 'pointerup', cancelHandler);
	stop();
}

//#region Main
/** 为元素设置工具提示 */
function set(target: HTMLElement, content: DOMContents): void {
	map.set(target, content);
	$on(target, 'pointerenter', pointerEnterHandler);
	if (current !== target) return;
	container.replaceChildren(...asArray(content));
}

/** 移除元素上的工具提示 */
function rm(target: HTMLElement): void {
	map.delete(target);
	$off(target, 'pointerenter', pointerEnterHandler);
	$off(target, 'pointerleave', cancelHandler);
	if (current !== target) return;
	stop();
}

/** 锁定工具提示显示 */
function lock(target: HTMLElement) {
	if (!map.has(target)) return;
	locked = true;
	start(target);
	locked = true;
}

/** 解锁工具提示显示 */
function unlock(target: HTMLElement) {
	if (target !== current) return;
	stop();
}

/** 初始化工具提示 */
export function initTooltip() {
	container = $div({ class: ['surface-glass', 'safe-size', CLASS_BASE] });
	document.body.append(container);
	for (const target of $$(`[${ATTR}]`)) {
		const content = target.getAttribute(ATTR);
		if (!content) continue;
		set(target, content);
	}
}

/** 工具提示 */
export const tooltip = { set, rm, lock, unlock } as const;
