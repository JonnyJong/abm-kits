import { type LocaleLoader, locale, type PromiseOr } from 'abm-utils';
import { Icon, type IconPackage } from './component/icon';
import { DEFAULT } from './constant';
import { $color, type ThemeColor } from './infra/color';
import { $new, $ready } from './infra/dom';
import { safeRect } from './infra/screen';
import {
	initToast,
	Toast,
	type ToastHorizontalAnchor,
	type ToastVerticalAnchor,
} from './widget/toast';
import { initTooltip } from './widget/tooltip';

/** UI 初始化参数 */
export interface UISetupOptions {
	/**
	 * 主题色
	 * @default ['#222','#eee']
	 */
	color?: ThemeColor;
	/** 翻译词典加载器 */
	localeLoader?: LocaleLoader;
	/**
	 * 语言列表
	 * @default 'navigator.languages'
	 */
	locales?: string[];
	/** 图标包 */
	icons?: IconPackage;
	/** 吐司通知设置 */
	toast?: {
		/**
		 * 垂直锚点
		 * @description
		 * - `top`：顶部
		 * - `bottom`：底部
		 */
		verticalAnchor?: ToastVerticalAnchor;
		/**
		 * 水平锚点
		 * @description
		 * - `left`：靠左
		 * - `center`：居中
		 * - `right`：靠右
		 */
		horizontalAnchor?: ToastHorizontalAnchor;
		/** 水平偏移 */
		horizontalOffset?: number;
		/** 垂直偏移 */
		verticalOffset?: number;
	};
	/** 屏幕安全区边框 */
	safeRect?: { top?: number; right?: number; bottom?: number; left?: number };
}

/** UI 初始化 */
export async function setup(options?: PromiseOr<UISetupOptions>) {
	options = await options;
	const locales = { zh: DEFAULT.LOCALE_ZH, en: DEFAULT.LOCALE_EN };
	locale.setup({
		loader: options?.localeLoader ?? ((locale) => (locales as any)[locale]),
		locales: options?.locales ?? locale.patch(navigator.languages, ['en', 'zh']),
	});
	if (options?.icons) Icon.register(options.icons);
	if (options?.toast) {
		const { verticalAnchor, horizontalAnchor, verticalOffset, horizontalOffset } =
			options.toast;
		if (verticalAnchor) Toast.verticalAnchor = verticalAnchor;
		if (horizontalAnchor) Toast.horizontalAnchor = horizontalAnchor;
		if (verticalOffset) Toast.verticalOffset = verticalOffset;
		if (horizontalOffset) Toast.horizontalOffset = horizontalOffset;
	}

	await $ready();

	const style = $new('style');
	$color(style, options?.color ?? ['#222', '#eee']);
	style.textContent = `:root{${style.style.cssText}}`;
	style.style.cssText = '';
	document.head.append(style);
	initTooltip();
	initToast();
	if (!options?.safeRect) return;
	const { top, right, bottom, left } = options.safeRect;
	if (top) safeRect.top = top;
	if (right) safeRect.right = right;
	if (bottom) safeRect.bottom = bottom;
	if (left) safeRect.left = left;
}
