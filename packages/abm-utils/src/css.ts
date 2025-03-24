export function css(text: string) {
	const sheet = new CSSStyleSheet();
	sheet.replaceSync(text);
	return sheet;
}
