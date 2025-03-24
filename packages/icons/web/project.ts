import {
	events,
	Dialog,
	Navigable,
	WidgetBtn,
	WidgetList,
	WidgetListItem,
	WidgetSelect,
} from 'abm-ui';
import { $, $div, $new, Debounce } from 'abm-utils';
import { css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { IconInfo, Icons } from '../types';
import {
	compileAllIconForProject,
	compileProject,
	createProject,
	deleteProject,
	getProject,
	getProjects,
	listAvailableProjects,
	writeProject,
} from './api';
import { selectIcon } from './detail';
import { createIcon } from './icon';

@customElement('project-item')
class Project extends WidgetListItem<string> implements Navigable {
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
	#delete = $new<WidgetBtn & Navigable>('w-btn', {
		prop: { content: { icon: 'Delete' } },
	});
	#name!: string;
	constructor() {
		super();
		this.activeTrigger = this.#main;
		events.hover.add(this.#main);
		this.#main.navParent = this;
		this.#delete.navParent = this;
		this.#delete.on('active', () => removeProject(this.#name));
	}
	connectedCallback(): void {
		super.connectedCallback();
		this.toggleAttribute('ui-nav-group', true);
	}
	get data() {
		return this.#name;
	}
	set data(value) {
		this.#name = value;
		this.#main.textContent = value;
	}
	static create(data: string): Project {
		const item = $new<Project>('project-item');
		item.data = data;
		return item;
	}
	protected render() {
		this.classList.toggle('project-active', this.#name === projectName);
		return [this.#main, this.#delete];
	}
	protected active(): void {
		[...this.parentNode!.children].forEach((item) =>
			item.classList.remove('project-active'),
		);
		this.classList.add('project-active');
		loadProject(this.data);
	}
	get navChildren() {
		return [this.#main, this.#delete];
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
	#copy = $new('w-btn', { prop: { content: { icon: 'Copy' } } });
	#del = $new('w-btn', { prop: { content: { icon: 'Delete' } } });
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

let list: WidgetList<string, Project>;
let projectName: string = undefined as any;
let iconList: WidgetList<IconInfo, ProjectIcon>;
let icons: Icons;

async function updateList() {
	const result = await getProjects();
	if (result instanceof Error) {
		Dialog.ok({ title: 'error', content: result.message, autoHide: true });
		return;
	}
	list.items = result;
}

async function addProject() {
	const projects = await listAvailableProjects();
	if (projects instanceof Error) {
		Dialog.ok({ title: 'error', content: projects.message, autoHide: true });
		return;
	}
	if (projects.length === 0) {
		return Dialog.ok({
			title: 'error',
			content: 'No projects available',
			autoHide: true,
		});
	}
	const selector = $new<WidgetSelect<string>>('w-select');
	selector.options = projects.map((name) => {
		return { value: name, label: name };
	});
	selector.value = projects[0];
	selector.style.width = '100%';
	if (
		!(await Dialog.confirm({
			title: 'add-project',
			content: selector,
			autoHide: true,
		}))
	)
		return;
	const result = await createProject(selector.value);
	if (result instanceof Error) {
		Dialog.ok({
			title: 'error',
			content: result.message,
			autoHide: true,
		});
	}
	if (result) updateList();
}

async function removeProject(name: string) {
	const confirm = await Dialog.confirm({
		title: 'delete-project',
		content: name,
		actions: [Dialog.ACTION_DANGER_CONFIRM],
		autoHide: true,
	});
	if (!confirm) return;
	await deleteProject(name);
	updateList();
}

async function loadProject(name: string) {
	const result = await getProject(name);
	if (result instanceof Error) return;
	projectName = name;
	icons = result;
	iconList.items = [...icons.values()];
}

const saveProject = Debounce.new(async () => {
	const err = await writeProject(projectName, icons);
	if (!err) return;
	Dialog.ok({
		title: 'error',
		content: err.message,
		autoHide: true,
	});
}, 500);

export function addInProject(icon: IconInfo) {
	if (icons.has(icon.file)) return;
	icons.set(icon.file, icon);
	iconList.items.push(icon);
	saveProject();
}

function removeIcon(icon: IconInfo) {
	if (!icons.has(icon.file)) return;
	icons.delete(icon.file);
	iconList.items = [...icons.values()];
	saveProject();
}

function compileStartMsg(error?: Error | any) {
	Dialog.ok({
		title: error ? 'error' : 'compile-project',
		content: error ? error.message : $new('w-lang', 'compile-started'),
		autoHide: true,
	});
}

export function initProject() {
	list = $('.project-list')!;
	list.itemClass = Project;
	updateList();
	$<WidgetBtn>('.project-add')?.on('active', addProject);

	iconList = $('.project-current')!;
	iconList.itemClass = ProjectIcon;

	const compileBtn = $<WidgetBtn>('#compile-project')!;
	const compileAllBtn = $<WidgetBtn>('#compile-all')!;
	compileBtn.delay = 500;
	compileAllBtn.delay = 1000;
	compileBtn.on('active', async () => {
		const result = await compileProject(projectName);
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
		const result = await compileAllIconForProject(projectName);
		compileStartMsg(result);
	});
}
