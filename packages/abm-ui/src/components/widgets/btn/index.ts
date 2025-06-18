import { Signal } from '@lit-labs/signals';
import {
	$applyColor,
	AnimationFrameController,
	Color,
	EventBase,
	EventBaseInit,
	EventsList,
	LocaleParams,
	clamp,
	css,
	runSync,
} from 'abm-utils';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { events, UIEventActive } from '../../../events/index';
import { UIContent, UIContentInit } from '../../content';
import { Widget } from '../base';
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

export interface WidgetBtnProp<Params extends LocaleParams = LocaleParams> {
	/** 内容 */
	content?: string | UIContentInit<Params> | UIContent<Params>;
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

interface WidgetBtnEventsInit<Params extends LocaleParams = LocaleParams> {
	/** 激活事件 */
	active: EventBaseInit<WidgetBtn<Params>>;
}

export interface WidgetBtnEvents<Params extends LocaleParams = LocaleParams>
	extends EventsList<WidgetBtnEventsInit<Params>> {}

const STATES: WidgetBtnState[] = ['', 'primary', 'danger', 'toggle'];

/** 按钮组件 */
@customElement('w-btn')
export class WidgetBtn<
	Params extends LocaleParams = LocaleParams,
> extends Widget<WidgetBtnEventsInit<Params>> {
	//#region Styles
	static styles = css(CSS);
	//#region Main
	#initialized = false;
	constructor() {
		super({
			eventTypes: ['active'],
			nav: true,
		});

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
		const icon = this.#content.iconSignal.get();
		const label = this.#content.labelSignal.get();
		if (icon) (icon as any).part = 'icon';
		if (label) (label as any).part = 'label';
		return html`
			<div class="progress" style=${styleMap({ width: `${this.#progress}%` })}></div>
			<div class="delay" style=${styleMap({ width: `${this.#activeProgress.get()}%` })}></div>
			<div class="content" part="content">${icon}${label}</div>
		`;
	}
	//#region Content
	#content = new UIContent<Params>();
	/** 内容 */
	get content(): UIContent<Params> {
		this.#initialized = true;
		return this.#content;
	}
	set content(value:
		| string
		| UIContent<Params>
		| UIContentInit<Params>
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
	cloneNode(deep?: boolean): WidgetBtn<Params> {
		const node = super.cloneNode(deep) as WidgetBtn<Params>;
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
