import ts from 'typescript';

const PARSE_ERR = 'Failed to parse config file';

export function report(...diagnostics: ts.Diagnostic[]): void {
	for (const diagnostic of diagnostics) {
		if (!diagnostic.file) {
			console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
			continue;
		}
		const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
			diagnostic.start!,
		);
		const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
		console.log(
			`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`,
		);
	}
}

export function createProgram(tsconfig: string): ts.Program {
	const host: ts.ParseConfigFileHost = {
		...ts.sys,
		onUnRecoverableConfigFileDiagnostic: report,
	};
	const parsedCommandLine = ts.getParsedCommandLineOfConfigFile(
		tsconfig,
		{},
		host,
	);
	if (!parsedCommandLine) throw new Error(PARSE_ERR);

	if (parsedCommandLine.errors.length > 0) {
		report(...parsedCommandLine.errors);
		throw new Error(PARSE_ERR);
	}

	return ts.createProgram({
		rootNames: parsedCommandLine.fileNames,
		options: parsedCommandLine.options,
	});
}

export function createWatchProgram(
	tsconfig: string,
): ts.WatchOfConfigFile<ts.BuilderProgram> {
	const host = ts.createWatchCompilerHost(tsconfig, {}, ts.sys);
	return ts.createWatchProgram(host);
}
