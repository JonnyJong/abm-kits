import { $new } from 'abm-utils';
import type { IconInfo } from '../types';

const observer = new IntersectionObserver((entries) => {
	entries.forEach((entry) => {
		(entry.target as HTMLElement).style.visibility = entry.isIntersecting
			? 'visible'
			: 'hidden';
	});
});

export function createIcon(info: IconInfo) {
	const img = $new<HTMLImageElement & { info: IconInfo }, {}>('img', {
		class: 'icon',
		attr: {
			src: `node_modules/@fluentui/svg-icons/icons/${info.file}`,
			loading: 'lazy',
			draggable: 'false',
		},
	});
	img.info = info;
	observer.observe(img);
	return img;
	// const icon = $div({ class: ['icon', `icon-${id}`], data: { id } });
	// return icon;
}
