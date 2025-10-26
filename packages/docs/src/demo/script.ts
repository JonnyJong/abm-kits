import { $lang, configs, defaultLocale, type WidgetBtn } from 'abm-ui';
import { $, $div, $new, $ready, IDGenerator, sleep } from 'abm-utils';
import { error, log, warn } from 'log2dom';

const idGenerator = new IDGenerator();

//#region Init
const channel = new BroadcastChannel('abm_demo');
channel.addEventListener('message', ({ data }) => {
	if (data.color) configs.theme.color = data.color;
	if (data.schema) configs.theme.colorScheme = data.schema;
});

try {
	const mainLocale = (window.parent as any)?.__LOCALE;
	let locale = JSON.parse(window.frameElement?.getAttribute('locale') ?? '');
	locale = { ...mainLocale, ...locale };
	defaultLocale.loader = () => locale;
	defaultLocale.reload();
} catch (error) {
	console.error(error);
}
const color = localStorage.getItem('theme-color');
if (color) {
	try {
		configs.theme.color = color;
	} catch {}
}
const schema = localStorage.getItem('theme-schema');
if (schema) {
	try {
		configs.theme.colorScheme = schema as any;
	} catch {}
}

configs.init({
	icon: (() => {
		const css = [...$<HTMLLinkElement>('#assets-icon')!.sheet!.cssRules]
			.map((rule) => rule.cssText)
			.join('');
		const sheet = new CSSStyleSheet();
		sheet.replaceSync(css);
		return sheet;
	})(),
});

//#region Main
let main: HTMLElement;
let panel: HTMLElement;
let ctrlPanel: HTMLElement;
let logPanel: HTMLElement;

function createAttrKV(key: string, e: HTMLElement) {
	const id = idGenerator.next();
	const label = $new({ tag: 'w-label', prop: { for: id }, content: key });
	e.id = id;
	return $div({ class: 'attr' }, label, e);
}

window.register = (options) => {
	// Event
	let eventBtns: WidgetBtn[] | undefined;
	if (options.events) {
		ctrlPanel.append($new({ tag: 'h3' }, $new({ tag: 'w-lang' }, 'demo.events')));
		eventBtns = options.events.map((event) =>
			$new<WidgetBtn>({
				tag: 'w-btn',
				prop: { disabled: true, state: 'toggle', checked: false },
				data: { event },
				content: event,
			}),
		);
		ctrlPanel.append($div({ class: 'events' }, ...eventBtns));
	}
	// Attr
	const attrMap = new Map<string, (value: any) => void>();
	if (options.attrs) {
		ctrlPanel.append($new({ tag: 'h3' }, $lang('demo.attrs')));
		const attrPanel = $div({ class: 'attr-list' });
		ctrlPanel.append(attrPanel);
		for (const attr of options.attrs) {
			switch (attr.type) {
				case 'string': {
					const e = $new({ tag: 'w-text' });
					e.value = attr.value;
					e.on('input', ({ value }) => attr.action(value));
					attrMap.set(attr.id, (value) => {
						e.value = String(value);
					});
					attrPanel.append(createAttrKV(attr.id, e));
					break;
				}
				case 'number': {
					const e = $new({ tag: 'w-number' });
					e.value = attr.value;
					if (attr.default) e.default = attr.default;
					if (attr.min) e.min = attr.min;
					if (attr.max) e.max = attr.max;
					if (attr.step) e.step = attr.step;
					e.on('input', ({ value }) => attr.action(value));
					attrMap.set(attr.id, (value) => {
						e.value = Number(value);
					});
					attrPanel.append(createAttrKV(attr.id, e));
					break;
				}
				case 'boolean': {
					const e = $new({
						tag: 'w-btn',
						prop: { state: 'toggle', checked: attr.value },
						content: attr.id,
					});
					e.on('active', () => attr.action(e.checked));
					attrMap.set(attr.id, (value) => {
						e.checked = !!value;
					});
					attrPanel.append(e);
					break;
				}
				case 'color': {
					const e = $new({ tag: 'w-color' });
					e.value = attr.value;
					e.on('change', () => attr.action(e.value));
					attrMap.set(attr.id, (value) => {
						try {
							e.value = value;
						} catch (error) {
							console.error(error);
						}
					});
					attrPanel.append(createAttrKV(attr.id, e));
					break;
				}
				case 'enum': {
					const e = $new({ tag: 'w-select' });
					e.options = attr.options.map((v) => ({ value: v, label: String(v) }));
					e.value = attr.value;
					e.on('change', () => attr.action(e.value));
					attrMap.set(attr.id, (value) => {
						e.value = value;
					});
					attrPanel.append(createAttrKV(attr.id, e));
					break;
				}
				case 'btn': {
					const e = $new({ tag: 'w-btn', content: attr.id });
					e.on('active', () => attr.action(undefined));
					attrPanel.append(e);
					break;
				}
			}
		}
	}
	// Update
	updateSize();
	return {
		update(id: string, value: any) {
			attrMap.get(id)?.(value);
		},
		async emit(event: string) {
			if (!eventBtns) return;
			for (const btn of eventBtns) {
				if (btn.dataset.event !== event) continue;
				btn.checked = true;
				// biome-ignore lint/performance/noAwaitInLoops: Sleep
				await sleep(100);
				btn.checked = false;
			}
		},
	} as any;
};

function createLogger(
	fn: (...data: any[]) => HTMLElement,
): (...data: any[]) => void {
	return (...data) => {
		const atBottom =
			Math.ceil(logPanel.scrollTop + logPanel.clientHeight) >=
			logPanel.scrollHeight;
		logPanel.append(fn(...data));
		if (logPanel.childElementCount > 100) logPanel.firstElementChild?.remove();
		if (!atBottom) return;
		logPanel.scrollTo({ behavior: 'instant', top: logPanel.scrollHeight });
	};
}

function calcSize(e: HTMLElement) {
	return (
		e.offsetTop + e.offsetHeight + parseFloat(getComputedStyle(e).marginBottom)
	);
}

function updateSize() {
	const frame = window.frameElement as HTMLElement;
	if (!frame) return;
	const lastE = ctrlPanel.lastElementChild as HTMLElement;
	const panelSize = lastE ? calcSize(lastE) : 0;
	const mainSize = main.lastElementChild
		? calcSize(main.lastElementChild as HTMLElement)
		: 0;
	frame.style.height = `${Math.max(panelSize + 200, mainSize + 100)}px`;
}

window.addEventListener('resize', updateSize);

$ready(() => {
	main = $('#main', document.body)!;
	panel = $('#panel', document.body)!;
	ctrlPanel = $('#control', panel)!;
	logPanel = $('#logs', panel)!;
	window.demo?.({
		...console,
		debug: createLogger(log),
		info: createLogger(log),
		log: createLogger(log),
		warn: createLogger(warn),
		error: createLogger(error),
	});
});
