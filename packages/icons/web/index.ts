import { UIDefaultDict, configs, locale } from 'abm-ui';
import { $$, $ready, createLocaleDict } from 'abm-utils';
import { initAPI } from './api';
import { initDetail } from './detail';
import { initPicker } from './picker';
import { initProject } from './project';

//#region Configs
const LOCALES: Record<string, UIDefaultDict> &
	Record<string, Record<string, string>> = {
	zh: {
		// Basic
		'ui.confirm': '确定',
		'ui.cancel': '取消',
		'ui.ok': '好',
		'ui.color_picker': '颜色选择器',
		'ui.alpha': '不透明度',
		'ui.red': '红',
		'ui.green': '绿',
		'ui.blue': '蓝',
		'ui.hue': '色相',
		'ui.saturation': '饱和度',
		'ui.lightness': '亮度',
		// Other
		error: '错误',
		'project-list': '项目列表',
		'add-project': '添加项目',
		'filter-name': '名称',
		'filter-region': '区域',
		'filter-type': '类型',
		'filter-size': '尺寸',
		'add-to-project': '添加到项目',
		'compile-project': '编译项目',
		'compile-all': '编译所有图标',
		'delete-project': '删除项目',
		'compile-started': '已经启动编译，请检查后端控制台',
		'compile-all-warning':
			'注意：未完成功能！编译需要较长时间，且图标不一定可用。',
	},
	en: {
		// Basic
		'ui.confirm': 'Confirm',
		'ui.cancel': 'Cancel',
		'ui.ok': 'OK',
		'ui.color_picker': 'Color Picker',
		'ui.alpha': 'Alpha',
		'ui.red': 'Red',
		'ui.green': 'Green',
		'ui.blue': 'Blue',
		'ui.hue': 'Hue',
		'ui.saturation': 'Saturation',
		'ui.lightness': 'Lightness',
		// Other
	},
};

configs.init({
	locale: {
		'': createLocaleDict(
			locale.prefers[0].split('-')[0] === 'zh' ? LOCALES.zh : LOCALES.en,
		),
	},
	icon: $$<HTMLLinkElement>('#link-icon')
		.map((e) => [...e.sheet!.cssRules].map((rule) => rule.cssText).join(''))
		.map((css) => {
			const sheet = new CSSStyleSheet();
			sheet.replaceSync(css);
			return sheet;
		}),
	defaults: {
		selectExpand: 'ChevronUpDown',
	},
});

$ready(() => {
	initAPI();
	initProject();
	initPicker();
	initDetail();
});
