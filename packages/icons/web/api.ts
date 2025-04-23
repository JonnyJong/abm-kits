import { Bridge } from 'scc/dist/browser';
import { APIMap, Project, ProjectInit, QueryOptions } from '../types';

let bridge: Bridge<APIMap>;

export function initAPI() {
	bridge = new Bridge('http://127.0.0.1:5504');
}

export function getProjects() {
	return bridge.invoke('getProjects');
}

export function createProject(options: ProjectInit) {
	return bridge.invoke('createProject', options);
}

export function getProject(projectPath: string) {
	return bridge.invoke('getProject', projectPath);
}

export function writeProject(projectPath: string, project: Project) {
	return bridge.invoke('writeProject', projectPath, project);
}

export function renameProject(projectPath: string, name: string) {
	return bridge.invoke('renameProject', projectPath, name);
}

export function removeProject(projectPath: string, deleteData?: boolean) {
	return bridge.invoke('removeProject', projectPath, deleteData);
}

export function queryIcon(options: QueryOptions = {}) {
	return bridge.invoke('queryIcon', options);
}

export function getIcon(name: string) {
	return bridge.invoke('getIcon', name);
}

export function getValues() {
	return bridge.invoke('getValues');
}

export function compileProject(name: string) {
	return bridge.invoke('compileProject', name);
}

export function compileAllIconForProject(name: string) {
	return bridge.invoke('compileAllIconForProject', name);
}
