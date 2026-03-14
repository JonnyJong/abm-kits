import { callSync, Debounce } from 'abm-utils';
import { $div } from '../infra/dom';
import { $style } from '../infra/style';
import { track } from '../infra/viewport-tacker';
import type { Navigable } from './types';

const CLASS_BASE = 'ui-nav';
const CLASS_VISIBLE = `${CLASS_BASE}-visible`;

const indicator = $div({ class: CLASS_BASE });
const debounceMove = new Debounce((x: number, y: number) =>
	$style(indicator, { top: y, left: x }),
);
let prev: WeakRef<Navigable> | undefined;

/** 导航视图 */
export const view = {
	/** 初始化导航视图 */
	init(): void {
		document.body.append(indicator);
		this.move(innerWidth / 2, innerHeight / 2);
	},
	/** 直接移动 */
	move(x: number, y: number): void {
		debounceMove.exe(x, y);
	},
	/** 更新外观 */
	update(current: Navigable, timeDiff: number): void {
		if (prev?.deref() !== current) {
			prev = new WeakRef(current);
			const activated = document.activeElement;
			if (
				activated &&
				activated !== current &&
				'blur' in activated &&
				typeof activated.blur === 'function'
			) {
				callSync(activated.blur, activated);
			}
			current.focus({ preventScroll: true });
		}
		debounceMove.clean();
		let { top, left, height, width } = current.getBoundingClientRect();
		const maxRadius = Math.min(top, left, height, width) / 2;
		const radius = (value: string): number =>
			Math.min(Number(value.slice(0, -2)), maxRadius) + 1;
		const {
			borderTopLeftRadius,
			borderTopRightRadius,
			borderBottomLeftRadius,
			borderBottomRightRadius,
		} = getComputedStyle(current);
		top--;
		left--;
		height += 2;
		width += 2;

		$style(indicator, {
			top,
			left,
			height,
			width,
			borderTopLeftRadius: radius(borderTopLeftRadius),
			borderTopRightRadius: radius(borderTopRightRadius),
			borderBottomLeftRadius: radius(borderBottomLeftRadius),
			borderBottomRightRadius: radius(borderBottomRightRadius),
		});
		track(timeDiff, current);
	},
	/** 显示 */
	show(): void {
		indicator.classList.add(CLASS_VISIBLE);
	},
	/** 隐藏 */
	hide(): void {
		if (!indicator.classList.contains(CLASS_VISIBLE)) return;
		indicator.classList.remove(CLASS_VISIBLE);
		$style(indicator, { width: 0, height: 0 });
		prev = undefined;
	},
} as const;
