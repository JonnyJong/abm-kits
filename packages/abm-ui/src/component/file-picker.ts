import { defineElement, property } from '../infra/decorator';
import type { ElementProps } from '../infra/dom';
import { $div, $new, $slot } from '../infra/dom';
import { $on } from '../infra/event';
import { register } from '../infra/registry';
import { css } from '../infra/style';
import type { AriaConfig } from './base';
import { Button } from './button';
import { FormControl } from './form';
import { ico } from './icon';
import { Img } from './img';

declare module '../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-file-picker': FilePicker;
	}
}

declare module '../infra/registry' {
	interface Registry {
		'file-picker': FilePicker;
	}
}

declare module './icon' {
	interface PresetIcons {
		/** 文件 */
		file: string;
		/** 移除文件 */
		removeFile: string;
	}
}

export interface FilePickerProp extends ElementProps<FilePicker> {}

/**
 * 文件选择器
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/form/file-picker)
 */
@register('file-picker')
@defineElement('abm-file-picker')
export class FilePicker extends FormControl<File[], FilePickerProp> {
	protected static style = css`
		:host {
			position: relative;
			display: flex;
			flex-direction: column;
			background: var(--surface-bg);
			border: 1px solid var(--surface-border);
			border-radius: var(--border-radius);
			outline: 4px dashed #0000;
			transition: .1s outline;
			overflow: clip auto;
		}
		.container, .placeholder {
			height: 100%;
			padding: 16px;
		}
		:is(:host([readonly]), :host(:not([multiple]))) .remove { display:none }
		.list {
			display: flex;
			flex-direction: column;
			gap: 8px;
		}
		.file {
			display: flex;
			align-items: center;
			gap: 8px;
		}
		.name {
			flex: 1;
			white-space: normal;
			word-break: keep-all;
			overflow: hidden;
			text-overflow: ellipsis;
			height: 24px;
		}
		.icon {
			width: 32px;
			height: 32px;
			padding: 4px;
			object-fit: cover;
			background: var(--ui-bg-hover);
			border-radius: var(--border-radius);
		}
		.preview { padding: 0px }
		:host(:not([multiple])) .list {
			height: 100%;
			justify-content: center;
			align-items: center;
		}
		:host(:not([multiple])) .name { flex: 0 }
		:host(:not([multiple])) .preview {
			position: absolute;
			inset: 0;
			width: 100%;
			height: 100%;
		}
		:host(:not([multiple])) .preview~.name { display: none }
		:host([hover]) { outline-color: var(--primary) }
		.hidden { display: none }
	`;
	protected static aria: AriaConfig = { role: 'group', label: 'File Picker' };
	#input: HTMLInputElement = $new('input', { type: 'file' });
	#items: [file: File, [element: HTMLElement, blob?: string]][] = [];
	#list = $div({ class: 'list' });
	#container = $div(
		{ class: 'container hidden' },
		$div({ part: 'before' }, $slot('before')),
		this.#list,
		$div({ part: 'after' }, $slot('after')),
	);
	#placeholder = $div({ class: 'placeholder', part: 'placeholder' }, $slot());
	#checkFile: (type: string) => boolean = () => true;
	constructor(_props?: FilePickerProp) {
		super();
		this.attachShadow({}, this.#container, this.#placeholder);
		this.#input.multiple = false;
		$on(this, 'dragleave', this.#handleDragLeave);
		$on(this, 'dragover', this.#handleDragOver);
		$on(this, 'drop', this.#handleDrop);
		$on(this.#input, 'change', () => this.#handleChange());
	}
	#compileRules() {
		const rules = this.accept
			.split(',')
			.map((pattern) => pattern.trim())
			.filter((pattern) => pattern)
			.map<(type: string) => boolean>((pattern) => {
				if (pattern.at(-1) !== '*') return (type) => type === pattern;
				const prefix = pattern.slice(0, -1);
				return (type) => type.startsWith(prefix);
			});
		return (type: string) => rules.every((rule) => rule(type));
	}
	#postCheck(event: DragEvent): boolean {
		if (this.disabled || this.readonly) return false;
		if (!event.dataTransfer) return false;
		if (!this.multiple && event.dataTransfer.items.length > 1) return false;
		for (const item of event.dataTransfer.items) {
			if (item.kind !== 'file') return false;
			if (!this.#checkFile(item.type)) return false;
		}
		return true;
	}
	#check(event: DragEvent): boolean {
		if (this.disabled || this.readonly) return false;
		if (!event.dataTransfer) return false;
		if (!this.multiple && event.dataTransfer.files.length > 1) return false;
		for (const file of event.dataTransfer.files) {
			if (!this.#checkFile(file.type)) return false;
		}
		return true;
	}
	#handleDragLeave() {
		this.toggleAttribute('hover', false);
		this.toggleAttribute('reject', false);
	}
	#handleDragOver(event: DragEvent) {
		event.preventDefault();
		const checked = this.#postCheck(event);
		this.toggleAttribute('hover', checked);
		event.dataTransfer!.dropEffect = checked ? 'copy' : 'none';
	}
	#handleDrop(event: DragEvent) {
		event.preventDefault();
		this.#handleDragLeave();
		if (!this.#check(event)) return;
		this.#handleInput(event.dataTransfer!.files);
	}
	#handleChange() {
		if (!this.#input.files) return;
		this.#handleInput(this.#input.files);
	}
	#handleInput(files: FileList) {
		if (this.disabled || this.readonly) return;
		if (files.length === 0) return;
		if (this.multiple) this.#value.push(...files);
		// biome-ignore lint/style/useAtIndex: No `.at()` on FileList
		else this.#value = [files[files.length - 1]];
		this.#updateView();
		this.emitUpdate(true);
	}
	#handleRemove(file: File, item: HTMLElement, blob?: string) {
		if (this.disabled || this.readonly) return;
		const index = this.#value.indexOf(file);
		if (index === -1) return;
		this.#value.splice(index, 1);
		this.#items.splice(index, 1);
		item.remove();
		if (blob) URL.revokeObjectURL(blob);
		if (this.#value.length > 0) return;
		this.#togglePlaceholder();
	}
	#icon(file: File): [icon: HTMLElement, blob?: string] {
		const icon = ico('ui.file');
		if (!(this.#previewImage && file.type.startsWith('image/'))) {
			icon.classList.add('icon');
			return [icon];
		}
		const url = URL.createObjectURL(file);
		return [$new(Img, { class: 'icon preview', value: url }, icon), url];
	}
	#togglePlaceholder() {
		const empty = this.#value.length === 0;
		this.#container.classList.toggle('hidden', empty);
		this.#placeholder.classList.toggle('hidden', !empty);
	}
	#updateView() {
		const cache = new Map(this.#items);
		const newItems = this.#value.map<[File, [HTMLElement, string?]]>((file) => {
			const item = cache.get(file);
			if (item) return [file, item];
			const [icon, blob] = this.#icon(file);
			const rmBtn = $new(
				Button,
				{ class: 'remove', flat: true },
				ico('ui.removeFile'),
			);
			const element = $div(
				{ class: 'file' },
				icon,
				$div({ class: 'name' }, file.name),
				rmBtn,
			);
			rmBtn.on('active', () => this.#handleRemove(file, element, blob));
			return [file, [element, blob]];
		});
		this.#list.replaceChildren(...newItems.map(([_, [e]]) => e));
		this.#togglePlaceholder();
		for (const [_, blob] of cache.values()) {
			if (blob) URL.revokeObjectURL(blob);
		}
	}
	/** 打开文件选择器 */
	openPicker(): void {
		this.#input.click();
	}
	accessor default = [];
	#value: File[] = [];
	get value() {
		return [...this.#value];
	}
	set value(value) {
		if (!Array.isArray(value)) return;
		this.#value = value.filter((v) => v instanceof File);
		this.#updateView();
	}
	/** 只读 */
	@property({ reflect: true, toValue: Boolean })
	accessor readonly = false;
	#previewImage = false;
	/** 预览图像 */
	@property({ reflect: true, toValue: Boolean })
	get previewImage() {
		return this.#previewImage;
	}
	set previewImage(value) {
		value = !!value;
		if (this.#previewImage === value) return;
		this.#previewImage = value;
		this.#updateView();
	}
	/**
	 * 接受的文件类型
	 * @link https://developer.mozilla.org/docs/Web/API/HTMLInputElement/accept
	 */
	@property()
	get accept() {
		return this.#input.accept;
	}
	set accept(value) {
		if (value === this.#input.accept) return;
		this.#input.accept = value;
		this.#checkFile = this.#compileRules();
	}
	/** 允许多个文件 */
	@property({ reflect: true, toValue: Boolean })
	get multiple() {
		return this.#input.multiple;
	}
	set multiple(value) {
		value = !!value;
		if (value === this.#input.multiple) return;
		this.#input.multiple = value;
		this.#value = this.#value.slice(0, 1);
		if (this.#value.length === 0) return;
		this.#updateView();
	}
	protected clone(from: this): void {
		this.readonly = from.readonly;
		this.previewImage = from.previewImage;
		this.accept = from.accept;
		this.multiple = from.multiple;
		super.clone(from);
	}
}
