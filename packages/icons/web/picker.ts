import {
	events,
	Dialog,
	UIEventActive,
	WidgetSelect,
	WidgetSlider,
	WidgetText,
} from 'abm-ui';
import { $, Debounce } from 'abm-utils';
import { getValues, queryIcon } from './api';
import { selectIcon } from './detail';
import { createIcon } from './icon';

let main: HTMLDivElement;
let filter: {
	name: WidgetText;
	region: WidgetSelect<string | undefined>;
	type: WidgetSelect<string | undefined>;
	size: WidgetSelect<number | undefined>;
};

async function applyFilter() {
	let name: undefined | string = filter.name.value;
	if (!name) name = undefined;
	const result = await queryIcon({
		name,
		region: filter.region.value,
		type: filter.type.value,
		size: filter.size.value,
	});
	if (result instanceof Error) return;
	main.replaceChildren(
		...result.map((info) => {
			const icon = createIcon(info);
			icon.toggleAttribute('ui-nav', true);
			events.hover.add(icon);
			events.active.on(icon, selectIconHandler);
			return icon;
		}),
	);
	main.scroll({ top: 0, behavior: 'instant' });
}

function selectIconHandler(event: UIEventActive) {
	if (event.active || event.cancel) return;
	const info = (event.target as any).info;
	if (!info) return;
	selectIcon(info);
}

export async function initPicker() {
	main = $('.picker-main')!;
	filter = {
		name: $('.picker-filter-name')!,
		region: $('.picker-filter-region')!,
		type: $('.picker-filter-type')!,
		size: $('.picker-filter-size')!,
	};

	const scaler = $<WidgetSlider>('.picker-scale')!;
	scaler.from = 8;
	scaler.to = 256;
	scaler.value = 128;
	scaler.on('input', ({ value }) => {
		main.style.setProperty('--scale', `${value}px`);
	});

	const values = await getValues();
	if (values instanceof Error) {
		Dialog.ok({ title: 'error', content: values.message, autoHide: true });
		return;
	}

	filter.region.options = [
		{ value: undefined, label: 'All' },
		...values.regions.map((region) => ({ value: region, label: region })),
	];
	filter.type.options = [
		{ value: undefined, label: 'All' },
		...values.types.map((type) => ({ value: type, label: type })),
	];
	filter.size.options = [
		{ value: undefined, label: 'All' },
		...values.sizes.map((size) => ({ value: size, label: size.toString() })),
	];
	filter.region.value = undefined;
	filter.type.value = undefined;
	filter.size.value = undefined;

	applyFilter();
	const debouncedFilter = Debounce.new(applyFilter);
	filter.name.on('input', debouncedFilter);
	filter.region.on('change', debouncedFilter);
	filter.type.on('change', debouncedFilter);
	filter.size.on('change', debouncedFilter);
}
