import { defineElement } from '../../infra/decorator';
import type { ElementProps } from '../../infra/dom';
import { css } from '../../infra/style';
import { HintBase } from './base';

declare module '../../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-hint-mouse': MouseHint;
	}
}

export interface MouseHintProp extends ElementProps<MouseHint> {}

export type MouseHintKey = (typeof KEYS)[number];

const KEYS = [
	'Move',
	'MoveHorizontal',
	'MoveVertical',
	'Wheel',
	'WheelPress',
	'WheelUp',
	'WheelDown',
	'Left',
	'Right',
] as const;

const TEMPLATE = `
<svg width="28" height="28" viewBox="0 0 28 28">
<path class="btn-left" d="M 7.3461655,6.5813524 9.5569901,4.4047893 H 13.998347 V 16.799779 H 7.357214 Z"/>
<path class="btn-right" d="M 20.650528,6.5813524 18.439704,4.4047893 H 13.998347 V 16.799779 h 6.641133 z"/>
<rect class="wheel" width="1.7927351" height="6.9301248" x="13.103632" y="7.8175921" ry="0.89636755"/>
<path class="wheel-up" d="m 16,7.6659692 -2,-2 -2,1.999998"/>
<path class="wheel-down" d="m 12,14.817592 2,2 2,-2"/>
<path class="up" d="M 16,2.4999793 14,0.49997929 12,2.4999773"/>
<path class="right" d="m 22.5,12 2,2 -1.999998,2"/>
<path class="down" d="m 16,25.500021 -2,2 -2,-1.999998"/>
<path class="left" d="m 5.4999793,16 -2,-2 1.999998,-2"/>
<path class="shell" d="m 10.936088,4.2618602 h 6.127824 c 2.209139,0 4,1.790861 4,4 v 8.4298048 c 0,3.916068 -3.143957,7.081994 -7.063912,7.090937 -3.919955,0.0089 -7.0639117,-3.105766 -7.0639117,-7.037424 V 8.2618602 c 0,-2.2091389 1.7908608,-3.9999998 3.9999997,-4 z"/>
</svg>`;

/**
 * 鼠标提示
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/hint#mousehint)
 */
@defineElement('abm-hint-mouse')
export class MouseHint extends HintBase<MouseHintKey, MouseHintProp> {
	protected static style = css`
		:host {
			display: inline-block;
			width: 28px;
			height: 28px;
			vertical-align: bottom;
		}
		svg { fill: none }
		.shell,
		.Move :is(.up, .right, .down, .left),
		.MoveHorizontal :is(.left, .right),
		.MoveVertical :is(.up, .down),
		.Wheel :is(.wheel-up, .wheel-down),
		.WheelUp .wheel-up,
		.WheelDown .wheel-down
		{ stroke: var(--fg) }
		.wheel { fill: var(--fg) }
		.Left .btn-left,
		.Right .btn-right,
		.WheelPress .wheel
		{ fill: var(--primary) }
		.WheelPress .wheel { stroke: var(--primary) }
	`;
	#svg: SVGSVGElement;
	constructor(_props?: MouseHintProp) {
		super();
		const root = this.attachShadow();
		root.innerHTML = TEMPLATE;
		this.#svg = root.children[0] as any;
	}
	protected update(): void {
		this.#svg.classList.value = this.key ?? '';
	}
	protected validate(key: unknown): key is MouseHintKey | undefined {
		if (key === undefined) return true;
		return KEYS.includes(key as any);
	}
}
