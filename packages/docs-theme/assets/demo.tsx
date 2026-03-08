import {
	$,
	$div,
	$new,
	Button,
	Checkbox,
	ColorBox,
	LOCALES as DEFAULT,
	NumberBox,
	Select,
	setup,
	TextBox,
	t,
} from 'abm-ui';
import {
	type LocaleDict,
	type LocalePackage,
	type LocaleVariant,
	locale,
	sleep,
} from 'abm-utils';
import log2dom from 'log2dom';
import { $handle } from './_internal/channel';
import { $get } from './_internal/config';
import { ICONS, PRESET_ICONS } from './_internal/icon';
import { setDirection } from './_nav/direction';
import { setSchema } from './_nav/schema';

declare module 'abm-utils' {
	interface LocaleRegistry extends LocalePackage<typeof ZH> {}
}

type ControlProp =
	| 'boolean'
	| 'string'
	| 'number'
	| any[]
	| {
			type: 'number';
			min?: number;
			max?: number;
			step?: number;
			default?: number;
	  }
	| 'color'
	| {
			type: 'string';
			preset?: string[];
	  };

interface ControlRegisterOptions {
	events?: string[];
	props?: Record<string, ControlProp>;
	actions?: Record<string, () => any>;
}

/** CSS 类名常量 */
const CSS_CLASSES = {
	CONTROL_CONTAINER: 'demo-control-container',
	LOG_CONTAINER: 'demo-log-container',
	SECTION_TITLE: 'demo-section-title',
	EVENT_INDICATOR: 'demo-event-indicator',
	EVENT_ACTIVE: 'demo-event-active',
	EVENT_LIST: 'demo-event-list',
	PROP_ITEM: 'demo-prop-item',
	PROP_NAME: 'demo-prop-name',
	PROP_VALUE: 'demo-prop-value',
	PROP_LIST: 'demo-prop-list',
	ACTION_LIST: 'demo-action-list',
} as const;

const ZH = {
	...DEFAULT.ZH,
	demo: {
		events: '事件',
		props: '属性',
		actions: '操作',
	},
} as const satisfies LocaleDict;

const EN: LocaleVariant<typeof ZH> = {
	...DEFAULT.EN,
	demo: {
		events: 'Events',
		props: 'Props',
		actions: 'Actions',
	},
};

const LOCALES = { ZH, EN };

/** 初始化配置 */
function initializeConfig(): void {
	// 设置主题方案
	setSchema($get('scheme') ?? 'system');
	$handle('scheme', setSchema);

	// 设置方向
	setDirection($get('dire') ?? 'auto');
	$handle('dire', setDirection);

	// 设置全局 body 引用
	(window as any).body = $('main');
}

/** 创建并管理容器 */
function createContainers(): {
	controlContainer: HTMLElement;
	logContainer: HTMLElement;
} {
	const controlContainer = $div({ className: CSS_CLASSES.CONTROL_CONTAINER });
	const logContainer = $div({ className: CSS_CLASSES.LOG_CONTAINER });

	const aside = $('aside')!;
	aside.append(controlContainer, logContainer);

	return { controlContainer, logContainer };
}

/** 注册事件指示器 */
function registerEvents(
	control: HTMLElement,
	events: string[],
	controlContainer: HTMLElement,
): void {
	const indicators = events.map((type) => {
		const indicator = $div({ className: CSS_CLASSES.EVENT_INDICATOR }, type);
		control.addEventListener(`__ABM_EVENT:${type}`, async (event) => {
			if (event.target !== control) return;
			indicator.classList.add(CSS_CLASSES.EVENT_ACTIVE);
			await sleep(300);
			indicator.classList.remove(CSS_CLASSES.EVENT_ACTIVE);
		});
		return indicator;
	});

	if (indicators.length === 0) return;

	controlContainer.append(
		$div({ className: CSS_CLASSES.SECTION_TITLE }, t('demo.events')),
		$div({ className: CSS_CLASSES.EVENT_LIST }, ...indicators),
	);
}

