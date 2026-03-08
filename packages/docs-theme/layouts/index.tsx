import { URL } from 'ezal';
import base from './base';

export default base(
	<link rel="stylesheet" href={URL.for('grid.css')} />,
	<h1 class="text-display">{context.page.title}</h1>,
	<RawHTML html={context.page!.content} />,
);
