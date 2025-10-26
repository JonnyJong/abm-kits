import { Signal } from '@lit-labs/signals';
import {
	$applyColor,
	$new,
	AnimationFrameController,
	Color,
	clamp,
	css,
	EventBase,
	type EventBaseInit,
	type EventsList,
	runSync,
} from 'abm-utils';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { events, type UIEventActive } from '../../../events/index';
import { Widget } from '../base';
import { WidgetIcon } from '../icon';
import { WidgetLang } from '../lang';
import CSS from './index.styl';

/**
 * 按钮状态
 * @description
 * - ``：默认
 * - `primary`：主要
 * - `danger`：危险
 * - `toggle`：切换
 */
export type WidgetBtnState = '' | 'primary' | 'danger' | 'toggle';

export interface WidgetBtnProp {
	/** 图标 */
	icon?: string;
	/** 翻译键 */
	key?: string;
	/** 状态 */
	state?: WidgetBtnState;
	/** 扁平 */
	flat?: boolean;
	/** 圆角 */
	rounded?: boolean;
	/** 已选中 */
	checked?: boolean;
	/** 禁用 */
	disabled?: boolean;
	/** 长按激活时长 */
	delay?: number;
	/** 进度 */
	progress?: number;
	/** 颜色 */
	color?: Color | string;
}

interface WidgetBtnEventsInit {
	/** 激活事件 */
	active: EventBaseInit<WidgetBtn>;
}

export interface WidgetBtnEvents extends EventsList<WidgetBtnEventsInit> {}

const STATES: WidgetBtnState[] = ['', 'primary', 'danger', 'toggle'];

/** 按钮组件 */
@customElement('w-btn')
export class WidgetBtn extends Widget<WidgetBtnEventsInit> {
	//#region Styles
	static styles = css(CSS);
	constructor() {
		super({
			eventTypes: ['active'],
			nav: true,
		});

		events.hover.add(this);
		events.active.on(this, this.#activeHandler);
	}
	protected render() {
		return html`
			<div class="delay" style=${styleMap({ width: `${this.#activeProgress.get()}%` })}></div>
			${this.#progress}
			<slot></slot>
		`;
	}
	//#region Properties
	/** 图标 */
	@property({ type: String })
	get icon() {
		if (this.firstElementChild instanceof WidgetIcon) {
			return this.firstElementChild.key;
		}
		// biome-ignore lint/suspicious/useGetterReturn: Return nothing
		return;
	}
	set icon(value: string | undefined) {
		if (this.firstElementChild instanceof WidgetIcon) {
			if (value === undefined) this.firstElementChild.remove();
			else this.firstElementChild.key = value;
			return;
		}
		if (value === undefined) return;
		this.prepend($new({ tag: 'w-icon' }, value));
	}
	/** 翻译键 */
	@property({ type: String })
	get key() {
		if (this.lastElementChild instanceof WidgetLang) {
			return this.lastElementChild.key;
		}
		// biome-ignore lint/suspicious/useGetterReturn: Return nothing
		return;
	}
	set key(value: string | undefined) {
		if (this.lastElementChild instanceof WidgetLang) {
			if (value === undefined) this.lastElementChild.remove();
			else this.lastElementChild.key = value;
			return;
		}
		if (value === undefined) return;
		this.append($new({ tag: 'w-lang' }, value));
	}
	/** 禁用 */
	@property({ type: Boolean, reflect: true }) accessor disabled = false;
	/** 扁平 */
	@property({ type: Boolean, reflect: true }) accessor flat = false;
	/** 圆角 */
	@property({ type: Boolean, reflect: true }) accessor rounded = false;
	/** 已选中 */
	@property({ type: Boolean, reflect: true }) accessor checked = false;
	/** 状态 */
	get state() {
		const state = this.getAttribute('state') as any;
		if (STATES.includes(state)) return state;
		return '';
	}
	set state(state: WidgetBtnState) {
		if (STATES.includes(state)) this.setAttribute('state', state);
		else this.removeAttribute('state');
	}
	#color?: Color;
	/** 颜色 */
	@property({ type: String })
	get color(): Color | undefined {
		return this.#color?.clone();
	}
	set color(color: Color | string | undefined) {
		if (color instanceof Color) {
			this.#color = color.clone();
		} else if (typeof color === 'string') {
			runSync(() => {
				try {
					this.#color = Color.hexa(color);
				} catch {
					this.#color = Color.hex(color);
				}
			});
		} else {
			this.#color = undefined;
		}
		$applyColor(this, this.#color);
	}
	#progress = $new({
		tag: 'w-progress-bar',
		class: 'progress',
		prop: { value: 0 },
	});
	/** 进度 */
	@property({ type: Number })
	get progress() {
		return this.#progress.value;
	}
	set progress(value: number) {
		this.#progress.value = value;
	}
	#delay = 0;
	/** 长按激活时长 */
	@property({ type: Number })
	get delay() {
		return this.#delay;
	}
	set delay(value: number) {
		if (Number.isNaN(value) || value < 0) value = 0;
		if (value === Infinity) console.warn('Delay value is Infinity');
		this.#delay = value;
	}
	//#region Events
	#activeProgress = new Signal.State(0);
	#activeDuration = 0;
	#activePrevTime = 0;
	#activeController = new AnimationFrameController((time) => {
		if (this.#activePrevTime === 0) {
			this.#activePrevTime = time;
		}
		const intervals = time - this.#activePrevTime;
		this.#activePrevTime = time;
		this.#activeDuration += intervals;
		this.#activeProgress.set(
			(1 - (1 - clamp(0, this.#activeDuration, this.#delay) / this.#delay) ** 2) *
				100,
		);
	});
	#resetActiveDuration() {
		this.#activeController.stop();
		this.#activeDuration = 0;
		this.#activePrevTime = 0;
		this.#activeProgress.set(0);
	}
	#activeHandler(event: UIEventActive) {
		if (this.disabled) return;

		if (this.#delay === 0) {
			if (event.cancel || event.active) return;
			if (this.state === 'toggle') this.toggleAttribute('checked');
			this.events.emit(new EventBase('active', { target: this }));
			return;
		}

		if (event.active) {
			this.#activeController.start();
			return;
		}
		if (this.#activeDuration < this.#delay || event.cancel) {
			this.#resetActiveDuration();
			return;
		}
		this.#resetActiveDuration();
		if (this.state === 'toggle') this.toggleAttribute('checked');
		this.events.emit(new EventBase('active', { target: this }));
	}
	//#region Other
	cloneNode(deep?: boolean): WidgetBtn {
		const node = super.cloneNode(deep) as WidgetBtn;
		node.state = this.state;
		node.flat = this.flat;
		node.rounded = this.rounded;
		node.checked = this.checked;
		node.disabled = this.disabled;
		node.delay = this.delay;
		node.progress = this.progress;
		node.color = this.color;
		return node;
	}
}
