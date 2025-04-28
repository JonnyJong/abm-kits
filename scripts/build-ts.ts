import path from 'node:path';
import ts from 'typescript';

export function compileTypeScript(tsconfigPath: string, watch?: boolean): void {
	try {
		// 读取 tsconfig 文件
		const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
		if (configFile.error) {
			throw configFile.error;
		}

		// 解析配置内容
		const config = ts.parseJsonConfigFileContent(
			configFile.config,
			ts.sys,
			path.dirname(tsconfigPath),
			undefined,
			tsconfigPath,
		);

		if (config.errors.length > 0) {
			throw new TSAggregateError(config.errors);
		}

		// 处理监听模式
		if (watch) {
			createWatchCompiler(config);
		} else {
			performSingleCompilation(config);
		}
	} catch (error) {
		handleError(error, watch);
	}
}

function createWatchCompiler(config: ts.ParsedCommandLine) {
	const host = ts.createWatchCompilerHost(
		config.fileNames,
		config.options,
		ts.sys,
		ts.createEmitAndSemanticDiagnosticsBuilderProgram,
		reportDiagnostic,
		reportWatchStatus,
	);

	ts.createWatchProgram(host);
}

function performSingleCompilation(config: ts.ParsedCommandLine) {
	const program = ts.createProgram(config.fileNames, config.options);
	const emitResult = program.emit();

	const allDiagnostics = ts
		.getPreEmitDiagnostics(program)
		.concat(emitResult.diagnostics);

	if (allDiagnostics.length > 0) {
		throw new TSAggregateError(allDiagnostics);
	}
}

function handleError(error: unknown, watch?: boolean) {
	if (error instanceof TSAggregateError) {
		const diagnostics = Array.from(error.errors);
		const message = ts.formatDiagnosticsWithColorAndContext(diagnostics, {
			getCurrentDirectory: () => process.cwd(),
			getCanonicalFileName: (fileName) => fileName,
			getNewLine: () => ts.sys.newLine,
		});
		console.error(message);
	} else {
		console.error(error instanceof Error ? error.message : String(error));
	}

	if (!watch) {
		process.exit(1);
	}
}

// 监听模式专用的诊断报告
function reportDiagnostic(diagnostic: ts.Diagnostic) {
	const message = ts.formatDiagnostic(diagnostic, {
		getCurrentDirectory: () => process.cwd(),
		getCanonicalFileName: (fileName) => fileName,
		getNewLine: () => ts.sys.newLine,
	});
	console.error(message);
}

// 监听状态报告
function reportWatchStatus(diagnostic: ts.Diagnostic) {
	console.info(
		ts.formatDiagnostic(diagnostic, {
			getCurrentDirectory: () => process.cwd(),
			getCanonicalFileName: (fileName) => fileName,
			getNewLine: () => ts.sys.newLine,
		}),
	);
}

// 聚合错误类型用于包装多个诊断信息
class TSAggregateError extends Error {
	errors: readonly ts.Diagnostic[];
	constructor(errors: readonly ts.Diagnostic[]) {
		super(`Compilation failed with ${errors.length} errors`);
		this.errors = errors;
		this.name = 'AggregateError';
	}
}
