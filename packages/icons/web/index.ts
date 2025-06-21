import {
	DEFAULT_LOCALE_DICTS,
	UIDefaultLocaleDict,
	configs,
	defaultLocale,
} from 'abm-ui';
import { $$, $ready, LocaleDict } from 'abm-utils';
import { initAPI } from './api';
import { initDetail } from './detail';
import { initPicker } from './picker';
import { initProject } from './project';

//#region Configs
declare module 'abm-ui' {
	export interface UIDefaultLocaleDict extends LocaleDict {
		error: string;
		'project-list': string;
		'filter-name': string;
		'filter-region': string;
		'filter-type': string;
		'filter-size': string;
		'add-to-project': string;
		'compile-project': string;
		'compile-all': string;
		'delete-project': string;
		'delete-project-only': string;
		'delete-project-data': string;
		'include-with-defaults': string;
		'compile-started': string;
		'compile-all-warning': string;
		'rename-project': string;
		'create-project': string;
		'project-name': string;
		'project-path': string;
		'project-dist': string;
	}
}
const LOCALE_DICTS: Record<string, UIDefaultLocaleDict> = {
	zh: {
		...DEFAULT_LOCALE_DICTS.zh,
		error: '错误',
		'project-list': '项目列表',
		'filter-name': '名称',
		'filter-region': '区域',
		'filter-type': '类型',
		'filter-size': '尺寸',
		'add-to-project': '添加到项目',
		'compile-project': '编译项目',
		'compile-all': '编译所有图标',
		'delete-project': '删除项目',
		'delete-project-only': '仅删除项目',
		'delete-project-data': '删除项目记录和添加的图标',
		'include-with-defaults': '包含默认图标',
		'compile-started': '已经启动编译，请检查后端控制台',
		'compile-all-warning':
			'注意：未完成功能！编译需要较长时间，且图标不一定可用。',
		'rename-project': '重命名项目',
		'create-project': '创建项目',
		'project-name': '项目名称',
		'project-path': '项目路径（绝对路径）',
		'project-dist': '图标生成路径（推荐相对路径）',
	},
	en: {
		...DEFAULT_LOCALE_DICTS.en,
		error: 'Error',
		'project-list': 'Project List',
		'filter-name': 'Name',
		'filter-region': 'Region',
		'filter-type': 'Type',
		'filter-size': 'Size',
		'add-to-project': 'Add to project',
		'compile-project': 'Compile project',
		'compile-all': 'Compile all icons for project',
		'delete-project': 'DeleteProject',
		'delete-project-only': 'Delete project only',
		'delete-project-data': 'Delete project and added icon records',
		'include-with-defaults': 'Include defaults icons',
		'compile-started':
			'Compilation has been initiated, please check the backend console',
		'compile-all-warning':
			'Note: Unfinished feature! Compilation takes longer and icons are not always available.',
		'rename-project': 'Rename project',
		'create-project': 'Create project',
	},
};

configs.init({
	icon: $$<HTMLLinkElement>('#link-icon')
		.map((e) => [...e.sheet!.cssRules].map((rule) => rule.cssText).join(''))
		.map((css) => {
			const sheet = new CSSStyleSheet();
			sheet.replaceSync(css);
			return sheet;
		}),
});

defaultLocale.loader = (locale) => LOCALE_DICTS[locale] ?? null;

$ready(() => {
	initAPI();
	initProject();
	initPicker();
	initDetail();
});
