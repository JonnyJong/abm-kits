import { Signal } from '@lit-labs/signals';
import {
	$div,
	$new,
	css,
	EventBase,
	type EventBaseInit,
	type EventsList,
} from 'abm-utils';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { events } from '../../../events';
import type { Navigable } from '../../../navigate';
import { tooltips } from '../../tooltips';
import { Widget } from '../base';
import type { WidgetBtn } from '../btn';
import type { WidgetIcon } from '../icon';
import CSS from './index.styl';

export type WidgetFileDisplay = 'row' | 'block';

export interface WidgetFileProp {
	/** 接受的文件类型 */
	accept?: string;
	/** 允许多个文件 */
	multiple?: string;
	/**
	 * 文件展示方式
	 * @description
	 * 允许多个文件时有效
	 * - `row`：按行显示
	 * - `block`：按列显示
	 */
	display?: WidgetFileDisplay;
	/** 预览图像 */
	previewImage?: boolean;
	/** 只读 */
	readonly?: boolean;
}

interface WidgetFileEventsInit {
	/** 输入文件事件 */
	change: EventBaseInit<WidgetFile>;
}

export interface WidgetFileEvents extends EventsList<WidgetFileEventsInit> {}

const DISPLAYS: WidgetFileDisplay[] = ['row', 'block'];

