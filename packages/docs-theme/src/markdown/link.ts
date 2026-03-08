import { LinkNode, plugins } from 'ezal-markdown';

const raw = plugins.emphasisAndLink();

export const link: typeof raw = {
	...raw,
	render(node, context) {
		if (node instanceof LinkNode) {
			let newDestination: string | null = null;
			if (node.destination.startsWith('..')) {
				newDestination = `../${node.destination}`;
			} else if (node.destination[0] === '.') {
				newDestination = `.${node.destination}`;
			}
			if (newDestination) {
				Object.defineProperty(node, 'destination', {
					get: () => newDestination,
				});
			}
		}
		return raw.render(node, context);
	},
};
