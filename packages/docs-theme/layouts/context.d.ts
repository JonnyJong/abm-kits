import type { Page } from "ezal";
import type { Locales } from '../src/locale';
import type { DocsNav } from '../src/page/doc/navigation';

interface Context {
	language: string;
	page: Page;
	locales: Locales;
	nav: DocsNav[];
}

declare global {
	const context: Context;
}
