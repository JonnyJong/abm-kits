import type {
	WidgetCheckbox,
	WidgetColor,
	WidgetGridData,
	WidgetNumber,
	WidgetPassword,
	WidgetProgressRing,
	WidgetSelect,
	WidgetSlider,
	WidgetSwitch,
	WidgetText,
} from 'abm-ui';
import { $, $div, $new } from 'abm-utils';

type Option = 'admin' | 'user' | 'guest' | 'moderator';

interface Row {
	id: string;
	progress: number;
	text: string;
	psw: string;
	number: number;
	option: Option;
	number2: number;
	enable: boolean;
	selected: boolean;
	color: string;
}

const randomString = (length: number) =>
	[...new Array(length)]
		.map(() => Math.random().toString(36)[2] || '0')
		.join('');

const maybeNaN = () =>
	Math.random() < 0.1 ? NaN : Math.trunc(Math.random() * 100) + 1;

const randomColor = () =>
	`#${[...new Array(6)]
		.map(() => Math.trunc(Math.random() * 16).toString(16))
		.join('')}`;

const generateTestData = (count: number): Row[] => {
	const options: Option[] = ['admin', 'user', 'guest', 'moderator'];

	return Array.from({ length: count }, (_, i) => ({
		id: `id-${i + 1000}`,
		progress: maybeNaN(),
		text: randomString(4),
		psw: randomString(8),
		number: Math.trunc(Math.random() * 1000),
		option: options[Math.trunc(Math.random() * options.length)],
		number2: Math.random() * 100,
		enable: Math.random() < 0.5,
		selected: Math.random() < 0.3,
		color: randomColor(),
	}));
};

const OPTIONS = [
	{ value: 'admin', label: 'admin' },
	{ value: 'user', label: 'user' },
	{ value: 'guest', label: 'guest' },
	{ value: 'moderator', label: 'moderator' },
];

const grid = $<WidgetGridData<Row>>('w-grid-data')!;
grid.setup({
	data: generateTestData(30),
	columnDefinitions: new Map([
		[
			'id',
			{
				head: () => $div('id'),
				create: ({ id }) => $div(id),
				refresh({ id }, element) {
					element.textContent = id;
				},
				sort: (a, b) => a.id.localeCompare(b.id),
			},
		],
		[
			'progress',
			{
				head: () => $div('progress'),
				create: ({ progress }) =>
					$new({
						tag: 'w-progress-ring',
						prop: { value: progress },
						style: { $wProgressRingSize: 16 },
					}),
				refresh({ progress }, element) {
					(element as WidgetProgressRing).value = progress;
				},
				sort: (a, b) => {
					const aNaN = Number.isNaN(a.progress);
					const bNaN = Number.isNaN(b.progress);
					if (aNaN && bNaN) return 0;
					if (aNaN) return -Infinity;
					if (bNaN) return Infinity;
					return a.progress - b.progress;
				},
			},
		],
		[
			'text',
			{
				head: () => $div('text'),
				create: (row) => {
					const node = $new({ tag: 'w-text' });
					node.value = row.text;
					node.on('confirm', () => {
						row.text = node.value;
					});
					return node;
				},
				refresh({ text }, element) {
					(element as WidgetText).value = text;
				},
				sort: (a, b) => a.text.localeCompare(b.text),
			},
		],
		[
			'psw',
			{
				head: () => $div('psw'),
				create: (row) => {
					const node = $new({ tag: 'w-password' });
					node.value = row.psw;
					node.on('confirm', () => {
						row.psw = node.value;
					});
					return node;
				},
				refresh({ psw }, element) {
					(element as WidgetPassword).value = psw;
				},
				sort: (a, b) => a.psw.localeCompare(b.psw),
			},
		],
		[
			'number',
			{
				head: () => $div('number'),
				create: (row) => {
					const node = $new({ tag: 'w-number' });
					node.value = row.number;
					node.on('confirm', () => {
						row.number = node.value;
					});
					return node;
				},
				refresh({ number }, element) {
					(element as WidgetNumber).value = number;
				},
				sort: (a, b) => a.number - b.number,
			},
		],
		[
			'option',
			{
				head: () => $div('option'),
				create: (row) => {
					const node = $new<WidgetSelect<any>>({
						tag: 'w-select',
						style: { width: '100%' },
					});
					node.options = OPTIONS;
					node.value = row.option;
					node.on('change', () => {
						row.option = node.value!;
					});
					return node;
				},
				refresh({ option }, element) {
					(element as WidgetSelect).value = option;
				},
				sort: (a, b) => a.option.localeCompare(b.option),
			},
		],
		[
			'number2',
			{
				head: () => $div('number2'),
				create: (row) => {
					const node = $new({ tag: 'w-slider' });
					node.value = row.number2;
					node.on('change', () => {
						row.number2 = node.value;
					});
					return node;
				},
				refresh({ number2 }, element) {
					(element as WidgetSlider).value = number2;
				},
				sort: (a, b) => a.number2 - b.number2,
			},
		],
		[
			'enable',
			{
				head: () => $div('enable'),
				create: (row) => {
					const node = $new({ tag: 'w-switch' });
					node.checked = row.enable;
					node.on('change', () => {
						row.enable = node.checked;
					});
					return node;
				},
				refresh({ enable }, element) {
					(element as WidgetSwitch).checked = enable;
				},
				sort: (a, b) => {
					if (a.enable === b.enable) return 0;
					if (a.enable) return 1;
					return -1;
				},
			},
		],
		[
			'selected',
			{
				head: () => $div('selected'),
				create: (row) => {
					const node = $new({ tag: 'w-checkbox' });
					node.checked = row.selected;
					node.on('change', () => {
						row.selected = node.checked;
					});
					return node;
				},
				refresh({ selected }, element) {
					(element as WidgetCheckbox).checked = selected;
				},
				sort: (a, b) => {
					if (a.selected === b.selected) return 0;
					if (a.selected) return 1;
					return -1;
				},
			},
		],
		[
			'color',
			{
				head: () => $div('color'),
				create: (row) => {
					const node = $new({ tag: 'w-color' });
					node.value = row.color;
					node.on('change', () => {
						row.color = node.value.hex();
					});
					return node;
				},
				refresh({ color }, element) {
					(element as WidgetColor).value = color;
				},
				sort: (a, b) => a.color.localeCompare(b.color),
			},
		],
	]),
	column: [
		{ key: 'id', width: 64 },
		{ key: 'progress', width: 100 },
		{ key: 'text', width: 200 },
		{ key: 'psw', width: 200 },
		{ key: 'number', width: 110 },
		{ key: 'option', width: 120 },
		{ key: 'number2', width: 100 },
		{ key: 'enable', width: 80 },
		{ key: 'selected', width: 100 },
		{ key: 'color', width: 64 },
	],
	rowHeight: 36,
});

window.register({
	attrs: [
		{
			id: 'refresh',
			type: 'btn',
			action() {
				grid.data = generateTestData(30);
			},
		},
	],
});
