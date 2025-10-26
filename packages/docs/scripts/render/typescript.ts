import EventEmitter from 'node:events';
import path from 'node:path';
import { FSWatcher } from 'chokidar';
import * as rolldown from 'rolldown';
import { Logger } from '../logger';
import { setupWatcher } from '../utils';

const logger = new Logger('render/typescript');

function defaultExternal(id: string) {
	return !(id[0] === '.' || path.isAbsolute(id));
}

const PATTERN_IMPORT = /(?<=^|\n)import(.*?)from "([^"]+)";(?=$|\n)/g;
const PATTERN_MOD = /[@\-_/.]+/g;

function normalizeModName(mod: string): string {
	return `__${mod.replace(PATTERN_MOD, '_')}`.toUpperCase();
}

export class TypeScriptRenderer extends EventEmitter<{ update: [string[]] }> {
	#external: (id: string) => boolean;
	#watcher = new FSWatcher({ awaitWriteFinish: true, ignoreInitial: true });
	#deps = new Map<string, string[]>();
	#depsCounter = new Map<string, number>();
	constructor(external: (id: string) => boolean = defaultExternal) {
		super();
		this.#external = external;
		setupWatcher(this.#watcher, (path) => this.#update(path));
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
		deps = deps.filter((dep) => path.isAbsolute(dep));
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
	async render(filepath: string): Promise<[code: string, map: string] | null> {
		// Compile
		let compiled: rolldown.OutputChunk;
		try {
			const built = await rolldown.rolldown({
				input: filepath,
				external: this.#external,
			});
			const result = await built.generate({ format: 'es', sourcemap: true });
			compiled = result.output[0];
		} catch (error) {
			logger.err('Error when compiling typescript.', filepath, error);
			return null;
		}
		// Trace
		this.#trace(filepath, compiled.moduleIds);
		// Transform
		const code = compiled.code.replace(
			PATTERN_IMPORT,
			(origin, code: string, mod: string) => {
				code = code.trim();
				mod = normalizeModName(mod);
				if (code[0] === '{' && code.at(-1) === '}')
					return `const ${code} = globalThis.${mod};`;
				if (!code.startsWith('* as ')) return origin;
				return `const ${code.slice(5).trimStart()} = ${mod}`;
			},
		);
		return [code, compiled.map?.toString() ?? ''];
	}
	destroy() {
		return this.#watcher.close();
	}
}
