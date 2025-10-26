import { EventEmitter } from 'node:events';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { type FSWatcher, watch } from 'chokidar';
import pug from 'pug';
import { here } from '../fs';
import { Logger } from '../logger';
import { escapeHTML, setupWatcher, stringify } from '../utils';

const FALLBACK_REASON = {
	UNINITIALIZED: 'The template has not been initialized.',
	NOT_FOUND: 'Template file not found.',
	COMPILE_FAILED: 'Failed to compile template.',
} as const;
const ERROR = {
	FILE: 'Template file not found.',
	COMPILE: 'Failed to compile template.',
	RENDER: 'Failed to render.',
} as const;

const logger = new Logger('render/pug');
const cache = new Map<string, PugRenderer>();

const PATTERN_SEP = /[\\/]+/g;
function normalizeLayout(layout: string): string {
	layout = layout.replace(PATTERN_SEP, '/');
	layout = layout.slice(
		layout[0] === '/' ? 1 : 0,
		layout.at(-1) === '/' ? -1 : undefined,
	);
	return layout;
}

function createFallbackTemplate(
	layout: string,
	path: string,
	reason: string = FALLBACK_REASON.UNINITIALIZED,
	extraInfo?: string,
): pug.compileTemplate {
	return (locales) => `<!DOCTYPE HTML>
			<html>
				<head></head>
				<body>
					<p>${escapeHTML(reason)}</p>
					${extraInfo ? `<pre><code>${escapeHTML(extraInfo)}</code></pre>` : ''}
					<p>
						Layout: <code>${escapeHTML(layout)}</code><br>
						Path: <code>${escapeHTML(path)}</code>
					</p>
					<pre><code>${escapeHTML(stringify(locales))}</code></pre>
				</body>
			</html>`;
}

/** Pug 渲染器 */
export class PugRenderer extends EventEmitter<{ update: [] }> {
	/** 根据 layout 获取 pug 渲染器 */
	static getRenderer(layout: string): PugRenderer {
		if (!path.isAbsolute(layout)) layout = normalizeLayout(layout);
		let renderer = cache.get(layout);
		if (renderer) return renderer;
		renderer = new PugRenderer(layout);
		cache.set(layout, renderer);
		return renderer;
	}
	#layout: string;
	#path: string;
	#watcher: FSWatcher;
	#template: pug.compileTemplate;
	#dependencies: string[] = [];
	#initialized = false;
	private constructor(layout: string) {
		super();
		this.#layout = layout;
		this.#path = path.isAbsolute(layout)
			? layout
			: here('layouts', `${layout}.pug`);
		this.#watcher = watch(this.#path, {
			awaitWriteFinish: true,
			ignoreInitial: true,
		});
		this.#template = createFallbackTemplate(this.#layout, this.#path);
		setupWatcher(this.#watcher, () => {
			this.#reload();
			super.emit('update');
		});
	}
	#reload() {
		this.#initialized = true;
		if (!existsSync(this.#path)) {
			this.#template = createFallbackTemplate(
				this.#layout,
				this.#path,
				FALLBACK_REASON.NOT_FOUND,
			);
			logger.err(ERROR.FILE, this.#layout, this.#path);
			return;
		}
		try {
			this.#template = pug.compileFile(this.#path);
		} catch (error) {
			this.#template = createFallbackTemplate(
				this.#layout,
				this.#path,
				FALLBACK_REASON.COMPILE_FAILED,
				stringify(error),
			);
			logger.err(ERROR.COMPILE, this.#layout, this.#path, error);
			return;
		}
		const oldDeps = new Set(this.#dependencies);
		let deps: string[] = [];
		if (
			'dependencies' in this.#template &&
			Array.isArray(this.#template.dependencies)
		) {
			deps = this.#template.dependencies;
		}
		for (const dep of deps) {
			if (oldDeps.has(dep)) {
				oldDeps.delete(dep);
				continue;
			}
			this.#watcher.add(dep);
		}
		for (const dep of oldDeps) {
			this.#watcher.unwatch(dep);
		}
		this.#dependencies = deps;
	}
	render(options?: pug.LocalsObject): string {
		if (!this.#initialized) this.#reload();
		try {
			return this.#template(options);
		} catch (error) {
			logger.err(ERROR.RENDER, this.#layout, this.#path, error);
			return stringify(error);
		}
	}
	static async destroyAll() {
		await Promise.all(
			[...cache.values()].map((renderer) => renderer.#watcher.close()),
		);
	}
}
