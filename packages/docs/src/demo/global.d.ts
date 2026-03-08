type ControlProp =
	| 'boolean'
	| 'string'
	| 'number'
	| any[]
	| {
			type: 'number';
			min?: number;
			max?: number;
			step?: number;
			default?: number;
	  }
	| 'color'
	| {
			type: 'string';
			preset?: string[];
	  };

interface ControlRegisterOptions {
	events?: string[];
	props?: Record<string, ControlProp>;
	actions?: Record<string, () => any>;
}

declare global {
	let body: HTMLElement;
	function __registerControl(control: HTMLElement, options: ControlRegisterOptions): void;
}

export {};
