import { VirtualPage } from 'ezal';

export function initDemoPage() {
	new VirtualPage({ id: 'demo', src: '/demo.html', layout: 'demo' });
}
