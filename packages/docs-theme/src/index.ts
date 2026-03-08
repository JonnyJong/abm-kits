import path from 'node:path';
import type { ThemeConfig } from 'ezal';
import { initProxyAssets } from './assets';
import { layoutConfig } from './layout';
import { type Locales, setLocales } from './locale';
import { markdownPageHandler } from './markdown';
import { init404Page } from './page/404';
import { initDemoPage } from './page/demo';
import { handleDocAdd, handleDocRm } from './page/doc/events';
import { enableResolve, pageManager } from './page/doc/page-manager';
import { depTransformRule } from './transform/dep';
import { scriptTransformRule } from './transform/script';
import { styleTransformRule } from './transform/stylus';

interface ThemeInit {
	locales: Locales;
	assets: Record<string, string>;
}

export async function theme(init: ThemeInit): Promise<ThemeConfig> {
	setLocales(init.locales);
	initProxyAssets(init.assets);
	return {
		assetsRoot: path.join(__dirname, '../assets'),
		transformRules: [depTransformRule, scriptTransformRule, styleTransformRule],
		layout: layoutConfig,
		pageHandlers: [await markdownPageHandler()],
		hooks: {
			'article:add': [handleDocAdd],
			'article:remove': [handleDocRm],
			'scan:after': [enableResolve, init404Page, initDemoPage],
			'build:after:articles': [() => pageManager.buildIndex()],
		},
	};
}
