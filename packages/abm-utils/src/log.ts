import { run } from './function';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface Log<Level extends LogLevel = LogLevel> {
	mod: string;
	level: Level;
	time: number;
	message: string;
	errObj?: Error;
}

const LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];

class Logging {
	#consoleOutputLevel = 2;
	get consoleOutputLevel() {
		return LEVELS[this.#consoleOutputLevel];
	}
	set consoleOutputLevel(value: LogLevel) {
		const level = LEVELS.indexOf(value);
		if (level === -1) {
			this.push({
				mod: 'abm-utils:log',
				level: 'warn',
				time: Date.now(),
				message: 'Invalid console output level',
				errObj: new Error('Invalid console output level', { cause: value }),
			});
			return;
		}
		this.#consoleOutputLevel = level;
	}
	logs: Log[] = [];
	push(log: Log) {
		if (!LEVELS.includes(log.level)) log.level = 'error';
		this.logs.push(log);
		switch (log.level) {
			// @ts-ignore
			// biome-ignore lint/suspicious/noFallthroughSwitchClause: Deliberate
			case 'fatal':
				this.#emit('fatal', log);
			// @ts-ignore
			// biome-ignore lint/suspicious/noFallthroughSwitchClause: Deliberate
			case 'error':
				this.#emit('error', log);
			// @ts-ignore
			// biome-ignore lint/suspicious/noFallthroughSwitchClause: Deliberate
			case 'warn':
				this.#emit('warn', log);
			// @ts-ignore
			// biome-ignore lint/suspicious/noFallthroughSwitchClause: Deliberate
			case 'info':
				this.#emit('info', log);
			case 'debug':
				this.#emit('debug', log);
		}
		const level = LEVELS.indexOf(log.level);
		if (level < this.#consoleOutputLevel) return;
		switch (level) {
			case 4:
			case 3:
				console.error(log);
				return;
			case 2:
				console.warn(log);
				return;
			default:
				console.log(log);
		}
	}
	#subscriptions: {
		[level in LogLevel]: Set<(log: Log) => any>;
	} = {
		debug: new Set(),
		info: new Set(),
		warn: new Set(),
		error: new Set(),
		fatal: new Set(),
	};
	on(handler: (log: Log) => any): void;
	on(handler: (log: Log) => any, level: 'debug'): void;
	// @ts-ignore
	on(
		handler: (log: Log<'info' | 'warn' | 'error' | 'fatal'>) => any,
		level: 'info',
	): void;
	on(
		handler: (log: Log<'warn' | 'error' | 'fatal'>) => any,
		level: 'warn',
	): void;
	on(handler: (log: Log<'error' | 'fatal'>) => any, level: 'error'): void;
	on(handler: (log: Log<'fatal'>) => any, level: 'fatal'): void;
	on(handler: (log: Log) => any, level?: LogLevel): void {
		if (!LEVELS.includes(level!)) level = 'debug';
		this.#subscriptions[level!].add(handler);
	}
	off(handler: (log: Log) => any): void;
	off(handler: (log: Log) => any, level: 'debug'): void;
	// @ts-ignore
	off(
		handler: (log: Log<'info' | 'warn' | 'error' | 'fatal'>) => any,
		level: 'info',
	): void;
	off(
		handler: (log: Log<'warn' | 'error' | 'fatal'>) => any,
		level: 'warn',
	): void;
	off(handler: (log: Log<'error' | 'fatal'>) => any, level: 'error'): void;
	off(handler: (log: Log<'fatal'>) => any, level: 'fatal'): void;
	off(handler: (log: Log) => any, level?: LogLevel): void {
		if (!LEVELS.includes(level!)) level = 'debug';
		this.#subscriptions[level!].delete(handler);
	}
	#emit(level: LogLevel, log: Log) {
		for (const handler of this.#subscriptions[level]) {
			run(handler, log);
		}
	}
}

export const logging = new Logging();

export class Logger {
	#mod: string;
	constructor(mod: string) {
		this.#mod = mod;
	}
	#push(level: LogLevel, message: string, errObj?: Error) {
		logging.push({
			mod: this.#mod,
			level,
			time: Date.now(),
			message,
			errObj,
		});
	}
	debug(errObj: Error): void;
	debug(message: string): void;
	debug(message: string, errObj: Error): void;
	debug(arg0: string | Error, errObj?: Error): void {
		if (arg0 instanceof Error) {
			this.#push('debug', arg0.message, arg0);
			return;
		}
		this.#push('debug', arg0, errObj);
	}
	info(errObj: Error): void;
	info(message: string): void;
	info(message: string, errObj: Error): void;
	info(arg0: string | Error, errObj?: Error): void {
		if (arg0 instanceof Error) {
			this.#push('info', arg0.message, arg0);
			return;
		}
		this.#push('info', arg0, errObj);
	}
	warn(errObj: Error): void;
	warn(message: string): void;
	warn(message: string, errObj: Error): void;
	warn(arg0: string | Error, errObj?: Error): void {
		if (arg0 instanceof Error) {
			this.#push('warn', arg0.message, arg0);
			return;
		}
		this.#push('warn', arg0, errObj);
	}
	error(errObj: Error): void;
	error(message: string): void;
	error(message: string, errObj: Error): void;
	error(arg0: string | Error, errObj?: Error): void {
		if (arg0 instanceof Error) {
			this.#push('error', arg0.message, arg0);
			return;
		}
		this.#push('error', arg0, errObj);
	}
	fatal(errObj: Error): void;
	fatal(message: string): void;
	fatal(message: string, errObj: Error): void;
	fatal(arg0: string | Error, errObj?: Error): void {
		if (arg0 instanceof Error) {
			this.#push('fatal', arg0.message, arg0);
			return;
		}
		this.#push('fatal', arg0, errObj);
	}
}
