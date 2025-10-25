import { events, type Slidable, type SlideBorder } from 'abm-ui';
import { $, $apply, clamp } from 'abm-utils';

const container = $('#main')!;
const target = $<Slidable>('#slide-target')!;
let slideBorder: SlideBorder = [0, 0, 0, 0];

function updatePosition(x: number, y: number) {
	$apply(target, {
		style: {
			left: Number.isNaN(x) ? '50%' : clamp(slideBorder[0], x, slideBorder[1]),
			top: Number.isNaN(y) ? '50%' : clamp(slideBorder[2], y, slideBorder[3]),
		},
	});
}

events.slide.on(target, (event) => {
	console.log(event);
	updatePosition(event.x, event.y);
});

function updateSlideBorder() {
	const { top, left, right, bottom } = container.getBoundingClientRect();
	const { width, height } = target.getBoundingClientRect();
	const w = width / 2;
	const h = height / 2;
	slideBorder = [left + w, right - w, top + h, bottom - h];
	target.slideBorder = slideBorder;
	updatePosition(parseFloat(target.style.left), parseFloat(target.style.top));
}

window.addEventListener('resize', updateSlideBorder);

updateSlideBorder();
