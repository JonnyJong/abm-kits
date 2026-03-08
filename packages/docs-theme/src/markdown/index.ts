import { fs, type PageHandler } from 'ezal';
import { EzalMarkdown, extractFrontmatter, plugins } from 'ezal-markdown';
import { codeblock } from './codeblock';
import { demo } from './demo';
import { fold } from './fold';
import { link } from './link';
import { tabs } from './tabs';

const renderer = new EzalMarkdown();

export async function markdownPageHandler(): Promise<PageHandler> {
	renderer.set(
		plugins.heading({ shiftLevels: true }),
		await codeblock(),
		tabs,
		fold,
		demo,
		link,
	);
	return {
		exts: '.md',
		async parser(src) {
			const file = await fs.readFile(src);
			if (file instanceof Error) return file;
			const frontmatter = await extractFrontmatter(file);
			const data = frontmatter?.data ?? {};
			const content = file.slice(frontmatter?.raw.length ?? 0);
			return { content, data };
		},
		async renderer(content, page) {
			const result = await renderer.renderHTML(content, {
				shared: { page } as any,
			});
			return { html: result.html, data: result.context };
		},
	};
}
