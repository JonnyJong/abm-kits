import {
	$apply,
	$div,
	$style,
	type ConnectableElements,
	Page,
	PageHost,
	SingletonPage,
	StackPageHistory,
} from 'abm-ui';
import { Color } from 'abm-utils';

function createConnector() {
	const width = 10 + Math.random() * 50;
	const height = 10 + Math.random() * 50;
	return $div({
		style: {
			position: 'absolute',
			top: `calc(${Math.random() * 100}% - ${height}px)`,
			left: `calc(${Math.random() * 100}% - ${width}px)`,
			width,
			height,
			borderRadius: Math.random() * 10,
			background: Color.rgb([
				Math.random() * 255,
				Math.random() * 255,
				Math.random() * 255,
			]),
		},
	});
}

class MyPage extends Page {
	connect = createConnector();
	init(): void {
		console.log('MyPage: Init');
		$apply(this.root, {
			style: {
				minHeight: 200 + Math.random() * 200,
				background: Color.rgba([
					Math.random() * 255,
					Math.random() * 255,
					Math.random() * 255,
					20,
				]),
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontSize: 32,
			},
			children: [this.connect, 'MyPage'],
		});
	}
	enter(): void {
		console.log('MyPage: Enter');
	}
	exit(): void {
		console.log('MyPage: Exit');
	}
	destroy(): void {
		console.log('MyPage: Destroy');
	}
	collectConnectableElements(): ConnectableElements {
		return { connect: this.connect };
	}
}

class MySingletonPage extends SingletonPage {
	connect = createConnector();
	init(): void {
		$apply(this.root, {
			style: {
				minHeight: 200,
				background: Color.rgba([
					Math.random() * 255,
					Math.random() * 255,
					Math.random() * 255,
					20,
				]),
				border: '1px solid',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontSize: 32,
			},
			children: [this.connect, 'MySingletonPage'],
		});
	}
	enter(): void {
		console.log('MySingletonPage: Enter');
	}
	exit(): void {
		console.log('MySingletonPage: Exit');
	}
	destroy(): void {
		console.log('MySingletonPage: Destroy');
	}
	setup(): void {
		console.log('MySingletonPage: Setup');
	}
	collectConnectableElements(): ConnectableElements {
		return { connect: this.connect };
	}
}

const host = PageHost.new(
	{
		'my-page': MyPage,
		'my-singleton-page': MySingletonPage,
	},
	new StackPageHistory(),
);

$style(host, { width: '100%', transition: '.2s .1s', minHeight: 100 });
body.append(host);

//#region #Reg
__registerControl(host, {
	props: {
		autoHeight: 'boolean',
		transition: [
			'suppress',
			'fade',
			'entrance',
			'drill',
			'slideFromRight',
			'slideFromLeft',
		],
	},
	actions: {
		pushMyPage: () => {
			console.log('=== pushMyPage ===');
			const current = host.current;
			let connect: HTMLElement | undefined;
			if (current instanceof MyPage) connect = current.connect;
			else if (current instanceof MySingletonPage) connect = current.connect;
			host.push({
				page: 'my-page',
				connectFrom: connect ? { connect } : undefined,
			});
			console.log({
				current: host.current,
				index: host.history.currentIndex,
				length: host.history.length,
			});
		},
		pushMySingletonPage: () => {
			console.log('=== pushMySingletonPage ===');
			const current = host.current;
			let connect: HTMLElement | undefined;
			if (current instanceof MyPage) connect = current.connect;
			else if (current instanceof MySingletonPage) connect = current.connect;
			host.push({
				page: 'my-singleton-page',
				connectFrom: connect ? { connect } : undefined,
			});
			console.log({
				current: host.current,
				index: host.history.currentIndex,
				length: host.history.length,
			});
		},
		back: () => {
			console.log('=== back ===');
			host.back();
			console.log({
				current: host.current,
				index: host.history.currentIndex,
				length: host.history.length,
			});
		},
		forward: () => {
			console.log('=== forward ===');
			host.forward();
			console.log({
				current: host.current,
				index: host.history.currentIndex,
				length: host.history.length,
			});
		},
		forceBack: () => {
			console.log('=== forceBack ===');
			host.back(true);
			console.log({
				current: host.current,
				index: host.history.currentIndex,
				length: host.history.length,
			});
		},
	},
});

$style(body, { display: 'block' });
