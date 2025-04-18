import { Signal } from '@lit-labs/signals';
import {
	$applyColor,
	AnimationFrameController,
	Color,
	clamp,
	css,
	runSync,
} from 'abm-utils';
import CSS from 'btn.style';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { EventBase, EventBaseInit } from '../../events/api/base.js';
import { EventsList } from '../../events/events.js';
import { events, UIEventActive } from '../../events/index.js';
import { LocaleOptions } from '../../locale.js';
import { UIContent, UIContentInit } from '../content.js';
import { Widget } from './base.js';

/**
 * 按钮状态
 * @description
 * - ``：默认
 * - `primary`：主要
 * - `danger`：危险
 * - `toggle`：切换
 */
export type WidgetBtnState = '' | 'primary' | 'danger' | 'toggle';

export interface WidgetBtnProp<Options extends LocaleOptions = LocaleOptions> {
	/** 内容 */
	content?: string | UIContentInit<Options> | UIContent<Options>;
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

interface WidgetBtnEventsInit<Options extends LocaleOptions = LocaleOptions> {
	/** 激活事件 */
	active: EventBaseInit<WidgetBtn<Options>>;
}

export type WidgetBtnEvents<Options extends LocaleOptions = LocaleOptions> =
	EventsList<WidgetBtnEventsInit<Options>>;

const STATES: WidgetBtnState[] = ['', 'primary', 'danger', 'toggle'];

/** 按钮组件 */
@customElement('w-btn')
export class WidgetBtn<
	Options extends LocaleOptions = LocaleOptions,
> extends Widget<WidgetBtnProp, WidgetBtnEventsInit<Options>> {
	//#region Styles
	static styles = css(CSS);
	//#region Main
	#initialized = false;
	constructor() {
		super(['active'], true);

		events.hover.add(this);
		events.active.on(this, this.#activeHandler);
	}
	connectedCallback(): void {
		super.connectedCallback();

		if (this.#initialized) return;
		this.#initialized = true;

		const text = this.textContent?.trim();
		if (!text) return;
		this.#content.key = text;

		const icon = this.getAttribute('icon');
		if (icon) this.#content.icon = icon;
	}
	protected render() {
		return html`
			<div class="progress" style=${styleMap({ width: `${this.#progress}%` })}></div>
			<div class="delay" style=${styleMap({ width: `${this.#activeProgress.get()}%` })}></div>
			<div class="content">${this.#content.iconSignal.get()}${this.#content.labelSignal.get()}</div>
		`;
	}
	//#region Content
	#content = new UIContent<Options>();
	/** 内容 */
	get content(): UIContent<Options> {
		this.#initialized = true;
		return this.#content;
	}
	set content(value:
		| string
		| UIContent<Options>
		| UIContentInit<Options>
		| undefined) {
		this.#initialized = true;

		if (typeof value === 'string') {
			this.#content.key = value;
			return;
		}
		this.#content.reset(value);
	}
	//#region Properties
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
	@property({ type: String, attribute: false })
	get color(): Color | undefined {
		return this.#color?.clone();
	}
	set color(color: Color | string | undefined) {
		if (color instanceof Color) {
			this.#color = color.clone();
		} else if (typeof color === 'string') {
			runSync(() => {
				this.#color = Color.hexa(color);
			});
		} else {
			this.#color = undefined;
		}
		$applyColor(this, this.#color);
	}
	#progress = 100;
	/** 进度 */
	@property({ type: Number })
	get progress() {
		return this.#progress;
	}
	set progress(value: number) {
		this.#initialized = true;
		if (isNaN(value)) return;
		this.#progress = clamp(0, value, 100);
	}
	#delay = 0;
	/** 长按激活时长 */
	get delay() {
		return this.#delay;
	}
	set delay(value: number) {
		this.#initialized = true;
		if (isNaN(value) || value < 0) value = 0;
		if (value === Infinity) console.warn('Delay value is Infinity');
		this.#delay = value;
	}
	//#region Events
	#activeProgress = new Signal.State(100);
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
			(clamp(0, this.#activeDuration, this.#delay) / this.#delay) * 100,
		);
	});
	#resetActiveDuration() {
		this.#activeController.stop();
		this.#activeDuration = 0;
		this.#activePrevTime = 0;
		this.#activeProgress.set(100);
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
	cloneNode(deep?: boolean): WidgetBtn<Options> {
		const node = super.cloneNode(deep) as WidgetBtn<Options>;
		node.content = this.#content;
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
