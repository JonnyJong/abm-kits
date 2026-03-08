import { createTabsPrefab, SingletonPage } from 'abm-ui';

class FirstTab extends SingletonPage {
	init(): void {
		this.root.append('First Tab Content');
	}
}

class SecondTab extends SingletonPage {
	init(): void {
		this.root.append('Second Tab Content');
	}
}

class ThirdTab extends SingletonPage {
	init(): void {
		this.root.append('Third Tab Content');
	}
}

const tabs = createTabsPrefab(
	{
		first: { tab: 'First', content: FirstTab },
		second: { tab: 'Second', content: SecondTab },
		third: { tab: 'Third', content: ThirdTab },
	},
	{
		nav: { style: { width: '100%' } },
		pageHost: { autoHeight: true, style: { width: '100%' } },
		transition: 'slide',
		$change: console.log,
	},
);

body.append(tabs.nav, tabs.pageHost);
