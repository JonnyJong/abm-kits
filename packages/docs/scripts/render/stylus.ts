import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { FSWatcher } from 'chokidar';
import stylus from 'stylus';
import { Logger } from '../logger';

const ERROR = {
	FILE: 'Could not read stylus file',
	COMPILE: 'Failed to compile stylus file.',
	RENDER: 'Failed to render stylus file.',
};

const logger = new Logger('render/stylus');

/** Stylus 渲染器 */
export class StylusRenderer extends EventEmitter<{
	update: [files: string[]];
}> {
	#watcher = new FSWatcher();
	#deps = new Map<string, string[]>();
	#depsCounter = new Map<string, number>();
	constructor() {
		super();
		this.#watcher.once('ready', () => {
			this.#watcher.on('all', (_, path) => this.#update(path));
		});
	}
	isTracing(filepath: string) {
		return this.#deps.has(filepath);
	}
	#addTrace(dep: string) {
		const count = this.#depsCounter.get(dep);
		if (count) {
			this.#depsCounter.set(dep, count + 1);
			return;
		}
		this.#depsCounter.set(dep, 1);
		this.#watcher.add(dep);
	}
	#rmTrace(dep: string) {
		let count = this.#depsCounter.get(dep);
		if (!count) return;
		count--;
		if (count) {
			this.#depsCounter.set(dep, count);
			return;
		}
		this.#depsCounter.delete(dep);
		this.#watcher.unwatch(dep);
	}
	#trace(filepath: string, deps: string[]) {
		const oldDeps = new Set(this.#deps.get(filepath) ?? []);
		for (const dep of deps) {
			if (oldDeps.has(dep)) {
				oldDeps.delete(dep);
				continue;
			}
			this.#addTrace(dep);
		}
		for (const dep of oldDeps) {
			this.#rmTrace(dep);
		}
		if (!this.#deps.has(filepath)) this.#watcher.add(filepath);
		this.#deps.set(filepath, deps);
	}
	#update(filepath: string) {
		const updated: string[] = [];
		for (const [entry, deps] of this.#deps) {
			if (entry === filepath || deps.includes(filepath)) {
				updated.push(entry);
			}
		}
		super.emit('update', updated);
	}
	render(filepath: string): string {
		let content: string;
		try {
			content = readFileSync(filepath, 'utf8');
		} catch (error) {
			logger.err(ERROR.FILE, filepath, error);
			return '';
		}
		let style: ReturnType<typeof stylus>;
		try {
			style = stylus(content, {
				paths: [path.join(filepath, '..')],
				filename: path.basename(filepath),
				// Bundle css inside
				'include css': true,
			} as any);
		} catch (error) {
			logger.err(ERROR.COMPILE, filepath, error);
			return '';
		}
		this.#trace(filepath, style.deps());
		try {
			return style.render();
		} catch (error) {
			logger.err(ERROR.RENDER, filepath, error);
			return '';
		}
	}
	destroy() {
		return this.#watcher.close();
	}
}
