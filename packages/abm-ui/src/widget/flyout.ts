import { asArray, clamp, EventEmitter } from 'abm-utils';
import { Button, type ButtonProp } from '../component/button';
import { t } from '../component/i18n';
import { $color, type ThemeColor } from '../infra/color';
import { $content, $div, $new, type DOMContents } from '../infra/dom';
import { safeRect } from '../infra/screen';
import { $style } from '../infra/style';
import { LayoutController } from '../layout';
import { type Navigable, type NavState, navigate } from '../navigate/index';
import { state } from '../state';

const CLASS_SHOW = 'ui-flyout-show';
const PADDING = 8;

/** 浮出面板初始化参数 */
export interface FlyoutInit {
	/** 内容 */
	content?: DOMContents;
	/** 宽度 */
	width?: number | string;
	/** 主题配色 */
	color?: ThemeColor;
	/**
	 * 浮出面板关闭回调
	 * @description
	 * 仅点击外部区域或全局返回时触发
	 */
	onClose?: () => any;
}

/** 确认浮出面板初始化参数 */
export interface ConfirmFlyoutInit extends FlyoutInit {
	/** 操作按钮 */
	button?: Button | ButtonProp;
}

export interface FlyoutEventMap {
	/**
	 * 浮出面板关闭
	 * @description
	 * 仅点击外部区域或全局返回时触发
	 */
	close: [];
}

/**
 * 浮出面板
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/widget/flyout)
 */
export class Flyout
	extends EventEmitter<FlyoutEventMap>
	implements Required<Omit<FlyoutInit, 'color' | 'onClose'>>
{
	#backdrop = $div({ className: 'backdrop' });
	#flyout = $div<Navigable>({ className: 'surface-glass overlay safe-size' });
	#layout: LayoutController;
	/**
	 * @param anchor 锚点元素
	 * @param init 初始化参数
	 */
	constructor(anchor: HTMLElement, init?: FlyoutInit) {
		super();
		this.#layout = new LayoutController([this.#flyout, anchor], this.#update);
		this.#flyout.navCallback = (state) => this.#handleNav(state);
		state.active.on(this.#backdrop, () => this.close().emit('close'));
		this.anchor = anchor;
		if (!init) return;
		if (init.content) this.content = init.content;
		if (init.width !== undefined) this.width = init.width;
		if (init.color) this.setColor(init.color);
		if (init.onClose) this.on('close', init.onClose);
	}
	#handleNav(state: NavState) {
		if (state.type !== 'back') return;
		this.close().emit('close');
	}
	#update = (flyout: DOMRect, anchor: DOMRect) => {
		const { top, left, bottom, right } = anchor;
		const { width, height } = flyout;
		const { vStart, vEnd, hStart, hEnd } = safeRect;

		let y = top - height - PADDING;
		if (y < vStart) y = bottom + PADDING;
		if (y + height > vEnd) y = vStart;

		const x = clamp(hStart, (left + right - width) / 2, hEnd - width);
		$style(this.#flyout, { left: x, top: y });
	};
	/** 打开浮出面板 */
	open(): this {
		if (this.#flyout.isConnected) return this;

		document.body.append(this.#backdrop, this.#flyout);
		navigate.addLayer(this.#flyout);
		this.#layout.start();
		this.#flyout.classList.add(CLASS_SHOW);

		return this;
	}
	/** 关闭浮出面板 */
	close(): this {
		navigate.rmLayer(this.#flyout);
		this.#layout.stop();
		this.#backdrop.remove();
		const animation = this.#flyout.animate({ opacity: 0 }, 100);
		animation.onfinish = () => {
			this.#flyout.remove();
			this.#flyout.classList.remove(CLASS_SHOW);
		};
		return this;
	}
	#anchor!: HTMLElement;
	/** 锚点元素 */
	get anchor() {
		return this.#anchor;
	}
	set anchor(value) {
		if (!(value instanceof HTMLElement)) {
			throw new TypeError('Flyout anchor require instance HTMLElement', {
				cause: value,
			});
		}
		this.#anchor = value;
		this.#layout.targets = [this.#flyout, value];
	}
	get content(): (Node | string)[] {
		return $content(this.#flyout);
	}
	set content(value: DOMContents) {
		this.#flyout.replaceChildren(...asArray(value));
	}
	get width(): string {
		return this.#flyout.style.width;
	}
	set width(value: number | string) {
		if (typeof value === 'number') value = `${value}px`;
		this.#flyout.style.width = String(value);
	}
	/** 设置主题颜色 */
	setColor(value: ThemeColor): this {
		$color(this.#flyout, value);
		return this;
	}
	/**
	 * 创建确认浮出面板
	 * @param anchor 锚点元素
	 * @param init 初始化参数
	 */
	static confirm(
		anchor: HTMLElement,
		init?: ConfirmFlyoutInit,
	): Promise<boolean> & { flyout: Flyout } {
		const btn =
			init?.button instanceof Button
				? init.button
				: $new(Button, init?.button, t('ui.confirm'));
		const flyout = new Flyout(anchor, init);
		flyout.content = [...flyout.content, btn];
		const promise: any = new Promise<boolean>((resolve) => {
			btn.once('active', () => {
				flyout.close();
				resolve(true);
			});
			flyout.once('close', () => resolve(false));
		});
		promise.flyout = flyout;
		flyout.open();
		return promise;
	}
	/**
	 * 创建创建提示浮出面板
	 * @param anchor 锚点元素
	 * @param init 初始化参数
	 */
	static alert(
		anchor: HTMLElement,
		init?: FlyoutInit,
	): Promise<void> & { flyout: Flyout } {
		const flyout = new Flyout(anchor, init);
		const promise: any = new Promise<void>((resolve) => {
			flyout.once('close', resolve);
		});
		promise.flyout = flyout;
		flyout.open();
		return promise;
	}
}
