import {
	Dialog,
	events,
	type Navigable,
	tooltips,
	type WidgetBtn,
	type WidgetCheckbox,
	type WidgetList,
	WidgetListItem,
} from 'abm-ui';
import { $, $div, $new, Debounce } from 'abm-utils';
import { css } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { IconInfo, Project, ProjectInfo } from '../types';
import {
	compileAllIconForProject,
	compileProject,
	createProject,
	getProject,
	getProjects,
	removeProject,
	renameProject,
	writeProject,
} from './api';
import { selectIcon } from './detail';
import { createIcon } from './icon';

@customElement('project-item')
class ProjectListItem extends WidgetListItem<ProjectInfo> implements Navigable {
	static styles = css`
		:host(.project-active) {
			background: var(--theme-a4);
		}
		:host {
			display: flex;
			gap: 4px;
			padding: 2px 8px;
		}
		.project-name {
			flex: 1;
			padding: 0 8px;
			display: flex;
			align-items: center;
			border-radius: 4px;
			transition: .1s background;
		}
		.project-name[ui-hover] {
			background: var(--w-btn-hover-bg);
		}
		.project-name[ui-active] {
			background: var(--w-btn-active-bg);
		}
	`;
	#main: HTMLDivElement & Navigable = $div({
		class: 'project-name',
		attr: { 'ui-nav': '' },
	});
	#rename = $new<WidgetBtn & Navigable, {}>('w-btn', {
		prop: { icon: 'Rename' },
	});
	#delete = $new<WidgetBtn & Navigable, {}>('w-btn', {
		prop: { icon: 'Delete' },
	});
	#info!: ProjectInfo;
	constructor() {
		super({ navGroup: true });
		this.activeTrigger = this.#main;
		events.hover.add(this.#main);
		this.#main.navParent = this;
		this.#delete.navParent = this;
		this.#rename.navParent = this;
		this.#rename.on('active', () => askRenameProject(this.#info));
		this.#delete.on('active', () => deleteProject(this.#info.path));
	}
	get data() {
		return this.#info;
	}
	set data(value) {
		this.#info = value;
		this.#main.textContent = value.name;
		tooltips.set(this.#main, value.path);
	}
	static create(data: ProjectInfo): ProjectListItem {
		const item = $new<ProjectListItem, {}>('project-item');
		item.data = data;
		return item;
	}
	protected render() {
		this.classList.toggle('project-active', this.#info.path === projectPath);
		return [this.#main, this.#rename, this.#delete];
	}
	protected active(): void {
		for (const item of this.parentNode!.children) {
			item.classList.remove('project-active');
		}
		this.classList.add('project-active');
		loadProject(this.#info.path);
	}
	get navChildren() {
		return [this.#main, this.#rename, this.#delete];
	}
}

@customElement('project-icon')
class ProjectIcon extends WidgetListItem<IconInfo> implements Navigable {
	static styles = css`
		:host {
			display: flex;
			align-items: center;
			gap: 4px;
			padding: 4px 0;
		}
		.id {
			flex: 1 1 0%;
			width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
		}
		.icon {
			height: 24px;
			width: 24px;
			display: block;
		}
		@media (prefers-color-scheme: dark) {
			.icon {
				filter: invert(1);
			}
		}
	`;
	info!: IconInfo;
	#icon = $div();
	#id = $div({ class: 'id' });
	#copy = $new<WidgetBtn, {}>('w-btn', { prop: { content: { icon: 'Copy' } } });
	#del = $new<WidgetBtn, {}>('w-btn', { prop: { content: { icon: 'Delete' } } });
	constructor() {
		super();
		this.activeTrigger = this.#id;
		events.hover.add(this.#id);
		this.#copy.on('active', () => {
			navigator.clipboard.writeText(this.info.id);
		});
		this.#del.on('active', () => removeIcon(this.info));
	}
	get data() {
		return this.info;
	}
	set data(value) {
		this.info = value;
		this.#icon.replaceChildren(createIcon(value));
		this.#id.textContent = value.id;
	}
	protected active() {
		selectIcon(this.info);
	}
	protected render() {
		return [this.#icon, this.#id, this.#copy, this.#del];
	}
	static create(data: IconInfo) {
		const item = $new('project-icon') as ProjectIcon;
		item.data = data;
		return item;
	}
}

let list: WidgetList<ProjectInfo, ProjectListItem>;
let projectPath: string = undefined as any;
let iconList: WidgetList<IconInfo, ProjectIcon>;
let currentProject: Project;
let includeDefaults: WidgetCheckbox;

async function updateList() {
	const result = await getProjects();
	if (result instanceof Error) {
		Dialog.alert({ title: 'error', content: result.message });
		return;
	}
	list.items = result;
}

async function addProject() {
	const nameInput = $new('w-text');
	const pathInput = $new('w-text');
	const distInput = $new('w-text');
	const includeDefaults = $new('w-checkbox');
	const promise = Dialog.confirm({
		title: 'create-project',
		content: [
			$new('w-lang', 'project-name'),
			nameInput,
			$new('w-lang', 'project-path'),
			pathInput,
			$new('w-lang', 'project-dist'),
			distInput,
			$div(
				{ attr: { 'ui-layout': 'flow' } },
				includeDefaults,
				$new('w-lang', 'include-with-defaults'),
			),
		],
		actions: [
			{
				...Dialog.ACTION_CONFIRM,
				disabled: true,
			},
		],
	});
	const check = () => {
		promise.dialog.actions[0].disabled = !(
			pathInput.value.length > 0 && distInput.value.length > 0
		);
	};
	pathInput.on('input', check);
	distInput.on('input', check);

	if (!(await promise)) return;
	const result = await createProject({
		name: nameInput.value,
		path: pathInput.value,
		dist: distInput.value,
		includeDefaults: includeDefaults.checked,
	});
	if (result instanceof Error) {
		Dialog.alert({
			title: 'error',
			content: result.message,
		});
		return;
	}
	if (typeof result === 'string') {
		Dialog.alert({
			title: 'error',
			content: result,
		});
		return;
	}
	return updateList();
}

async function askRenameProject(info: ProjectInfo) {
	const nameInput = $new('w-text');
	nameInput.value = info.name;
	const confirm = Dialog.confirm({
		title: 'rename-project',
		content: [$div(info.path), nameInput],
	});
	if (!confirm) return;
	await renameProject(info.path, nameInput.value);
	updateList();
}

async function deleteProject(path: string) {
	const dialog = new Dialog({
		title: 'delete-project',
		content: path,
		actions: [
			{
				...Dialog.ACTION_DANGER_CONFIRM,
				id: 'project-only',
				key: 'delete-project-only',
			},
			{
				...Dialog.ACTION_DANGER_CONFIRM,
				id: 'project-with-data',
				key: 'delete-project-data',
			},
			Dialog.ACTION_CANCEL,
		],
		autoHide: true,
	});
	dialog.show();
	const choose = await dialog.waitForAction();
	if (choose === 'cancel') return;
	await removeProject(path, choose === 'project-with-data');
	updateList();
}

async function loadProject(path: string) {
	const project = await getProject(path);
	if (project instanceof Error) return;
	projectPath = path;
	currentProject = project;
	includeDefaults.checked = project.includeDefaults;
	iconList.items = [...currentProject.icons.values()];
}

const saveProject = Debounce.new(async () => {
	const err = await writeProject(projectPath, currentProject);
	if (!err) return;
	Dialog.alert({
		title: 'error',
		content: err.message,
		autoHide: true,
	});
}, 500);

export function addInProject(icon: IconInfo) {
	if (currentProject.icons.has(icon.file)) return;
	currentProject.icons.set(icon.file, icon);
	iconList.items.push(icon);
	saveProject();
}

function removeIcon(icon: IconInfo) {
	if (!currentProject.icons.has(icon.file)) return;
	currentProject.icons.delete(icon.file);
	iconList.items = [...currentProject.icons.values()];
	saveProject();
}

function compileStartMsg(error?: Error | any) {
	Dialog.alert({
		title: error ? 'error' : 'compile-project',
		content: error ? error.message : $new('w-lang', 'compile-started'),
		autoHide: true,
	});
}

export function initProject() {
	list = $('.project-list')!;
	list.itemClass = ProjectListItem;
	updateList();
	$<WidgetBtn>('.project-add')?.on('active', addProject);

	iconList = $('.project-current')!;
	iconList.itemClass = ProjectIcon;

	includeDefaults = $('#compile-include-defaults')!;
	includeDefaults.on('change', () => {
		currentProject.includeDefaults = includeDefaults.checked;
		saveProject();
	});

	const compileBtn = $<WidgetBtn>('#compile-project')!;
	const compileAllBtn = $<WidgetBtn>('#compile-all')!;
	compileBtn.delay = 500;
	compileAllBtn.delay = 1000;
	compileBtn.on('active', async () => {
		const result = await compileProject(projectPath);
		compileStartMsg(result);
	});
	compileAllBtn.on('active', async () => {
		if (
			!(await Dialog.confirm({
				title: 'compile-all',
				content: $new('w-lang', 'compile-all-warning'),
				actions: [Dialog.ACTION_DANGER_CONFIRM],
			}))
		)
			return;
		const result = await compileAllIconForProject(projectPath);
		compileStartMsg(result);
	});
}
