"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileStyle = compileStyle;
exports.compileStyleModule = compileStyleModule;
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const chokidar_1 = __importDefault(require("chokidar"));
const stylus_1 = __importDefault(require("stylus"));
const uglifycss_1 = __importDefault(require("uglifycss"));
const PATTERN_CSS_SELECTOR = /(?<=^|\}|,):host([^{,>]+?)(?=\{| |,|>)/g;
function redirect(task, sources) {
    if (!task.redirect)
        return sources;
    const result = new Set();
    for (const source of sources) {
        result.add(task.redirect(source));
    }
    return [...result];
}
function readdir(dir) {
    return (0, node_fs_1.readdirSync)(dir, { recursive: true, withFileTypes: true })
        .filter((dirent) => dirent.isFile() && node_path_1.default.extname(dirent.name) === '.styl')
        .map((dirent) => {
        const filepath = node_path_1.default.join(dirent.parentPath, dirent.name);
        return node_path_1.default.relative(dir, filepath);
    });
}
function writeFile(file, data) {
    const dir = node_path_1.default.dirname(file);
    if (!(0, node_fs_1.existsSync)(dir))
        (0, node_fs_1.mkdirSync)(dir, { recursive: true });
    (0, node_fs_1.writeFileSync)(file, data, 'utf8');
}
function compileStylusFile(stylusFile, dest, mod) {
    const stylusContent = (0, node_fs_1.readFileSync)(stylusFile, 'utf8');
    let css = stylus_1.default.render(stylusContent, {
        paths: [node_path_1.default.dirname(stylusFile)],
        filename: stylusFile,
    });
    css = uglifycss_1.default.processString(css);
    css = css.replace(PATTERN_CSS_SELECTOR, (raw, selector) => {
        if (typeof selector !== 'string')
            return raw;
        if (selector.startsWith('(') && selector.endsWith(')'))
            return raw;
        return `:host(${selector})`;
    });
    if (mod) {
        css = `export default ${JSON.stringify(`*{box-sizing:border-box;}${css}`)};`;
    }
    writeFile(dest, css);
}
function debounce(fn, delay = 100) {
    let timer = null;
    return (...args) => {
        if (timer !== null)
            clearTimeout(timer);
        timer = setTimeout(() => {
            fn(...args);
            if (timer !== null)
                clearTimeout(timer);
            timer = null;
        }, delay);
    };
}
function toExt(filepath, ext) {
    const { dir, name } = node_path_1.default.parse(filepath);
    return node_path_1.default.join(dir, `${name}.${ext}`);
}
function compileStyle(task, watch) {
    if (!watch) {
        for (const file of redirect(task, readdir(task.root))) {
            compileStylusFile(node_path_1.default.join(task.root, file), toExt(node_path_1.default.join(task.dist, file), 'css'));
        }
        return;
    }
    const waitQueue = [];
    let processing = false;
    const process = debounce(() => {
        if (processing)
            return;
        processing = true;
        while (waitQueue.length > 0) {
            const file = waitQueue.pop();
            if (!file)
                break;
            console.log(`Updating ${file}`);
            compileStylusFile(node_path_1.default.join(task.root, file), toExt(node_path_1.default.join(task.dist, file), 'css'));
        }
        processing = false;
    });
    const watcher = chokidar_1.default.watch(task.root, { awaitWriteFinish: true });
    const handler = (file, stat) => {
        if (stat && !stat?.isFile())
            return;
        if (!file.endsWith('.styl'))
            return;
        const target = redirect(task, [node_path_1.default.relative(task.root, file)])[0];
        if (!waitQueue.includes(target))
            waitQueue.push(target);
        if (!processing)
            process();
    };
    watcher.on('ready', () => {
        watcher.on('add', handler).on('change', handler);
    });
}
function compileStyleModule(root, dist, watch) {
    if (!watch) {
        for (const file of readdir(root)) {
            compileStylusFile(node_path_1.default.join(root, file), toExt(node_path_1.default.join(dist, file), 'styl.js'), true);
        }
        return;
    }
    const watcher = chokidar_1.default.watch(root, { awaitWriteFinish: true });
    const handler = (file, stat) => {
        if (stat && !stat?.isFile())
            return;
        if (!file.endsWith('.styl'))
            return;
        console.log(`Updating ${file}`);
        compileStylusFile(file, toExt(node_path_1.default.join(dist, node_path_1.default.relative(root, file)), 'styl.js'), true);
    };
    watcher.on('ready', () => {
        watcher.on('add', handler).on('change', handler);
    });
}
