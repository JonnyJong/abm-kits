import { existsSync } from 'node:fs';
import { readFile, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Project, ProjectInfo, ProjectInit } from '../types';
import { PROJECT_LIST } from './path';

const INTERNAL_PROJECTS: ProjectInfo[] = [
	{
		name: '@abm-kits/example',
		path: path.join(__dirname, '../../example'),
	},
	{
		name: '@abm-kits/icons',
		path: path.join(__dirname, '../../icons'),
	},
];

async function getUserProjects(): Promise<ProjectInfo[]> {
	try {
		return JSON.parse(await readFile(PROJECT_LIST, 'utf8'));
	} catch (error) {
		console.error(error);
		return [];
	}
}

export async function getProjects(): Promise<ProjectInfo[]> {
	return [...INTERNAL_PROJECTS, ...(await getUserProjects())];
}

export async function createProject(
	options: ProjectInit,
): Promise<string | boolean> {
	if (!(options.path.length > 0 || options.dist.length > 0)) {
		return 'No path and dist';
	}
	if (!path.isAbsolute(options.path)) return 'Absolute path required';
	const projects: ProjectInfo[] = await getUserProjects();
	const existProject = [...INTERNAL_PROJECTS, ...projects].find(
		(project) => project.path === options.path,
	);
	if (existProject)
		return `Existence of project "${existProject.name}" with the same path`;
	if (!existsSync(options.path))
		return `No directory with path "${options.path}" exists`;
	if (!(await stat(options.path)).isDirectory())
		return 'Cannot create a project because the path is not in a directory';

	let dist = options.dist;
	if (path.isAbsolute(dist)) {
		dist = path.relative(options.path, dist);
	}
	if (path.isAbsolute(dist) || dist.startsWith('.'))
		return 'The dist directory must be a subdirectory of the project directory';
	dist = dist.replaceAll('\\', '/');

	projects.push({ name: options.name, path: options.path });
	await writeFile(
		PROJECT_LIST,
		JSON.stringify(projects, undefined, '\t'),
		'utf8',
	);

	const projectDataPath = path.join(options.path, 'icons.json');
	if (existsSync(projectDataPath)) return true;
	await writeFile(
		projectDataPath,
		JSON.stringify({
			icons: [],
			includeDefaults: options.includeDefaults,
			dist,
		}),
		'utf8',
	);
	return false;
}

export async function getProject(projectPath: string): Promise<Project> {
	try {
		const data = JSON.parse(
			await readFile(path.join(projectPath, 'icons.json'), 'utf8'),
		);
		data.icons = new Map(data.icons);
		return data;
	} catch (error) {
		console.warn(`Failed to read project ${projectPath}`);
		console.error(error);
		return {
			icons: new Map(),
			includeDefaults: true,
			dist: 'assets',
		};
	}
}

export async function writeProject(
	projectPath: string,
	project: Project,
): Promise<undefined> {
	await writeFile(
		path.join(projectPath, 'icons.json'),
		JSON.stringify({
			...project,
			icons: [...project.icons],
		}),
		'utf8',
	);
}

export async function renameProject(
	projectPath: string,
	name: string,
): Promise<string | null> {
	const projects: ProjectInfo[] = await getUserProjects();
	const project = projects.find((project) => project.path === projectPath);
	if (!project) return 'Project not found';
	project.name = name;

	await writeFile(
		PROJECT_LIST,
		JSON.stringify(projects, undefined, '\t'),
		'utf8',
	);

	return null;
}

export async function removeProject(
	projectPath: string,
	deleteData?: boolean,
): Promise<string | null> {
	const projects: ProjectInfo[] = await getUserProjects();
	const index = projects.findIndex((project) => project.path === projectPath);
	if (index === -1) return 'Project not found';

	projects.splice(index, 1);
	await writeFile(
		PROJECT_LIST,
		JSON.stringify(projects, undefined, '\t'),
		'utf8',
	);

	if (!deleteData) return null;

	const projectDataPath = path.join(projectPath, 'icons.json');
	if (!existsSync(projectDataPath)) return null;
	await unlink(projectDataPath);

	return null;
}
