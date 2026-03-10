import { defineElement } from '../../infra/decorator';
import { $div, type ElementProps } from '../../infra/dom';
import { css } from '../../infra/style';
import { HintBase } from './base';

declare module '../../infra/dom' {
	interface CustomElementTagNameMap {
		'abm-hint-touch': TouchHint;
	}
}

export interface TouchHintProps extends ElementProps<TouchHint> {}

export type TouchHintKey = (typeof KEYS)[number];

const KEYS = [
	'Tap',
	'DualTap',
	'Hold',
	'Move',
	'SwapUp',
	'SwapRight',
	'SwapDown',
	'SwapLeft',
] as const;

/**
 * 触摸提示
 * @link [ABM Kits Docs](https://jonnyjong.github.io/abm-kits/component/hint#touchhint)
 */
@defineElement('abm-hint-touch')
export class TouchHint extends HintBase<TouchHintKey, TouchHintProps> {
	protected static style = css`
		:host {
			display: inline-block;
			width: 28px;
			height: 28px;
		}
		.root {
			position: relative;
			margin: auto;
			width: 28px;
			height: 28px;
		}
		.root>* {
			position: absolute;
			border-radius: 1e8px;
			height: var(--s);
			width: var(--s);
			inset: 0;
			margin: auto;
			border: 1px solid var(--br);
			background: var(--bg);
			animation: var(--a) 1.5s infinite linear;
			--a: Idle;
			--s: 8px;
			--bg: #0000;
			--br: #0000;
		}
		[class="root"]>* { --bg: var(--fg) }
		@keyframes Tap {
			50% { border-color: var(--fg) }
			100% { scale: 2 }
		}
		.Tap .a { --a: Tap }
		@keyframes DualTap {
			40% { border-color: var(--fg) }
			80% { scale: 2; border-color: #0000 }
		}
		.DualTap :is(.a, .b) { --a: DualTap }
		.DualTap .b { scale: .5; animation-delay: .3s }
		@keyframes Hold { 40% { scale: 2 } }
		.Hold .a { scale: 1.5; --bg: var(--fg); --a: Hold }
		@keyframes Move { 100% { rotate: 360deg } }
		.Move .a { --bg: var(--fg); transform-origin: 6px; translate: -2px; scale: 1.5; --a: Move }
		@keyframes SwapA {
			10%, 90% { opacity: 1 }
			100% { bottom: 18px }
		}
		@keyframes SwapB {
			10% { opacity: 1 }
			80% { opacity: .5 }
			100% { height: 28px }
		}
		[class*="Swap"]>* { --bg: var(--fg); --s: 10px; top: unset; opacity: 0 }
		[class*="Swap"] .a { --a: SwapA }
		[class*="Swap"] .b { --a: SwapB }
		.SwapRight { rotate: 90deg }
		.SwapDown { rotate: 180deg }
		.SwapLeft { rotate: -90deg }
	`;
	#root = $div({ class: 'root' }, $div({ class: 'a' }), $div({ class: 'b' }));
	constructor(_props?: TouchHintProps) {
		super();
		this.attachShadow({}, this.#root);
	}
	protected update(): void {
		this.#root.className = this.key ? `root ${this.key}` : 'root';
	}
	protected validate(key: unknown): key is TouchHintKey | undefined {
		if (key === undefined) return true;
		return KEYS.includes(key as any);
	}
}
