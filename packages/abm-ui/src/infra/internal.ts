import type { ElementConstructor } from './dom';

/** 元素属性名称图 */
const ELEMENT_PROPS_NAME_MAP = new Map<ElementConstructor, Set<string>>();

/** 注册元素属性 */
export function registerElementProps(target: ElementConstructor): Set<string> {
	const props = new Set<string>();
	let proto = target.prototype;
	while (proto) {
		const descriptors = Object.getOwnPropertyDescriptors(proto);
		for (const [name, descriptor] of Object.entries(descriptors)) {
			if (!descriptor.set) continue;
			if (name[0] === '_') continue;
			props.add(name);
		}
		proto = Object.getPrototypeOf(proto);
	}
	ELEMENT_PROPS_NAME_MAP.set(target, props);
	return props;
}

/** 获取元素属性 */
export function getElementProps(
	element: Element,
	type: ElementConstructor | string,
): Set<string> {
	let proto: ElementConstructor;
	if (typeof type === 'function') proto = type;
	else proto = Object.getPrototypeOf(element).constructor;

	return ELEMENT_PROPS_NAME_MAP.get(proto) ?? registerElementProps(proto);
}
