import type { Constructor } from 'abm-utils';
import { Nav, type NavProps } from '../component/nav';
import {
	PageHost,
	type PageHostProps,
	type PageTransitionType,
	type SingletonPage,
} from '../component/page';
import { $new, type DOMContents } from '../infra/dom';

export interface TabsPrefabItem<Args extends any[] = any[]> {
	/** 标签 */
	tab: DOMContents;
	/** 标签页 */
	content: Constructor<SingletonPage<Args>>;
}
export type TabsPrefabItemRecord = Record<string, TabsPrefabItem>;
export interface TabsPrefabInit<T extends TabsPrefabItemRecord> {
	nav?: Nav | NavProps;
	pageHost?: PageHost<any> | PageHostProps<any>;
	args?: any[];
	default?: keyof T & string;
	transition?: 'suppress' | 'fade' | 'entrance' | 'drill' | 'slide';
	$change?: (key: keyof T & string) => any;
}
type TabsPrefabNav<T extends TabsPrefabItemRecord> = Nav<keyof T & string>;
type TabsPrefabPageHost<T extends TabsPrefabItemRecord> = PageHost<{
	[K in keyof T & string]: T[K]['content'];
}>;

export function createTabsPrefab<T extends TabsPrefabItemRecord>(
	tabs: T,
	init?: TabsPrefabInit<T>,
) {
	// Create
	let nav: TabsPrefabNav<T>;
	let pageHost: PageHost<any>;
	if (init?.nav instanceof Nav) nav = init.nav;
	else nav = $new(Nav<keyof T & string>, init?.nav as any);
	if (init?.pageHost instanceof PageHost) pageHost = init.pageHost;
	else pageHost = $new(PageHost, init?.pageHost);
	// Setup
	const entries = Object.entries(tabs);
	const current = init?.default ?? entries[0][0];
	const args = init?.args ?? [];
	const transition = init?.transition;
	nav.setup(entries.map(([value, { tab }]) => ({ value, content: tab })));
	for (const [name, { content }] of entries) {
		pageHost.register(name, content);
	}
	nav.value = current;
	pageHost.push(current, ...args);
	// Helper
	const getTransition = (name: string): PageTransitionType | undefined => {
		if (transition !== 'slide') return transition;
		const page = pageHost.current;
		const index = entries.findIndex(([n]) => n === name);
		const cur = entries.findIndex(([_, { content }]) => page instanceof content);
		return index >= cur ? 'slideFromRight' : 'slideFromLeft';
	};
	const pushPage = (name: string) => {
		pageHost.push(
			{ page: name, transition: getTransition(name) },
			...(args as any),
		);
	};
	// Event
	nav.on('change', (name) => {
		if (name === undefined) return;
		pushPage(name);
		init?.$change?.(name);
	});
	// API
	return {
		get nav() {
			return nav;
		},
		get pageHost(): TabsPrefabPageHost<T> {
			return pageHost;
		},
		get value(): (keyof T & string) | undefined {
			return nav.value;
		},
		set value(name: (keyof T & string) | undefined) {
			nav.value = name;
			if (name === undefined) return;
			pushPage(name);
		},
		get current() {
			return pageHost.current;
		},
	};
}
