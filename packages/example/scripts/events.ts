import { events, UIEventSlideHandler } from 'abm-ui';
import { $, $$, $apply } from 'abm-utils';

export function initEvents() {
	events.hover.add($('#events-hover')!);
	for (const element of $$(`[id^='events-active-']`)) {
		events.active.add(element);
	}
	const slidePanel = $('#event-slide-panel')!;
	const slideHandler: UIEventSlideHandler = (event) => {
		const { top, left } = slidePanel.getBoundingClientRect();
		$apply(event.target, {
			style: {
				left: event.x - left,
				top: event.y - top,
			},
		});
	};
	for (const element of $$(`[id^='events-slide-']`)) {
		events.slide.on(element, slideHandler);
	}
}
