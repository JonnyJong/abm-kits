"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileTypeScript = compileTypeScript;
const node_path_1 = __importDefault(require("node:path"));
const typescript_1 = __importDefault(require("typescript"));
function compileTypeScript(tsconfigPath, watch) {
    try {
        // 读取 tsconfig 文件
        const configFile = typescript_1.default.readConfigFile(tsconfigPath, typescript_1.default.sys.readFile);
        if (configFile.error) {
            throw configFile.error;
        }
        // 解析配置内容
        const config = typescript_1.default.parseJsonConfigFileContent(configFile.config, typescript_1.default.sys, node_path_1.default.dirname(tsconfigPath), undefined, tsconfigPath);
        if (config.errors.length > 0) {
            throw new TSAggregateError(config.errors);
        }
        // 处理监听模式
        if (watch) {
            createWatchCompiler(config);
        }
        else {
            performSingleCompilation(config);
        }
    }
    catch (error) {
        handleError(error, watch);
    }
}
function createWatchCompiler(config) {
    const host = typescript_1.default.createWatchCompilerHost(config.fileNames, config.options, typescript_1.default.sys, typescript_1.default.createEmitAndSemanticDiagnosticsBuilderProgram, reportDiagnostic, reportWatchStatus);
    typescript_1.default.createWatchProgram(host);
}
function performSingleCompilation(config) {
    const program = typescript_1.default.createProgram(config.fileNames, config.options);
    const emitResult = program.emit();
    const allDiagnostics = typescript_1.default
        .getPreEmitDiagnostics(program)
        .concat(emitResult.diagnostics);
    if (allDiagnostics.length > 0) {
        throw new TSAggregateError(allDiagnostics);
    }
}
function handleError(error, watch) {
    if (error instanceof TSAggregateError) {
        const diagnostics = Array.from(error.errors);
        const message = typescript_1.default.formatDiagnosticsWithColorAndContext(diagnostics, {
            getCurrentDirectory: () => process.cwd(),
            getCanonicalFileName: (fileName) => fileName,
            getNewLine: () => typescript_1.default.sys.newLine,
        });
        console.error(message);
    }
    else {
        console.error(error instanceof Error ? error.message : String(error));
    }
    if (!watch) {
        process.exit(1);
    }
}
// 监听模式专用的诊断报告
function reportDiagnostic(diagnostic) {
    const message = typescript_1.default.formatDiagnostic(diagnostic, {
        getCurrentDirectory: () => process.cwd(),
        getCanonicalFileName: (fileName) => fileName,
        getNewLine: () => typescript_1.default.sys.newLine,
    });
    console.error(message);
}
// 监听状态报告
function reportWatchStatus(diagnostic) {
    console.info(typescript_1.default.formatDiagnostic(diagnostic, {
        getCurrentDirectory: () => process.cwd(),
        getCanonicalFileName: (fileName) => fileName,
        getNewLine: () => typescript_1.default.sys.newLine,
    }));
}
// 聚合错误类型用于包装多个诊断信息
class TSAggregateError extends Error {
    errors;
    constructor(errors) {
        super(`Compilation failed with ${errors.length} errors`);
        this.errors = errors;
        this.name = 'AggregateError';
    }
}
