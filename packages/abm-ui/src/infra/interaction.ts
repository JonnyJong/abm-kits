/**
 * 交互源
 * @description
 * - `nav`：导航（键盘、游戏控制器）
 * - `mouse`：鼠标
 * - `pen`：笔
 * - 数字：触摸 ID
 */
export type InteractionSource = 'nav' | 'mouse' | 'pen' | number;

export function toInteractionSource(
	input: InteractionSource | PointerEvent | PointerEvent['pointerType'] | Touch,
): InteractionSource {
	if (typeof input === 'number') return input;
	if (input instanceof Touch) return input.identifier;
	if (input instanceof PointerEvent) input = input.pointerType;
	if (input === 'nav') return 'nav';
	return input === 'pen' ? 'pen' : 'mouse';
}
