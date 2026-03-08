import { createReadStream } from 'node:fs';
import { type FSWatcher, watch } from 'chokidar';
import { Logger, type PromiseOr, VirtualAssets } from 'ezal';
import type { DependencyUpdateInfo } from 'ezal/dist/items/dependent';
import type { RouteContent } from 'ezal/dist/route';

const logger = new Logger('assets');

export class ProxyAsset extends VirtualAssets {
	#src: string;
	#watcher: FSWatcher;
	constructor(url: string, src: string) {
		super(url);
		this.#src = src;
		this.#watcher = watch(src, { awaitWriteFinish: true, ignoreInitial: true });
		this.#watcher.on('all', (event, path) => {
			logger.log({ event, path });
			this.invalidated();
		});
	}
	build(): PromiseOr<RouteContent> {
		return createReadStream(this.#src);
	}
	protected onDependenciesChanged(updates: DependencyUpdateInfo[]) {
		logger.log(updates);
	}
	destroy(): void {
		super.destroy();
		this.#watcher.close();
	}
}

export function initProxyAssets(assets: Record<string, string>) {
	for (const [url, src] of Object.entries(assets)) {
		new ProxyAsset(url, src);
	}
}