@customElement('w-file')
export class WidgetFile
	extends Widget<WidgetFileEventsInit>
	implements Navigable
{
	static styles = css(CSS);
	#input: HTMLInputElement = $new<HTMLInputElement, {}>('input', {
		prop: {
			type: 'file',
		},
	});
	#files = new Signal.State<readonly File[]>(Object.freeze([]));
	#addFile = false;
	#pickBtn: WidgetBtn & Navigable = $new<WidgetBtn, {}>('w-btn', {
		content: $new<WidgetIcon, {}>('w-icon', { prop: { keyUI: 'pickFile' } }),
		on: { active: () => this.#input.click() },
	});
	#addBtn: WidgetBtn & Navigable = $new<WidgetBtn, {}>('w-btn', {
		content: $new<WidgetIcon, {}>('w-icon', { prop: { keyUI: 'addFile' } }),
		on: {
			active: () => {
				this.#addFile = true;
				this.#input.click();
			},
		},
	});
	#clearBtn: WidgetBtn & Navigable = $new<WidgetBtn, {}>('w-btn', {
		content: $new<WidgetIcon, {}>('w-icon', { prop: { keyUI: 'clearFile' } }),
		on: {
			active: () => {
				this.#files.set(Object.freeze([]));
				this.#placeholder.classList.remove('hidden');
				this.#input.value = '';
			},
		},
	});
	#placeholder: HTMLDivElement = $div({ class: 'placeholder' }, $new('slot'));
	constructor() {
		super({
			eventTypes: ['change'],
			navGroup: true,
		});
		events.hover.add(this);
		events.active.on(this.#placeholder, ({ active, cancel }) => {
			if (active || cancel) return;
			this.#input.click();
		});
		this.addEventListener('dragenter', this.#dragEnterHandler);
		this.addEventListener('dragleave', this.#dragLeaveHandler);
		this.addEventListener('dragover', this.#dragOverHandler);
		this.addEventListener('drop', this.#dropHandler);
		this.#input.addEventListener('change', this.#fileChangeHandler);
		tooltips.set(this.#pickBtn, $new('w-lang', 'ui.file.pick'));
		tooltips.set(this.#addBtn, $new('w-lang', 'ui.file.add'));
		tooltips.set(this.#clearBtn, $new('w-lang', 'ui.file.clear'));
		this.#pickBtn.navParent = this;
		this.#addBtn.navParent = this;
		this.#clearBtn.navParent = this;
	}
	protected render() {
		const items = this.#files.get().map(
			(file) => html`
				<div class="file">
					${
						file.type.startsWith('image/') && this.previewImage
							? $new('img', {
									class: 'file-icon',
									prop: { src: URL.createObjectURL(file) },
								})
							: $new<WidgetIcon, {}>('w-icon', {
									class: 'file-icon',
									prop: { keyUI: 'file' },
								})
					}
					<div class="file-name">${file.name}</div>
					${$new<WidgetBtn, {}>('w-btn', {
						prop: { flat: true },
						content: $new<WidgetIcon, {}>('w-icon', {
							prop: { keyUI: 'removeFile' },
						}),
						on: { active: () => this.#removeFile(file) },
					})}
				</div>
			`,
		);
		return html`
			${this.#placeholder}
			<div class="file-list">${items}</div>
			<div class="actions">
				${this.#pickBtn}
				${this.#addBtn}
				${this.#clearBtn}
			</div>
		`;
	}
	#handleInput(inputs: FileList) {
		if (this.readonly) return;
		let files: File[];
		if (this.multiple) {
			if (this.#addFile) files = [...this.#files.get(), ...inputs];
			else files = [...inputs];
		} else files = inputs.length > 0 ? [inputs[0]] : [];
		if (files.length === 0) return;
		this.#addFile = false;
		this.#files.set(Object.freeze(files));
		this.#placeholder.classList.toggle('hidden', files.length > 0);
		this.events.emit(new EventBase('change', { target: this }));
	}
	#removeFile(file: File) {
		const files = [...this.#files.get()];
		const index = files.indexOf(file);
		if (index === -1) return;
		files.splice(index, 1);
		this.#files.set(files);
		this.#input.value = '';
	}
	//#region Prop
	/** 文件 */
	get files() {
		return this.#files.get();
	}
	/** 接受的文件类型 */
	@property({ type: String })
	get accept() {
		return this.#input.accept;
	}
	set accept(value) {
		this.#input.accept = value;
	}
	/** 允许多个文件 */
	@property({ type: Boolean, reflect: true })
	get multiple() {
		return this.#input.multiple;
	}
	set multiple(value) {
		this.#input.multiple = value;
		if (value) return;
		this.#files.set(Object.freeze(this.#files.get().slice(0, 1)));
	}
	/**
	 * 文件展示方式
	 * @description
	 * 允许多个文件时有效
	 * - `row`：按行显示
	 * - `block`：按列显示
	 */
	@property({ type: String })
	get display() {
		const value = this.getAttribute('display');
		if (DISPLAYS.includes(value as any)) return value as WidgetFileDisplay;
		return 'row';
	}
	set display(value: WidgetFileDisplay) {
		if (!DISPLAYS.includes(value)) return;
		this.setAttribute('display', value);
	}
	/** 预览图像 */
	@property({ type: Boolean, reflect: true, attribute: 'preview-image' })
	accessor previewImage = false;
	/** 只读 */
	@property({ type: Boolean })
	get readonly() {
		return this.hasAttribute('readonly');
	}
	set readonly(value) {
		this.toggleAttribute('readonly', !!value);
		this.#pickBtn.disabled = !!value;
		this.#addBtn.disabled = !!value;
		this.#clearBtn.disabled = !!value;
		this.classList.remove('w-file-hover');
	}
	//#region Events
	#dragEnterHandler() {
		if (this.readonly) return;
		this.classList.add('w-file-hover');
	}
	#dragLeaveHandler() {
		this.classList.remove('w-file-hover');
	}
	#dragOverHandler(event: DragEvent) {
		event.preventDefault();
	}
	#dropHandler(event: DragEvent) {
		event.preventDefault();
		this.classList.remove('w-file-hover');
		if (!event.dataTransfer?.files) return;
		this.#handleInput(event.dataTransfer.files);
	}
	#fileChangeHandler = () => {
		if (!this.#input.files) return;
		this.#handleInput(this.#input.files);
	};
	//#region Nav
	get navChildren() {
		return [
			...[...this.renderRoot.querySelectorAll('.file w-btn')].map((e) => {
				(e as Navigable).navParent = this;
				return e as Navigable;
			}),
			this.#pickBtn,
			this.#addBtn,
			this.#clearBtn,
		];
	}
}
