import { Signal } from '@lit-labs/signals';
import { WidgetGridVirtual, WidgetGridVirtualItem } from 'abm-ui';
import { $new, createArray } from 'abm-utils';
import { css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { $panel } from '../../utils';

@customElement('test-grid-virtual-item')
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
		super(undefined, false, false);
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

const grid = $new<WidgetGridVirtual<string>, {}>('w-grid-virtual');

export function initGridVirtual() {
	grid.itemClass = TestGridVirtualItem;
	grid.items = createArray(50, () => String(Math.random()));
	$panel(
		'grid-virtual',
		grid,
		[
			{
				type: 'enum',
				key: 'layout',
				options: ['fill', 'content-center'],
			},
			{
				type: 'enum',
				key: 'itemScaping',
				options: ['between', 'around', 'evenly', 'none'],
			},
			{
				type: 'enum',
				key: 'itemAlign',
				options: ['left', 'center', 'right', 'justify'],
			},
			{
				type: 'enum',
				key: 'itemVerticalAlign',
				options: ['top', 'center', 'bottom'],
			},
			{
				type: 'enum',
				key: 'itemWidthType',
				options: ['fixed-count', 'fixed-size', 'variable', 'dynamic'],
			},
			{
				type: 'number',
				key: 'itemWidthRatio',
				default: 0,
				min: 0,
			},
			{
				type: 'enum',
				key: 'itemHeightType',
				options: ['fixed', 'dynamic'],
			},
			{
				type: 'number',
				key: 'itemHeightRatio',
				default: 0,
				min: 0,
			},
			{
				type: 'number',
				key: 'hGap',
				default: 0,
				min: 0,
			},
			{
				type: 'number',
				key: 'vGap',
				default: 0,
				min: 0,
			},
		],
		[],
		[
			$new('w-btn', {
				content: 'Generate',
				on: {
					active: () => {
						grid.items = createArray(50, () => String(Math.random()));
					},
				},
			}),
		],
	);
}
