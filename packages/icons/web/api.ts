import { Bridge } from 'scc/dist/browser';
import { APIMap, Icons, QueryOptions } from '../types';

let bridge: Bridge<APIMap>;

export function initAPI() {
	bridge = new Bridge('http://127.0.0.1:5504');
}

export function getProjects() {
	return bridge.invoke('getProjects');
}

export function createProject(name: string) {
	return bridge.invoke('createProject', name);
}

export function getProject(name: string) {
	return bridge.invoke('getProject', name);
}

export function writeProject(name: string, icons: Icons) {
	return bridge.invoke('writeProject', name, icons);
}

export function deleteProject(name: string) {
	return bridge.invoke('deleteProject', name);
}

export function listAvailableProjects() {
	return bridge.invoke('listAvailableProjects');
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
