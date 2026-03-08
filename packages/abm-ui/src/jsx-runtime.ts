import type { ElementPropMap, GlobalAttributes } from './infra/dom';

declare global {
	namespace JSX {
		interface IntrinsicAttributes extends GlobalAttributes {}
		interface IntrinsicElements extends ElementPropMap {}
		type Element = HTMLElement;
		type ElementAttributesProperty = 'props';
	}
}

export const Fragment = DocumentFragment;

// biome-ignore lint/performance/noBarrelFile: 重定向以提供 JSX 运行时
export { $new as jsx, $new as jsxs } from './infra/dom';