/** 创建属性控件 */
function createPropControl(
	control: any,
	name: string,
	prop: ControlProp,
): HTMLElement {
	switch (prop) {
		case 'boolean': {
			const checkbox = $new(Checkbox);
			checkbox.on('change', (value) => {
				control[name] = value;
			});
			checkbox.value = control[name];
			return checkbox;
		}
		case 'string': {
			const textBox = $new(TextBox);
			textBox.on('input', (value) => {
				control[name] = value;
			});
			textBox.value = control[name];
			return textBox;
		}
		case 'number': {
			const numBox = $new(NumberBox);
			numBox.on('input', (value) => {
				control[name] = value;
			});
			numBox.on('change', (value) => {
				control[name] = value;
			});
			numBox.value = control[name];
			return numBox;
		}
		case 'color': {
			const colorBox = $new(ColorBox);
			colorBox.on('change', (value) => {
				control[name] = value;
			});
			colorBox.value = control[name];
			return colorBox;
		}
	}

	if (Array.isArray(prop)) {
		const select = $new(Select);
		select.options = prop.map((value) => ({ value, label: String(value) }));
		select.on('change', (value: any) => {
			control[name] = value;
		});
		select.value = control[name];
		return select;
	}

	switch (prop.type) {
		case 'number': {
			const numBox = $new(NumberBox);
			numBox.on('input', (value: number) => {
				control[name] = value;
			});
			numBox.on('change', (value) => {
				control[name] = value;
			});
			numBox.value = control[name];
			if (prop.max) numBox.max = prop.max;
			if (prop.min) numBox.min = prop.min;
			if (prop.step) numBox.step = prop.step;
			if (prop.default) numBox.value = prop.default;
			return numBox;
		}
		default: {
			const textBox = $new(TextBox);
			textBox.on('input', (value) => {
				control[name] = value;
			});
			textBox.value = control[name];
			if (prop.preset) {
				textBox.autofill = prop.preset.map((value) => ({ id: value, value }));
			}
			return textBox;
		}
	}
}

/** 注册属性控件 */
function registerProps(
	control: HTMLElement,
	props: Record<string, ControlProp>,
	controlContainer: HTMLElement,
): void {
	const propControls = Object.entries(props).map(([name, prop]) => {
		const propControl = createPropControl(control, name, prop);
		propControl.classList.add(CSS_CLASSES.PROP_VALUE);
		return $div(
			{ className: CSS_CLASSES.PROP_ITEM },
			$div({ className: CSS_CLASSES.PROP_NAME }, name),
			propControl,
		);
	});

	if (propControls.length === 0) return;

	controlContainer.append(
		$div({ className: CSS_CLASSES.SECTION_TITLE }, t('demo.props')),
		$div({ className: CSS_CLASSES.PROP_LIST }, ...propControls),
	);
}

/** 注册动作按钮 */
function registerActions(
	actions: Record<string, () => any>,
	controlContainer: HTMLElement,
): void {
	const actionButtons = Object.entries(actions).map(([name, fn]) => {
		const button = $new(Button, {}, name);
		button.on('active', () => fn());
		return button;
	});

	if (actionButtons.length === 0) return;

	controlContainer.append(
		$div({ className: CSS_CLASSES.SECTION_TITLE }, t('demo.actions')),
		$div({ className: CSS_CLASSES.ACTION_LIST }, ...actionButtons),
	);
}

/** 劫持控制台日志 */
function setupConsoleHijacking(logContainer: HTMLElement): void {
	const originalConsole = console;
	const append = (node: HTMLElement) => {
		const { scrollHeight, scrollTop, offsetHeight } = logContainer;
		const isScrolledToBottom = scrollTop + offsetHeight >= scrollHeight - 4;
		logContainer.append(node);
		if (!isScrolledToBottom) return;
		logContainer.scrollTop = logContainer.scrollHeight;
	};
	window.console = {
		...originalConsole,
		info(...data: any[]) {
			append(log2dom.info(...data));
			originalConsole.info(...data);
		},
		log(...data: any[]) {
			append(log2dom.log(...data));
			originalConsole.log(...data);
		},
		error(...data: any[]) {
			append(log2dom.error(...data));
			originalConsole.error(...data);
		},
		warn(...data: any[]) {
			append(log2dom.warn(...data));
			originalConsole.warn(...data);
		},
	};
}

function loadScript() {
	const url = new URL(location.href).searchParams.get('script');
	if (!url) return;
	if (!url.startsWith('/')) return;
	const src = new URL(url, location.href).href;
	const script = $new('script', { src });
	document.body.append(script);
}

/** 初始化函数 */
function initializeDemoEnvironment(): void {
	// 初始化配置
	initializeConfig();

	// 创建容器
	const { controlContainer, logContainer } = createContainers();

	// 劫持控制台日志
	setupConsoleHijacking(logContainer);

	// 注册全局控制注册函数
	(window as any).__registerControl = (
		control: HTMLElement,
		options: ControlRegisterOptions,
	): void => {
		const { events, props, actions } = options;
		if (events) registerEvents(control, events, controlContainer);
		if (props) registerProps(control, props, controlContainer);
		if (actions) registerActions(actions, controlContainer);
	};

	// 初始化 UI 库
	setup({
		icons: { ui: PRESET_ICONS, ...ICONS },
		color: $get('theme') ?? undefined,
		locales: locale.patch($get('lang') ?? navigator.language, ['en', 'zh']),
		localeLoader: (locale) => (LOCALES as any)[locale.toUpperCase()],
	});

	loadScript();
}

// 启动初始化
initializeDemoEnvironment();
