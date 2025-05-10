"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileTypeScript = compileTypeScript;
const node_fs_1 = require("node:fs");
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
        // 获取 rootDir 和 outDir
        const rootDir = config.options.rootDir || 'src';
        const outDir = config.options.outDir || 'dist';
        // 处理监听模式
        if (watch) {
            createWatchCompiler(config);
        }
        else {
            performSingleCompilation(config, rootDir, outDir);
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
function performSingleCompilation(config, rootDir, outDir) {
    const program = typescript_1.default.createProgram(config.fileNames, config.options);
    const emitResult = program.emit();
    const allDiagnostics = typescript_1.default
        .getPreEmitDiagnostics(program)
        .concat(emitResult.diagnostics);
    if (allDiagnostics.length > 0) {
        throw new TSAggregateError(allDiagnostics);
    }
    // 新增逻辑：复制 .d.ts 文件到输出目录
    copyDeclarationFiles(rootDir, outDir);
}
// 新增函数：复制 .d.ts 文件到输出目录
function copyDeclarationFiles(rootDir, outDir) {
    // 查找所有 .d.ts 文件
    const dtsFiles = typescript_1.default.sys.readDirectory(node_path_1.default.resolve(rootDir), ['.d.ts'], undefined, undefined);
    console.log(rootDir, outDir, dtsFiles);
    // 复制 .d.ts 文件到输出目录
    for (const filePath of dtsFiles) {
        const relativePath = node_path_1.default.relative(rootDir, filePath);
        const targetPath = node_path_1.default.join(outDir, relativePath);
        const targetDir = node_path_1.default.dirname(targetPath);
        // 确保目标目录存在
        if (!(0, node_fs_1.existsSync)(targetDir)) {
            (0, node_fs_1.mkdirSync)(targetDir, { recursive: true });
        }
        // 复制文件
        (0, node_fs_1.copyFileSync)(filePath, targetPath);
        console.log(`Copied declaration file: ${filePath} -> ${targetPath}`);
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
