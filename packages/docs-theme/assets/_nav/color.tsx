import {
	$,
	$color,
	$new,
	Button,
	ColorPicker,
	createNumberInputPrefab,
	createTabsPrefab,
	Dialog,
	ico,
	Label,
	SingletonPage,
	t,
} from 'abm-ui';
import { Color } from 'abm-utils';
import { $emit, $handle } from '../_internal/channel';
import { $get, $set } from '../_internal/config';

export type SerializableThemeColor =
	| string
	| [string, string]
	| { hue: number; chroma: number };

class SingleThemePage extends SingletonPage {
	#picker = $new(ColorPicker);
	init(): void {
		this.root.append(this.#picker);
	}
	get value() {
		return this.#picker.value.hex();
	}
	set value(value) {
		try {
			this.#picker.value = Color.hex(value);
		} catch (error) {
			console.error(error);
		}
	}
}
class DualThemePage extends SingletonPage {
	#light = $new(ColorPicker);
	#dark = $new(ColorPicker);
	init(): void {
		this.root.append(
			<div className="cfg-theme-title">{t('theme.mode.light')}</div>,
			this.#light,
			<hr />,
			<div className="cfg-theme-title">{t('theme.mode.dark')}</div>,
			this.#dark,
		);
	}
	get value(): [string, string] {
		return [this.#light.value.hex(), this.#dark.value.hex()];
	}
	set value(value) {
		try {
			this.#light.value = Color.hex(value[0]);
			this.#dark.value = Color.hex(value[1]);
		} catch (error) {
			console.error(error);
		}
	}
}
class AdaptiveThemePage extends SingletonPage {
	#hue = createNumberInputPrefab({
		start: 0,
		end: 360,
		numberBox: { id: 'cfg-theme-hue' },
	});
	#chroma = createNumberInputPrefab({
		start: 0,
		end: 1,
		value: 0.2,
		numberBox: { id: 'cfg-theme-chroma' },
	});
	init(): void {
		this.root.append(
			<div className="cfg-theme-field">
				<Label for="cfg-theme-hue">{t('theme.mode.hue')}</Label>
				{this.#hue.slider}
				{this.#hue.numberBox}
			</div>,
			<div className="cfg-theme-field">
				<Label for="cfg-theme-chroma">{t('theme.mode.chroma')}</Label>
				{this.#chroma.slider}
				{this.#chroma.numberBox}
			</div>,
		);
	}
	get value(): { hue: number; chroma: number } {
		return { hue: this.#hue.value, chroma: this.#chroma.value };
	}
	set value(value) {
		this.#hue.value = value.hue;
		this.#chroma.value = value.chroma;
	}
}

const setColor = (value: SerializableThemeColor) => {
	const prev = $('head>style[style=""]');
	const style = $new('style');
	$color(style, value);
	style.textContent = `:root{${style.style.cssText}}`;
	style.style.cssText = '';
	document.head.append(style);
	prev?.remove();
};

export function ThemeColorSetter() {
	const tabs = createTabsPrefab(
		{
			single: { tab: t('theme.mode.single'), content: SingleThemePage },
			dual: { tab: t('theme.mode.dual'), content: DualThemePage },
			adaptive: { tab: t('theme.mode.adaptive'), content: AdaptiveThemePage },
		},
		{
			nav: { className: 'cfg-theme-tabs' },
			pageHost: { className: 'cfg-theme-host', autoHeight: true },
			transition: 'slide',
		},
	);
	const confirm = $new(Button, { variant: 'primary' }, t('ui.confirm'));
	const dialog = new Dialog({
		title: t('theme.mode.setup'),
		content: [tabs.nav, tabs.pageHost],
		actions: [confirm],
	});

	confirm.on('active', () => {
		dialog.close();
		const value: SerializableThemeColor = (tabs.current as any).value;
		$set('theme', value);
		$emit('color', value);
		setColor(value);
	});

	const handleUpdate = (value: SerializableThemeColor) => {
		if (Array.isArray(value)) {
			tabs.value = 'dual';
		} else if (typeof value === 'string') {
			tabs.value = 'single';
		} else {
			tabs.value = 'adaptive';
		}
		(tabs.current as any).value = value;
	};
	const saved = $get('theme');
	if (saved) handleUpdate(saved);
	$handle('color', (value) => {
		setColor(value);
		handleUpdate(value);
	});

	const openDialog = $new(
		Button,
		{ tooltip: t('theme.mode.setup') },
		ico('color'),
	);
	openDialog.on('active', () => dialog.open());
	return openDialog;
}
