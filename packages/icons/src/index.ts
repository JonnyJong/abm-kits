import { createServer } from 'node:http';
import { Bridge, HandlerMap } from 'scc/dist/node';
import { APIMap } from '../types';
import { compileAllIconForProject, compileProject } from './compiler';
import { getIcon, getValues, initDB, queryIcon } from './db';
import {
	createProject,
	deleteProject,
	getProject,
	getProjects,
	listAvailableProjects,
	writeProject,
} from './project';

const PORT = 5504;
const HOST = '127.0.0.1';

async function main() {
	await initDB();

	console.log('Start API Server...');
	const bridge = new Bridge<HandlerMap<APIMap>>(undefined, {
		getProjects,
		createProject,
		getProject,
		writeProject,
		deleteProject,
		listAvailableProjects,
		queryIcon,
		getIcon,
		getValues,
		compileProject,
		compileAllIconForProject,
	});
	const server = createServer((req, res) => bridge.execute(req, res));
	server.listen(PORT, () => {
		console.log(`API Server is running at http://${HOST}:${PORT}`);
	});
}

main();
