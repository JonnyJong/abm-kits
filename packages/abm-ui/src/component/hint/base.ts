import { KeyedComponent } from '../keyed';

export class HintBase<
	T extends string,
	P extends {} = {},
	E extends {} = {},
> extends KeyedComponent<T | undefined, P, E> {
	protected initial(): undefined {}
	protected parse(input: unknown): T | undefined {
		if (input === undefined) return input;
		return String(input) as T;
	}
}
