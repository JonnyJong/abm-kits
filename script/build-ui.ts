import path from 'node:path';
import { transform } from 'lightningcss';
import ts from 'typescript';
import { createProgram, report } from './ts.ts';

const PACKAGE = path.join(import.meta.dirname, '../packages/abm-ui');
const TSCONFIG = path.join(PACKAGE, 'tsconfig.json');

const CSS_TAGS: string[] = ['css', 'rawCss'];

function minifyCss(source: string): string {
	const { code } = transform({
		filename: 'index.ts',
		code: Buffer.from(source),
		minify: true,
		sourceMap: false,
	});
	const buffer = Buffer.from(code.buffer, code.byteOffset, code.byteLength);
	return buffer.toString('utf8');
}

function minifyCssParts(parts: string[]): string[] {
	const placeholders: string[] = [];
	const combined = parts.reduce((acc, part, index) => {
		if (index === parts.length - 1) return acc + part;
		const placeholder = `__VAR_${index}__`;
		placeholders.push(placeholder);
		return acc + part + placeholder;
	}, '');

	const minified = minifyCss(combined);

	const resultParts = [];
	let lastIndex = 0;
	for (const placeholder of placeholders) {
		const index = minified.indexOf(placeholder, lastIndex);
		if (index === -1) {
			console.warn('CSS Minification specific placeholder lost, using original.');
			return parts;
		}
		resultParts.push(minified.substring(lastIndex, index));
		lastIndex = index + placeholder.length;
	}
	resultParts.push(minified.substring(lastIndex));
	return resultParts;
}

function isCSSTagExpression(
	node: ts.Node,
): node is ts.TaggedTemplateExpression {
	if (!ts.isTaggedTemplateExpression(node)) return false;
	if (!ts.isIdentifier(node.tag)) return false;
	return CSS_TAGS.includes(node.tag.text);
}

function createCssMinifyTransformer(
	context: ts.TransformationContext,
): ts.CustomTransformer {
	const { factory } = context;

	const next = (node: ts.Node): ts.Node =>
		ts.visitEachChild(node, visitor, context);

	const visitor: ts.Visitor<ts.Node, ts.Node | undefined> = (node): ts.Node => {
		if (!isCSSTagExpression(node)) return next(node);

		const { template } = node;

		// 无插值
		if (ts.isNoSubstitutionTemplateLiteral(template)) {
			const rawText = template.text;
			const minifiedText = minifyCss(rawText);

			return factory.updateTaggedTemplateExpression(
				node,
				node.tag,
				node.typeArguments,
				factory.createNoSubstitutionTemplateLiteral(minifiedText),
			);
		}

		// 有插值
		const head = template.head.text;
		const spans = template.templateSpans;
		const parts = [head, ...spans.map((s) => s.literal.text)];

		const minifiedParts = minifyCssParts(parts);

		if (minifiedParts.length !== parts.length) return next(node);
		const newHead = factory.createTemplateHead(minifiedParts[0]);
		const newSpans = spans.map((span, i) => {
			const newText = minifiedParts[i + 1];
			const isLast = i === spans.length - 1;
			const newLiteral = isLast
				? factory.createTemplateTail(newText)
				: factory.createTemplateMiddle(newText);
			return factory.createTemplateSpan(span.expression, newLiteral);
		});

		return factory.updateTaggedTemplateExpression(
			node,
			node.tag,
			node.typeArguments,
			factory.createTemplateExpression(newHead, newSpans),
		);
	};

	return {
		transformSourceFile: (node) =>
			ts.visitNode<ts.SourceFile, ts.Node | undefined, ts.SourceFile>(
				node,
				visitor,
				ts.isSourceFile,
			) ?? node,
		transformBundle: (node) => node,
	};
}

function main() {
	const program = createProgram(TSCONFIG);

	const emitResult = program.emit(undefined, undefined, undefined, undefined, {
		before: [createCssMinifyTransformer],
	});

	const allDiagnostics = ts
		.getPreEmitDiagnostics(program)
		.concat(emitResult.diagnostics);
	report(...allDiagnostics);
}

main();
