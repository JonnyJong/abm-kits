import { EventValue, Events } from 'abm-utils';
import { KeyboardEvents, keyboard } from '../../../keyboard';
import { navigate } from '../../../navigate';
import { InputAutoFill } from './autofill';
import { InputElement, WidgetInput, WidgetInputEventsInit } from './base';

export function initInputNavigate(
	this: WidgetInput<any>,
	input: InputElement,
	events: Events<WidgetInputEventsInit<any>>,
	autoFill?: InputAutoFill<any>,
) {
	const aliasPressHandler = (event: KeyboardEvents['aliasPress']) => {
		if (event.key !== 'ui.confirm') return;
		events.emit(new EventValue('confirm', { target: this, value: this.value }));
	};
	const navCancelHandler = () => input.blur();
	const shortcutHandler = (event: KeyboardEvents['shortcutTrigger']) => {
		if (event.key === 'ui.navPrev') navigate.nav('prev');
		else if (event.key === 'ui.navNext') navigate.nav('next');
	};
	const triggerHandler = (event: KeyboardEvents['trigger']) => {
		if (!autoFill) return;
		if (event.key === 'ArrowUp') navigate.nav('up');
		else if (event.key === 'ArrowDown') navigate.nav('down');
	};

	input.addEventListener('focus', () => {
		keyboard.on('aliasPress', aliasPressHandler);
		navigate.addLayer(this);
		navigate.on('cancel', navCancelHandler);
		keyboard.on('shortcutTrigger', shortcutHandler);
		if (!autoFill) return;
		keyboard.on('trigger', triggerHandler);
	});
	input.addEventListener('blur', () => {
		keyboard.off('aliasPress', aliasPressHandler);
		events.emit(new EventValue('confirm', { target: this, value: this.value }));
		navigate.rmLayer(this);
		navigate.off('cancel', navCancelHandler);
		keyboard.off('shortcutTrigger', shortcutHandler);
		if (!autoFill) return;
		keyboard.off('trigger', triggerHandler);
	});
}
