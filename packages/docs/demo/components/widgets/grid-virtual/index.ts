import { Signal } from '@lit-labs/signals';
import { WidgetGridVirtual, WidgetGridVirtualItem } from 'abm-ui';
import { $, $new, createArray } from 'abm-utils';
import { css } from 'lit';
import { customElement } from 'lit/decorators.js';

class TestGridVirtualItem extends WidgetGridVirtualItem<string> {
	#data = new Signal.State('');
	static styles = css`
		:host {
			overflow: hidden;
			background: #8884;
			border: 1px solid;
		}
	`;
	constructor() {
		super();
		this.viewHeight = Math.random() * 48 + 24;
		this.viewWidth = Math.min(innerWidth / 2 - 36, 150);
	}
	get data(): string {
		return this.#data.get();
	}
	set data(value: string) {
		this.#data.set(value);
	}
	protected render() {
		return this.#data.get();
	}
	static create(data: string): TestGridVirtualItem {
		const node: TestGridVirtualItem = $new('test-grid-virtual-item' as any);
		node.data = data;
		return node;
	}
}

// HACK: rolldown does not support decorator
customElement('test-grid-virtual-item')(TestGridVirtualItem);

const grid = $<WidgetGridVirtual<string>>('w-grid-virtual')!;
grid.itemClass = TestGridVirtualItem;
grid.items = createArray(50, () => String(Math.random()));

window.register({
	attrs: [
		{
			id: 'layout',
			type: 'enum',
			options: ['fill', 'content-center'],
			value: grid.layout,
			action(v) {
				grid.layout = v;
			},
		},
		{
			id: 'itemScaping',
			type: 'enum',
			options: ['between', 'around', 'evenly', 'none'],
			value: grid.itemScaping,
			action(v) {
				grid.itemScaping = v;
			},
		},
		{
			id: 'itemAlign',
			type: 'enum',
			options: ['left', 'center', 'right', 'justify'],
			value: grid.itemAlign,
			action(v) {
				grid.itemAlign = v;
			},
		},
		{
			id: 'itemVerticalAlign',
			type: 'enum',
			options: ['top', 'center', 'bottom'],
			value: grid.itemVerticalAlign,
			action(v) {
				grid.itemVerticalAlign = v;
			},
		},
		{
			id: 'itemWidthType',
			type: 'enum',
			options: ['fixed-count', 'fixed-size', 'variable', 'dynamic'],
			value: grid.itemWidthType,
			action(v) {
				grid.itemWidthType = v;
			},
		},
		{
			id: 'itemWidthRatio',
			type: 'number',
			value: grid.itemWidthRatio,
			min: 0,
			action(v) {
				grid.itemWidthRatio = v;
			},
		},
		{
			id: 'itemHeightType',
			type: 'enum',
			options: ['fixed', 'dynamic'],
			value: grid.itemHeightType,
			action(v) {
				grid.itemHeightType = v;
			},
		},
		{
			id: 'itemHeightRatio',
			type: 'number',
			value: grid.itemHeightRatio,
			min: 0,
			action(v) {
				grid.itemHeightRatio = v;
			},
		},
		{
			id: 'hGap',
			type: 'number',
			value: grid.itemHeightRatio,
			min: 0,
			action(v) {
				grid.itemHeightRatio = v;
			},
		},
		{
			id: 'vGap',
			type: 'number',
			value: grid.vGap,
			min: 0,
			action(v) {
				grid.vGap = v;
			},
		},
		{
			id: 'generate',
			type: 'btn',
			action() {
				grid.items = createArray(50, () => String(Math.random()));
			},
		},
	],
});
