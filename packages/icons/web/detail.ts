import type { WidgetBtn, WidgetSelect } from 'abm-ui';
import { $ } from 'abm-utils';
import type { IconInfo } from '../types';
import { getIcon } from './api';
import { createIcon } from './icon';
import { addInProject } from './project';

let icon: HTMLElement;
let info: {
	region: WidgetSelect<string>;
	type: WidgetSelect<string>;
	size: WidgetSelect<number>;
};
let id: HTMLElement;
let icons: IconInfo[];

function pick<T, K extends keyof T>(objects: T[], key: K): T[K][] {
	return [...new Set(objects.map((obj) => obj[key]))];
}
function toOptions<T extends string | number>(values: T[]) {
	return values.map((value) => ({
		label: value.toString(),
		value,
	}));
}
function updateIcon() {
	const iconInfo = icons.find(
		({ region, type, size }) =>
			region === info.region.value &&
			type === info.type.value &&
			size === info.size.value,
	);
	if (!iconInfo) {
		console.error('Icon not found');
		return;
	}
	icon.replaceChildren(createIcon(iconInfo));
	id.textContent = iconInfo.id;
}

function updateType() {
	info.type.options = toOptions(
		pick(
			icons.filter(({ region }) => region === info.region.value),
			'type',
		),
	);
	if (!info.type.value) info.type.value = info.type.options[0].value;
}

function updateSize() {
	info.size.options = toOptions(
		pick(
			icons.filter(
				({ region, type }) =>
					region === info.region.value && type === info.type.value,
			),
			'size',
		),
	);
	if (!info.size.value) info.size.value = info.size.options[0].value;
}

export async function selectIcon(iconInfo: IconInfo) {
	const result = await getIcon(iconInfo.name);
	if (result instanceof Error) return;
	icons = result;
	info.region.options = toOptions(pick(icons, 'region'));
	info.region.value = iconInfo.region;
	updateType();
	info.type.value = iconInfo.type;
	updateSize();
	info.size.value = iconInfo.size;
	updateIcon();
}

export function initDetail() {
	icon = $('.detail-icon')!;
	info = {
		region: $('#detail-region')!,
		type: $('#detail-type')!,
		size: $('#detail-size')!,
	};
	id = $('#detail-id')!;

	const copyBtn = $<WidgetBtn>('#detail-copy')!;
	copyBtn.icon = 'Copy';
	copyBtn.on('active', () => {
		navigator.clipboard.writeText(id.textContent!);
	});

	info.region.on('change', () => {
		updateType();
		updateSize();
		updateIcon();
	});
	info.type.on('change', () => {
		updateSize();
		updateIcon();
	});
	info.size.on('change', () => {
		updateIcon();
	});

	$<WidgetBtn>('#detail-add')?.on('active', () => {
		const iconInfo = icons.find(
			({ region, type, size }) =>
				region === info.region.value &&
				type === info.type.value &&
				size === info.size.value,
		);
		if (!iconInfo) return;
		addInProject(iconInfo);
	});
}
