import { existsSync } from 'node:fs';
import { readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Entity, PrimaryColumn } from 'typeorm';
import { Icons } from '../types';
import { getDB } from './db';
import { PROJECT_ROOT } from './path';

@Entity()
export class Project {
	@PrimaryColumn()
	name!: string;
}

export function getProjects() {
	return getDB()
		.getRepository(Project)
		.find()
		.then((projects) => projects.map(({ name }) => name));
}

export async function createProject(name: string): Promise<boolean> {
	const projects = getDB().getRepository(Project);
	if (await projects.findOne({ where: { name } })) return false;
	await projects.insert({ name });
	return true;
}

export async function getProject(name: string): Promise<Icons> {
	const file = path.join(PROJECT_ROOT, name, 'icons.json');
	if (!existsSync(file)) return new Map();
	try {
		const data = await readFile(file, 'utf8');
		return new Map(JSON.parse(data));
	} catch (error) {
		console.warn(`Failed to read project ${name}`);
		console.error(error);
		return new Map();
	}
}

export function writeProject(name: string, icons: Icons) {
	return writeFile(
		path.join(PROJECT_ROOT, name, 'icons.json'),
		JSON.stringify([...icons.entries()]),
		'utf8',
	);
}

export async function deleteProject(name: string) {
	const file = path.join(PROJECT_ROOT, name, 'icons.json');
	if (existsSync(file)) await unlink(file);
	await getDB().getRepository(Project).delete({ name });
}

export async function listAvailableProjects() {
	const existing = await getProjects();
	return (await readdir(PROJECT_ROOT, { withFileTypes: true }))
		.filter((dirent) => dirent.isDirectory() && !existing.includes(dirent.name))
		.map((dirent) => dirent.name);
}
