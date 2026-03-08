import { $new, Nav } from 'abm-ui';
import { $emit, $handle } from '../_internal/channel';
import { $get, $set } from '../_internal/config';

export type Direction = 'ltr' | 'rtl' | 'auto';

export function setDirection(dire: Direction): void {
	document.documentElement.style.direction = dire === 'auto' ? '' : dire;
}

export function DirectionSetter() {
	const dire = $get('dire') ?? 'auto';
	const directions: Direction[] = ['ltr', 'auto', 'rtl'];
	const nav = $new(Nav<Direction>);
	nav.setup(
		directions.map((value) => ({ value, content: value.toUpperCase() })),
	);
	nav.value = dire;
	nav.on('change', (value) => {
		$set('dire', value!);
		$emit('dire', value!);
		setDirection(value!);
	});
	$handle('dire', (value) => {
		setDirection(value);
		nav.value = value;
	});
	return nav;
}
