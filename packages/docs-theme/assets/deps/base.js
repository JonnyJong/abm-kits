const PATTERN_ESC = /\W/g;
const mods = new Map();

globalThis.__reg = (name, mod) => {
	if (mods.has(name)) throw new Error('Duplicate registration of module');
	mods.set(name, mod);
	globalThis[`__${name.replace(PATTERN_ESC, '_')}`.toUpperCase()] = mod;
};
globalThis.require = (mod) => {
	if (!mods.has(mod))
		throw new Error(`The requested module "${mod}" does not exist`);
	return mods.get(mod);
};
