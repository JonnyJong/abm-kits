"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileProject = compileProject;
exports.compileAllIconForProject = compileAllIconForProject;
const node_fs_1 = require("node:fs");
const node_fs_2 = require("node:fs");
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const cli_progress_1 = __importDefault(require("cli-progress"));
const svg2ttf_1 = __importDefault(require("svg2ttf"));
const ttf2woff_1 = __importDefault(require("ttf2woff"));
const db_1 = require("./db");
const path_1 = require("./path");
const project_1 = require("./project");
const UNICODE_RANGE = [
    [0xe000, 0xf8ff],
    [0xf0000, 0x10ffff],
];
function generateUnicode() {
    let i = UNICODE_RANGE[0][0];
    let range = 0;
    return () => {
        const result = [String.fromCharCode(i), i];
        if (i >= 0x10000)
            result[0] += ' ';
        i++;
        if (i <= UNICODE_RANGE[range][1])
            return result;
        range++;
        if (range > UNICODE_RANGE.length)
            throw new Error('Unicode range exceeded');
        i = UNICODE_RANGE[range][0];
        return result;
    };
}
function pushIcon(file, unicode, id, fontStream) {
    const glyph = (0, node_fs_2.createReadStream)(node_path_1.default.join(path_1.ICONS, file));
    glyph.metadata = {
        unicode: [unicode()[0]],
        name: id,
    };
    fontStream.write(glyph);
    return new Promise((resolve, reject) => {
        glyph.on('end', resolve);
        glyph.on('error', reject);
    });
}
async function compileSVG(svgPath, icons) {
    const { SVGIcons2SVGFontStream } = await import('svgicons2svgfont');
    const fontStream = new SVGIcons2SVGFontStream({
        fontName: 'icon',
        fontId: 'icon',
        fontHeight: 1000,
        normalize: true,
        descent: 150,
    });
    const writeStream = (0, node_fs_2.createWriteStream)(svgPath);
    fontStream.pipe(writeStream);
    const progress = new cli_progress_1.default.SingleBar({ fps: 2 }, cli_progress_1.default.Presets.rect);
    progress.start(icons.length, 0);
    let i = 0;
    const unicode = generateUnicode();
    for (const [file, id] of icons) {
        await pushIcon(file, unicode, id, fontStream);
        progress.update(++i);
    }
    fontStream.end();
    progress.stop();
    return new Promise((resolve, reject) => {
        writeStream.on('close', resolve);
        writeStream.on('error', reject);
        fontStream.on('error', reject);
    });
}
async function generateTTF(ttfPath, svgPath) {
    const ttf = (0, svg2ttf_1.default)(await (0, promises_1.readFile)(svgPath, 'utf8'));
    const buffer = Buffer.from(ttf.buffer);
    await (0, promises_1.writeFile)(ttfPath, Buffer.from(ttf.buffer));
    return buffer;
}
function generateWOFF(woffPath, buffer) {
    const woff = (0, ttf2woff_1.default)(buffer);
    return (0, promises_1.writeFile)(woffPath, woff);
}
async function generateWOFF2(woff2Path, buffer) {
    const ttf2woff2 = (await import('ttf2woff2')).default;
    const woff2 = ttf2woff2(buffer);
    return (0, promises_1.writeFile)(woff2Path, woff2);
}
function generateCSS(cssPath, icons) {
    const hash = Date.now().toString(36);
    const stream = (0, node_fs_2.createWriteStream)(cssPath, 'utf8');
    const promise = new Promise((resolve, reject) => {
        stream.on('close', resolve);
        stream.on('error', reject);
    });
    stream.write(`@font-face{font-family:'icon';src:`);
    stream.write([
        `url('./icon.woff2?${hash}') format('woff2')`,
        `url('./icon.woff?${hash}') format('woff')`,
        `url('./icon.ttf?${hash}') format('truetype')`,
        `url('./icon.svg?${hash}') format('svg')`,
    ].join(','));
    stream.write(`;font-weight:normal;font-style:normal;font-display:swap;}[class*='icon-']{font-family:'icon'!important;speak:never;font-style:normal;font-weight:normal;font-variant:normal;text-transform:none;line-height:1;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}`);
    const progress = new cli_progress_1.default.SingleBar({ fps: 2 }, cli_progress_1.default.Presets.rect);
    progress.start(icons.length, 0);
    let i = 0;
    const unicode = generateUnicode();
    for (const [_, id] of icons) {
        stream.write(`.icon-${id}:before{content:'\\${unicode()[1].toString(16)}';}`);
        progress.update(++i);
    }
    stream.close();
    progress.stop();
    return promise;
}
async function compileIcons(name, icons) {
    const dir = node_path_1.default.join(path_1.PROJECT_ROOT, name, 'assets');
    const svg = node_path_1.default.join(dir, 'icon.svg');
    const ttf = node_path_1.default.join(dir, 'icon.ttf');
    const woff = node_path_1.default.join(dir, 'icon.woff');
    const woff2 = node_path_1.default.join(dir, 'icon.woff2');
    const css = node_path_1.default.join(dir, 'icon.css');
    if (!(0, node_fs_1.existsSync)(dir))
        await (0, promises_1.mkdir)(dir, { recursive: true });
    try {
        console.log(`Compiling svg for ${name}`);
        await compileSVG(svg, icons);
        console.log(`Generating ttf for ${name}`);
        const buffer = await generateTTF(ttf, svg);
        console.log(`Generating woff for ${name}`);
        await generateWOFF(woff, buffer);
        console.log(`Generating woff2 for ${name}`);
        await generateWOFF2(woff2, buffer);
        console.log(`Generating css for ${name}`);
        await generateCSS(css, icons);
        console.log(`Success for ${name}`);
    }
    catch (error) {
        console.error(error);
    }
}
function checkProjectAvailable(name) {
    const dir = node_path_1.default.join(path_1.PROJECT_ROOT, name);
    return (0, node_fs_1.existsSync)(dir);
}
const compiling = new Map();
async function executeCompile(name) {
    if (!checkProjectAvailable(name))
        return false;
    const icons = [...(await (0, project_1.getProject)(name)).entries()].map(([file, { id }]) => [file, id]);
    await compileIcons(name, icons);
    compiling.delete(name);
    return true;
}
async function executeCompileAll(name) {
    if (!checkProjectAvailable(name))
        return false;
    const icons = await (0, db_1.getAllIcons)();
    await compileIcons(name, icons);
    compiling.delete(name);
    return true;
}
function compileProject(name) {
    let compiler = compiling.get(name);
    if (compiler)
        return;
    compiler = executeCompile(name);
    compiling.set(name, compiler);
    return;
}
function compileAllIconForProject(name) {
    let compiler = compiling.get(name);
    if (compiler)
        return;
    compiler = executeCompileAll(name);
    compiling.set(name, compiler);
    return;
}
//# sourceMappingURL=compiler.js.map