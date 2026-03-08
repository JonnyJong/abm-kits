import { VirtualPage } from 'ezal';

export function init404Page() {
	new VirtualPage({ id: '404', src: '/404.html', layout: '404' });
}
