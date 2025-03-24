"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROJECT_ROOT = exports.DB = exports.ICONS = void 0;
const node_path_1 = __importDefault(require("node:path"));
exports.ICONS = node_path_1.default.join(__dirname, '../node_modules/@fluentui/svg-icons/icons');
exports.DB = node_path_1.default.join(__dirname, '../icons.sqlite');
exports.PROJECT_ROOT = node_path_1.default.join(__dirname, '../..');
//# sourceMappingURL=path.js.map