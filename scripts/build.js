"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const build_style_1 = require("./build-style");
const build_ts_1 = require("./build-ts");
const PKGS_ROOT = node_path_1.default.join(__dirname, '../packages');
const BUILD_ORDER = ['utils', 'ui', 'scc', 'icons'];
const TASKS = {
    utils: {
        ts: [
            node_path_1.default.join(PKGS_ROOT, 'abm-utils/tsconfig.json'),
            node_path_1.default.join(PKGS_ROOT, 'abm-utils/tsconfig.browser.json'),
        ],
    },
    ui: {
        ts: [node_path_1.default.join(PKGS_ROOT, 'abm-ui/tsconfig.json')],
        style: [
            {
                root: node_path_1.default.join(PKGS_ROOT, 'abm-ui/src/styles'),
                dist: node_path_1.default.join(PKGS_ROOT, 'abm-ui/dist/styles'),
                redirect(file) {
                    if (file === 'var.styl')
                        return file;
                    return 'main.styl';
                },
            },
        ],
        styleModule: [
            [
                node_path_1.default.join(PKGS_ROOT, 'abm-ui/src/components/widgets'),
                node_path_1.default.join(PKGS_ROOT, 'abm-ui/dist/components/widgets'),
            ],
        ],
    },
    scc: {
        ts: [
            node_path_1.default.join(PKGS_ROOT, 'scc/tsconfig.json'),
            node_path_1.default.join(PKGS_ROOT, 'scc/tsconfig.browser.json'),
            node_path_1.default.join(PKGS_ROOT, 'scc/tsconfig.node.json'),
        ],
    },
    icons: {
        ts: [node_path_1.default.join(PKGS_ROOT, 'icons/tsconfig.json')],
    },
};
function checkArg(argv, inputs) {
    for (const arg of argv) {
        if (inputs.includes(arg))
            return true;
    }
    return false;
}
function resolveArgv() {
    const i = process.argv.indexOf(__filename.slice(0, -3)) + 1;
    if (i === process.argv.length)
        return { targets: ['utils', 'ui'], watch: false };
    const inputs = process.argv.slice(i).map((v) => v.toLowerCase());
    const targets = [];
    for (const target of BUILD_ORDER) {
        if (inputs.includes(target))
            targets.push(target);
    }
    if (targets.length === 0)
        targets.push('utils', 'ui');
    const watch = checkArg(['-w', '--watch'], inputs);
    return { targets, watch };
}
function main() {
    const { targets, watch } = resolveArgv();
    const type = watch ? 'Start watching' : 'Compiling';
    for (const target of targets) {
        console.log(`Start ${watch ? 'watching' : 'compiling'} ${target}`);
        const pkg = TASKS[target];
        for (const tsconfigPath of pkg.ts ?? []) {
            console.log(`${type} ts project: ${tsconfigPath}`);
            (0, build_ts_1.compileTypeScript)(tsconfigPath, watch);
        }
        for (const styleTask of pkg.style ?? []) {
            console.log(`${type} styles: ${styleTask.root}`);
            (0, build_style_1.compileStyle)(styleTask, watch);
        }
        for (const [root, dist] of pkg.styleModule ?? []) {
            console.log(`${type} styles : ${root}`);
            (0, build_style_1.compileStyleModule)(root, dist, watch);
        }
    }
    console.log('Ready!');
}
main();
