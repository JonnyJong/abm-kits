import { DEFAULT_LOCALE_DICTS } from 'abm-ui';
import { LocaleDict, defineTranslation as dt } from 'abm-utils';

export const LOCALE_ZH = {
	...DEFAULT_LOCALE_DICTS.zh,
	dev: {
		properties: '属性',
		events: '事件',
		ops: '操作',
		widget: {
			select: dt('选项 {i}', {}),
		},
		empty: '',
		components: {
			tooltips: { content: '工具提示内容' },
			dialog: {
				title: '标题',
				content: '内容（HTML）',
				color: '主题色',
				normal: '创建普通对话框',
				confirm: '创建确认对话框',
				alert: '创建警告对话框',
				mask_action: '点击遮罩时触发的 action ID',
			},
		},
		widgets: {
			file: {
				placeholder: '点击此处选择文件或将文件拖入此处以添加文件',
			},
		},
	},
} as const satisfies LocaleDict;
