"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
exports.getProjects = getProjects;
exports.createProject = createProject;
exports.getProject = getProject;
exports.writeProject = writeProject;
exports.deleteProject = deleteProject;
exports.listAvailableProjects = listAvailableProjects;
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const typeorm_1 = require("typeorm");
const db_1 = require("./db");
const path_1 = require("./path");
let Project = class Project {
    name;
};
exports.Project = Project;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], Project.prototype, "name", void 0);
exports.Project = Project = __decorate([
    (0, typeorm_1.Entity)()
], Project);
function getProjects() {
    return (0, db_1.getDB)()
        .getRepository(Project)
        .find()
        .then((projects) => projects.map(({ name }) => name));
}
async function createProject(name) {
    const projects = (0, db_1.getDB)().getRepository(Project);
    if (await projects.findOne({ where: { name } }))
        return false;
    await projects.insert({ name });
    return true;
}
async function getProject(name) {
    const file = node_path_1.default.join(path_1.PROJECT_ROOT, name, 'icons.json');
    if (!(0, node_fs_1.existsSync)(file))
        return new Map();
    try {
        const data = await (0, promises_1.readFile)(file, 'utf8');
        return new Map(JSON.parse(data));
    }
    catch (error) {
        console.warn(`Failed to read project ${name}`);
        console.error(error);
        return new Map();
    }
}
function writeProject(name, icons) {
    return (0, promises_1.writeFile)(node_path_1.default.join(path_1.PROJECT_ROOT, name, 'icons.json'), JSON.stringify([...icons.entries()]), 'utf8');
}
async function deleteProject(name) {
    const file = node_path_1.default.join(path_1.PROJECT_ROOT, name, 'icons.json');
    if ((0, node_fs_1.existsSync)(file))
        await (0, promises_1.unlink)(file);
    await (0, db_1.getDB)().getRepository(Project).delete({ name });
}
async function listAvailableProjects() {
    const existing = await getProjects();
    return (await (0, promises_1.readdir)(path_1.PROJECT_ROOT, { withFileTypes: true }))
        .filter((dirent) => dirent.isDirectory() && !existing.includes(dirent.name))
        .map((dirent) => dirent.name);
}
//# sourceMappingURL=project.js.map