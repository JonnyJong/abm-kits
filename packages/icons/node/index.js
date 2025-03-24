"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = require("node:http");
const node_1 = require("scc/dist/node");
const compiler_1 = require("./compiler");
const db_1 = require("./db");
const project_1 = require("./project");
const PORT = 5504;
const HOST = '127.0.0.1';
async function main() {
    await (0, db_1.initDB)();
    console.log('Start API Server...');
    const bridge = new node_1.Bridge(undefined, {
        getProjects: project_1.getProjects,
        createProject: project_1.createProject,
        getProject: project_1.getProject,
        writeProject: project_1.writeProject,
        deleteProject: project_1.deleteProject,
        listAvailableProjects: project_1.listAvailableProjects,
        queryIcon: db_1.queryIcon,
        getIcon: db_1.getIcon,
        getValues: db_1.getValues,
        compileProject: compiler_1.compileProject,
        compileAllIconForProject: compiler_1.compileAllIconForProject,
    });
    const server = (0, node_http_1.createServer)((req, res) => bridge.execute(req, res));
    server.listen(PORT, () => {
        console.log(`API Server is running at http://${HOST}:${PORT}`);
    });
}
main();
//# sourceMappingURL=index.js.map