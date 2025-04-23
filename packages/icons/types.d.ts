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

export interface Project {
	dist: string;
	icons: Icons;
	includeDefaults: boolean;
}

export interface ProjectInfo {
	name: string;
	path: string;
}

export interface ProjectInit {
	name: string;
	path: string;
	dist: string;
	includeDefaults: boolean;
}

export interface APIMap extends ProtocolMap {
	getProjects: {
		args: [];
		result: ProjectInfo[];
	};
	createProject: {
		args: [ProjectInit];
		result: string | boolean;
	};
	getProject: {
		args: [string];
		result: Project;
	};
	writeProject: {
		args: [string, Project];
		// biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
		result: void;
	};
	renameProject: {
		args: [string, string];
		result: string | null;
	};
	removeProject: {
		args: [string, boolean?];
		result: string | null;
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
