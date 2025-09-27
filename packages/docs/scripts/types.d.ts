import { LangCate } from './build/main';

export interface PageData {
	title: string;
	icon?: string;
	layout: string;
	order?: number;
	source: string[];
}

export interface PageRenderData extends PageData {
	lang: LangCate;
	language: string;
	languages: string[];
	languagesJS: string;
	localeJS: string;
	content: string;
	items: LangCate['items'];
}
