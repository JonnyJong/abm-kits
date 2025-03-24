import { ProtocolMap } from 'scc/dist/common.d.ts';

export interface QueryOptions {
	name?: string;
	region?: string;
	type?: string;
	size?: number;
}

export type Icons = Map<string, IconInfo>;

export interface IconInfo {
	id: string;
	name: string;
	region: string;
	type: string;
	size: number;
	file: string;
}

export interface APIMap extends ProtocolMap {
	getProjects: {
		args: [];
		result: string[];
	};
	createProject: {
		args: [string];
		result: boolean;
	};
	getProject: {
		args: [string];
		result: Icons;
	};
	writeProject: {
		args: [string, Icons];
		// biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
		result: void;
	};
	deleteProject: {
		args: [string];
		// biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
		result: void;
	};
	listAvailableProjects: {
		args: [];
		result: string[];
	};
	queryIcon: {
		args: [QueryOptions?];
		result: IconInfo[];
	};
	getValues: {
		args: [];
		result: {
			regions: string[];
			types: string[];
			sizes: number[];
		};
	};
	getIcon: {
		args: [string];
		result: IconInfo[];
	};
	compileProject: {
		args: [string];
		// biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
		result: void;
	};
	compileAllIconForProject: {
		args: [string];
		// biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
		result: void;
	};
}
