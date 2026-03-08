import type { SerializableThemeColor } from '../_nav/color';
import type { Direction } from '../_nav/direction';
import type { ColorSchema } from '../_nav/schema';

const channel = new BroadcastChannel('ABM_DOCS');

interface GlobalMessages {
	scheme: [schema: ColorSchema];
	color: [color: SerializableThemeColor];
	lang: [lang: string];
	dire: [dire: Direction];
}

/** 发送全局信息 */
export function $emit<T extends keyof GlobalMessages>(
	type: T,
	...args: GlobalMessages[T]
): void {
	channel.postMessage({ type, args });
}

/** 处理全局信息 */
export function $handle<T extends keyof GlobalMessages>(
	type: T,
	handler: (...args: GlobalMessages[T]) => any,
): void {
	channel.addEventListener('message', (event) => {
		if (event.data.type !== type) return;
		handler(...event.data.args);
	});
}
