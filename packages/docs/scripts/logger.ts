export class Logger {
	#mod: string;
	constructor(mod: string) {
		this.#mod = mod;
	}
	log(...data: any) {
		console.log(`\x1B[46m ${this.#mod} \x1B[0m`, ...data);
	}
	warn(...data: any) {
		console.warn(`\x1B[43m ${this.#mod} \x1B[0m `, ...data);
	}
	err(...data: any) {
		console.error(`\x1B[41m ${this.#mod} \x1B[0m`, ...data);
		if (Logger.stopWhenError) process.exit(1);
	}
	static stopWhenError = false;
}
