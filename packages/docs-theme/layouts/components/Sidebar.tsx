import { URL } from 'ezal';
import type { DocsNav } from '../../src/page/doc/navigation';

function Item(item: DocsNav) {
	if (item.children.length === 0) {
		return (
			<div class="aside-item">
				<a href={URL.for(item.url)} nav>
					{item.title}
				</a>
			</div>
		);
	}
	return (
		<abm-collapsible class="aside-list">
			<div slot="head" class="aside-item">
				<div class="aside-collapse" nav>
					<abm-icon key="collapse" />
				</div>
				<a href={URL.for(item.url)} nav>
					{item.title}
				</a>
			</div>
			<div class="aside-children">{item.children.map(Item)}</div>
		</abm-collapsible>
	);
}

export default () => <aside>{context.nav.map(Item)}</aside>;
