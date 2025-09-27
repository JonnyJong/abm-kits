/** biome-ignore-all lint/correctness/noUnusedVariables: Declaration */

interface AttrItemBase<T> {
	id: string;
	action(data: T): any;
}

interface AttrItemString extends AttrItemBase<string> {
	type: 'string';
	value: string;
}

interface AttrItemNumber extends AttrItemBase<number> {
	type: 'number';
	value: number;
	default?: number;
	min?: number;
	max?: number;
	step?: number;
}

interface AttrItemBoolean extends AttrItemBase<boolean> {
	type: 'boolean';
	value: boolean;
}

interface AttrItemColor extends AttrItemBase<import('abm-utils').Color> {
	type: 'color';
	value: import('abm-utils').Color | string;
}

interface AttrItemEnum<V = any> extends AttrItemBase<V> {
	type: 'enum';
	value: V;
	options: V[];
}

interface AttrItemBtn extends AttrItemBase<undefined> {
	type: 'btn';
}

type AttrItem =
	| AttrItemString
	| AttrItemNumber
	| AttrItemBoolean
	| AttrItemColor
	| AttrItemEnum
	| AttrItemBtn;

interface RegisterOptions {
	events?: string[];
	attrs?: AttrItem[];
}

interface Window {
	register<T extends RegisterOptions>(
		options: T,
	): (T['events'] extends (infer E & string)[]
		? { emit(event: E): Promise<void> }
		: {}) &
		(T['attrs'] extends AttrItem[]
			? { update(id: string, value: any): void }
			: {});
	demo?(console: Console): any;
}
